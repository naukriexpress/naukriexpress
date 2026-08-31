import * as local from "./db.local";
import type { JobFilters, JobPosting } from "./types";

// Whenever DATABASE_URL is present (e.g. set in Vercel or .env.local from
// your Supabase connection string), every function below reads/writes
// PostgreSQL via lib/db.pg.ts, so jobs added through the admin panel persist
// permanently. Without it, the app transparently falls back to the local
// JSON file (lib/db.local.ts) so `npm run dev` still works immediately
// after a fresh unzip with zero setup.
//
// lib/db.pg.ts is only imported when actually needed (dynamic import) so
// the `pg` package and a live DATABASE_URL are never required just to run
// the app locally with the JSON store.

function usePg(): boolean {
  return !!process.env.DATABASE_URL;
}

export const slugify = local.slugify;

export async function getAllJobsRaw(): Promise<JobPosting[]> {
  if (usePg()) return (await import("./db.pg")).getAllJobsRaw();
  return local.getAllJobsRaw();
}

export async function getJobById(id: string): Promise<JobPosting | undefined> {
  if (usePg()) return (await import("./db.pg")).getJobById(id);
  return local.getJobById(id);
}

export async function getJobBySlug(slug: string): Promise<JobPosting | undefined> {
  if (usePg()) return (await import("./db.pg")).getJobBySlug(slug);
  return local.getJobBySlug(slug);
}

export async function incrementViews(id: string): Promise<void> {
  if (usePg()) return (await import("./db.pg")).incrementViews(id);
  return local.incrementViews(id);
}

export async function queryJobs(
  filters: JobFilters
): Promise<{ results: JobPosting[]; total: number }> {
  if (usePg()) return (await import("./db.pg")).queryJobs(filters);
  return local.queryJobs(filters);
}

export async function getStats() {
  if (usePg()) return (await import("./db.pg")).getStats();
  return local.getStats();
}

export async function createJob(
  input: Omit<JobPosting, "id" | "slug" | "createdAt" | "updatedAt" | "views">
): Promise<JobPosting> {
  if (usePg()) return (await import("./db.pg")).createJob(input);
  return local.createJob(input);
}

export async function updateJob(
  id: string,
  input: Partial<JobPosting>
): Promise<JobPosting | undefined> {
  if (usePg()) return (await import("./db.pg")).updateJob(id, input);
  return local.updateJob(id, input);
}

export async function deleteJob(id: string): Promise<boolean> {
  if (usePg()) return (await import("./db.pg")).deleteJob(id);
  return local.deleteJob(id);
}

export async function getDistinctStates(): Promise<string[]> {
  if (usePg()) return (await import("./db.pg")).getDistinctStates();
  return local.getDistinctStates();
}
