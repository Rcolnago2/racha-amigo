
CREATE TABLE public.rateio_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rateio_id UUID NOT NULL REFERENCES public.rateios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.rateio_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interests" ON public.rateio_interests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert interests" ON public.rateio_interests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update interests" ON public.rateio_interests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete interests" ON public.rateio_interests FOR DELETE USING (true);
