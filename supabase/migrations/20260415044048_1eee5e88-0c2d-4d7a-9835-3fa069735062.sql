
ALTER TABLE public.rateios ADD COLUMN slug text UNIQUE;
ALTER TABLE public.rateios ADD COLUMN visibility text NOT NULL DEFAULT 'public';

-- Backfill existing rateios with slug from id
UPDATE public.rateios SET slug = LEFT(id::text, 8) WHERE slug IS NULL;

-- Make slug NOT NULL after backfill
ALTER TABLE public.rateios ALTER COLUMN slug SET NOT NULL;
