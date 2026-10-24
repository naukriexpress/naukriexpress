-- The freeform Vacancy Details editor has been removed from the admin UI and public metadata.
-- Delete the legacy stored text and its column; structured post-wise vacancy rows remain.
ALTER TABLE public.jobs
  DROP COLUMN IF EXISTS content_vacancy_details;
