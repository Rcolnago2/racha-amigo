
-- Add receipt_url column to participants
ALTER TABLE public.participants ADD COLUMN receipt_url text;

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- Allow anyone to upload to receipts bucket
CREATE POLICY "Anyone can upload receipts" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'receipts');

-- Allow anyone to view receipts
CREATE POLICY "Anyone can view receipts" ON storage.objects FOR SELECT TO public USING (bucket_id = 'receipts');

-- Allow update on participants (for receipt_url and payment_confirmed)
CREATE POLICY "Anyone can update participants" ON public.participants FOR UPDATE TO public USING (true) WITH CHECK (true);
