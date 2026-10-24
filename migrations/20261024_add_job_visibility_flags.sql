-- Move operational state out of editable instruction content before removing those fields.
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS last_date_extended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notice_details_pending boolean NOT NULL DEFAULT false;

UPDATE public.jobs
SET
  last_date_extended = (
    COALESCE(content_important_instructions, '') LIKE '%[[LAST_DATE_EXTENDED]]%'
  ),
  notice_details_pending = (
    COALESCE(content_important_instructions, '') LIKE '%[[SSC_GD_NOTICE_PENDING]]%'
    OR COALESCE(content_important_instructions, '') LIKE '%[[VACANCY_DETAILS_PENDING]]%'
  );
