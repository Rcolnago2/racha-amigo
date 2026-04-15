
-- Create rateios table
CREATE TABLE public.rateios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  unit_type TEXT NOT NULL DEFAULT 'kg' CHECK (unit_type IN ('kg', 'litro', 'unidade')),
  total_quantity NUMERIC NOT NULL DEFAULT 1,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  admin_fee_percent NUMERIC NOT NULL DEFAULT 5,
  pix_key TEXT NOT NULL DEFAULT 'rcolnago+magie@gmail.com',
  pix_merchant_name TEXT NOT NULL DEFAULT 'COMPRA COLETIVA',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rateios ENABLE ROW LEVEL SECURITY;

-- Anyone can view rateios
CREATE POLICY "Anyone can view rateios" ON public.rateios FOR SELECT TO public USING (true);
-- Anyone can create rateios (admin password handled in app)
CREATE POLICY "Anyone can insert rateios" ON public.rateios FOR INSERT TO public WITH CHECK (true);
-- Anyone can update rateios
CREATE POLICY "Anyone can update rateios" ON public.rateios FOR UPDATE TO public USING (true) WITH CHECK (true);
-- Anyone can delete rateios
CREATE POLICY "Anyone can delete rateios" ON public.rateios FOR DELETE TO public USING (true);

-- Add rateio_id to participants
ALTER TABLE public.participants ADD COLUMN rateio_id UUID REFERENCES public.rateios(id) ON DELETE CASCADE;

-- Drop old product_name default since it's now per-rateio
ALTER TABLE public.participants ALTER COLUMN product_name DROP DEFAULT;

-- Create storage bucket for rateio photos
INSERT INTO storage.buckets (id, name, public) VALUES ('rateio-photos', 'rateio-photos', true);

-- Storage policies for rateio photos
CREATE POLICY "Anyone can upload rateio photos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'rateio-photos');
CREATE POLICY "Anyone can view rateio photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'rateio-photos');
