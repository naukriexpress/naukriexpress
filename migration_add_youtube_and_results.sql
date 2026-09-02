-- ============================================================================
-- NaukriExpress — Migration: YouTube link on jobs + new Results module
-- ============================================================================
-- SAFE TO RUN ON YOUR LIVE SUPABASE DATABASE.
-- This script only ADDS things — it never drops or deletes any existing
-- table, column, or row. Every statement uses IF NOT EXISTS / IF EXISTS
-- guards, so it is also safe to run more than once by accident.
--
-- HOW TO RUN (Supabase):
--   1. Open your Supabase project -> SQL Editor -> New query
--   2. Paste this entire file
--   3. Click "Run"
--
-- What this does:
--   1. Adds an optional `youtube_url` column to the existing `jobs` table.
--   2. Creates a new `results` table (for the new Result module) — your
--      existing `jobs`, `admins`, `admit_cards`, and `tickers` tables and
--      all their data are completely untouched.
-- ============================================================================

-- 1. Optional YouTube link per job (nullable, existing jobs are unaffected).
alter table jobs
  add column if not exists youtube_url text;

-- 2. New Results module.
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  category text,
  result_date date,
  official_link text not null,
  status text not null default 'published', -- 'published' | 'draft'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_results_status on results (status);
create index if not exists idx_results_result_date on results (result_date);

-- Reuse the same updated_at trigger function that already exists in your
-- database (created by the original schema.sql) — not recreated here.
drop trigger if exists trg_results_updated_at on results;
create trigger trg_results_updated_at
before update on results
for each row execute function set_updated_at();
