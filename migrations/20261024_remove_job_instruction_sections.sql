-- These three sections are no longer displayed or editable. Remove the stored content.
ALTER TABLE public.jobs
  DROP COLUMN IF EXISTS content_selection_process,
  DROP COLUMN IF EXISTS content_how_to_apply,
  DROP COLUMN IF EXISTS content_important_instructions;
