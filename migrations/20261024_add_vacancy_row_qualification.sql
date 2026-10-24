-- Store the required educational/trade qualification for each vacancy row.
ALTER TABLE public.job_vacancy_rows
  ADD COLUMN IF NOT EXISTS qualification text;
