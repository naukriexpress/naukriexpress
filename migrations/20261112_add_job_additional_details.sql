ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS content_additional_details text;
