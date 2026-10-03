CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- First signed-in user to call this becomes admin (only while no admin exists)
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN public.has_role(auth.uid(), 'admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

-- rateios
DROP POLICY "Anyone can insert rateios" ON public.rateios;
DROP POLICY "Anyone can update rateios" ON public.rateios;
DROP POLICY "Anyone can delete rateios" ON public.rateios;
CREATE POLICY "Admins insert rateios" ON public.rateios FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update rateios" ON public.rateios FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete rateios" ON public.rateios FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- participants
DROP POLICY "Anyone can view participants" ON public.participants;
DROP POLICY "Anyone can insert participants" ON public.participants;
DROP POLICY "Anyone can update participants" ON public.participants;
DROP POLICY "Anyone can delete participants" ON public.participants;
CREATE POLICY "Visitors can join open rateios" ON public.participants FOR INSERT TO anon, authenticated
  WITH CHECK (payment_confirmed = false AND receipt_url IS NULL AND rateio_id IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.rateios r WHERE r.id = rateio_id AND r.status = 'open'));
CREATE POLICY "Admins view participants" ON public.participants FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update participants" ON public.participants FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete participants" ON public.participants FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Public, masked participant list
CREATE OR REPLACE FUNCTION public.get_public_participants(_rateio_id uuid)
RETURNS TABLE (id uuid, percent numeric, payment_confirmed boolean, receipt_url text, email text, phone text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.percent, p.payment_confirmed,
    CASE WHEN p.receipt_url IS NULL THEN NULL ELSE 'sent' END,
    left(split_part(p.email, '@', 1), 3) || '@' || split_part(p.email, '@', 2),
    right(regexp_replace(p.phone, '\D', '', 'g'), 2)
  FROM public.participants p WHERE p.rateio_id = _rateio_id ORDER BY p.created_at
$$;
GRANT EXECUTE ON FUNCTION public.get_public_participants(uuid) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.participant_can_upload_receipt(_name text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.participants p
    WHERE p.id::text = split_part(split_part(_name, '/', 1), '.', 1) AND p.receipt_url IS NULL)
$$;
GRANT EXECUTE ON FUNCTION public.participant_can_upload_receipt(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_participant_receipt(_participant_id uuid, _path text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF split_part(_path, '.', 1) <> _participant_id::text OR _path !~ '^[0-9a-f-]{36}\.[A-Za-z0-9]{1,5}$' THEN
    RETURN false;
  END IF;
  UPDATE public.participants
    SET receipt_url = current_setting('app.receipts_base', true)
    WHERE false;
  UPDATE public.participants
    SET receipt_url = 'https://vqmibmjsgvybndcikvdr.supabase.co/storage/v1/object/public/receipts/' || _path
    WHERE id = _participant_id AND receipt_url IS NULL;
  RETURN FOUND;
END $$;
GRANT EXECUTE ON FUNCTION public.set_participant_receipt(uuid, text) TO anon, authenticated;

-- interests
DROP POLICY "Anyone can view interests" ON public.rateio_interests;
DROP POLICY "Anyone can insert interests" ON public.rateio_interests;
DROP POLICY "Anyone can update interests" ON public.rateio_interests;
DROP POLICY "Anyone can delete interests" ON public.rateio_interests;
CREATE POLICY "Visitors can send interest" ON public.rateio_interests FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Admins view interests" ON public.rateio_interests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update interests" ON public.rateio_interests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete interests" ON public.rateio_interests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- storage
DROP POLICY "Anyone can upload rateio photos" ON storage.objects;
DROP POLICY "Anyone can view rateio photos" ON storage.objects;
DROP POLICY "Anyone can upload receipts" ON storage.objects;
DROP POLICY "Anyone can view receipts" ON storage.objects;
CREATE POLICY "Admins upload rateio photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rateio-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Participants upload own receipt" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'receipts' AND public.participant_can_upload_receipt(name));
CREATE POLICY "Admins view receipts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id IN ('receipts','rateio-photos') AND public.has_role(auth.uid(), 'admin'));