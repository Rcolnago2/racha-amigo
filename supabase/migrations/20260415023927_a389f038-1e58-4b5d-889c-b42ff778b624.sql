
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  percent NUMERIC NOT NULL,
  value_brl NUMERIC NOT NULL,
  weight_kg NUMERIC NOT NULL,
  payment_confirmed BOOLEAN NOT NULL DEFAULT false,
  product_name TEXT NOT NULL DEFAULT 'Queijo Canastra Artesanal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert participants" ON public.participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete participants" ON public.participants FOR DELETE USING (true);
