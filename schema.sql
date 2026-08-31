-- BGI Job Update - Production PostgreSQL schema
-- Compatible with plain Postgres or Supabase.
-- Mirrors the shape used by lib/db.ts (JSON demo store) so migrating the
-- app is a matter of swapping the functions in lib/db.ts for SQL queries
-- against these tables; every field name below matches lib/types.ts.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

create type gender_t as enum ('male', 'female');
create type category_t as enum ('open', 'obc', 'sc', 'st', 'ews');
create type qualification_t as enum (
  '10th', '12th', 'iti', 'diploma', 'graduate', 'post_graduate',
  'engineering', 'law', 'medical', 'any_graduate'
);
create type job_type_t as enum ('government', 'private', 'contract', 'apprenticeship', 'internship');
create type job_status_t as enum ('draft', 'scheduled', 'published', 'expired');

create table admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,

  title text not null,
  organization text not null,
  department text,
  advertisement_number text,
  logo_url text,

  total_vacancies integer not null default 0,

  state text not null default 'All India',
  district text,
  all_india boolean not null default false,

  -- Eligibility (this is what the filter queries hit hardest)
  genders gender_t[] not null default '{male,female}',
  categories category_t[] not null default '{}',
  qualifications qualification_t[] not null default '{}',
  min_age smallint,
  max_age smallint,
  age_relaxation text,

  job_type job_type_t not null default 'government',
  salary text,
  application_fee text,

  start_date date,
  last_date date not null,
  exam_date date,

  apply_online_url text,
  official_notification_url text,
  official_website_url text,

  content_eligibility text,
  content_vacancy_details text,
  content_selection_process text,
  content_how_to_apply text,
  content_important_instructions text,

  seo_title text,
  seo_meta_description text,

  featured boolean not null default false,
  status job_status_t not null default 'draft',
  publish_at timestamptz,

  views integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table job_vacancy_rows (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  post text not null,
  category text, -- free-text breakup e.g. "Open: 40, OBC: 20"
  count integer not null default 0,
  sort_order integer not null default 0
);

-- Indexes tuned for the filter combinations used by lib/db.ts::queryJobs
create index idx_jobs_status on jobs (status);
create index idx_jobs_last_date on jobs (last_date);
create index idx_jobs_state on jobs (state);
create index idx_jobs_featured on jobs (featured) where featured = true;
create index idx_jobs_genders on jobs using gin (genders);
create index idx_jobs_categories on jobs using gin (categories);
create index idx_jobs_qualifications on jobs using gin (qualifications);
create index idx_jobs_title_trgm on jobs using gin (title gin_trgm_ops);
create index idx_vacancy_rows_job_id on job_vacancy_rows (job_id);

-- Example eligibility query equivalent to: Female + SC + Graduate, Maharashtra
-- select * from jobs
-- where status = 'published'
--   and 'female' = any(genders)
--   and categories @> array['sc']::category_t[]
--   and qualifications && array['graduate']::qualification_t[]
--   and (all_india or state = 'Maharashtra')
-- order by created_at desc;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_jobs_updated_at
before update on jobs
for each row execute function set_updated_at();
