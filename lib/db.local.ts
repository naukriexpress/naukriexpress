import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import type { JobFilters, JobPosting } from "./types";

// NOTE: This is a file-backed store used so the site works immediately with
// zero external setup. Every read/write is centralized here and all
// filtering happens in `queryJobs`, which runs on the server (API routes /
// server components) - never in the browser. To move to Postgres/Supabase,
// replace the internals of this file with SQL queries; keep the exported
// function signatures identical and nothing else in the app needs to change.
// See schema.sql for the equivalent relational schema + indexes.

const DATA_FILE = path.join(process.cwd(), "data", "jobs.json");

function readAll(): JobPosting[] {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as JobPosting[];
}

function writeAll(jobs: JobPosting[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), "utf-8");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function ensureUniqueSlug(base: string, excludeId?: string): string {
  const jobs = readAll();
  let slug = base;
  let i = 2;
  while (jobs.some((j) => j.slug === slug && j.id !== excludeId)) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}

/** Resolve draft/scheduled/expired status against real-world dates. */
function resolveEffectiveStatus(job: JobPosting): JobPosting["status"] {
  const now = new Date();
  if (job.status === "draft") return "draft";
  if (job.status === "scheduled") {
    if (job.publishAt && new Date(job.publishAt) > now) return "scheduled";
  }
  const lastDate = new Date(job.dates.lastDate);
  // Treat "expired" as end-of-day on the last date.
  lastDate.setHours(23, 59, 59, 999);
  if (lastDate < now) return "expired";
  return "published";
}

export function getAllJobsRaw(): JobPosting[] {
  return readAll();
}

export function getJobById(id: string): JobPosting | undefined {
  return readAll().find((j) => j.id === id);
}

export function getJobBySlug(slug: string): JobPosting | undefined {
  return readAll().find((j) => j.slug === slug);
}

export function incrementViews(id: string) {
  const jobs = readAll();
  const job = jobs.find((j) => j.id === id);
  if (job) {
    job.views = (job.views ?? 0) + 1;
    writeAll(jobs);
  }
}

/**
 * The core eligibility + filter query. All matching happens here on the
 * server so the client never has to download the full job list to filter it.
 */
export function queryJobs(filters: JobFilters): {
  results: JobPosting[];
  total: number;
} {
  let jobs = readAll().map((j) => ({ ...j, status: resolveEffectiveStatus(j) }));

  // By default only show live, published jobs to public-facing queries.
  const wantedStatus = filters.status ?? "published";
  if (wantedStatus !== "all") {
    jobs = jobs.filter((j) => j.status === wantedStatus);
  }

  if (filters.featuredOnly) {
    jobs = jobs.filter((j) => j.featured);
  }

  if (filters.q && filters.q.trim()) {
    const q = filters.q.trim().toLowerCase();
    jobs = jobs.filter((j) =>
      [j.title, j.organization, j.department, j.advertisementNumber]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  // Gender eligibility matching.
  if (filters.gender && filters.gender !== "all") {
    if (filters.gender === "male") {
      jobs = jobs.filter((j) => j.eligibility.genders.includes("male"));
    } else if (filters.gender === "female") {
      jobs = jobs.filter((j) => j.eligibility.genders.includes("female"));
    } else if (filters.gender === "both") {
      jobs = jobs.filter(
        (j) =>
          j.eligibility.genders.includes("male") &&
          j.eligibility.genders.includes("female")
      );
    }
  }

  // Category: job must be eligible for EVERY category the user selected
  // (matches the spec: Female + SC means both conditions must hold).
  if (filters.categories && filters.categories.length > 0) {
    jobs = jobs.filter((j) =>
      filters.categories!.every((c) => j.eligibility.categories.includes(c))
    );
  }

  // Qualification: job must match at least one selected qualification.
  if (filters.qualifications && filters.qualifications.length > 0) {
    jobs = jobs.filter((j) =>
      filters.qualifications!.some((q) =>
        j.eligibility.qualifications.includes(q)
      )
    );
  }

  if (filters.jobType && filters.jobType.length > 0) {
    jobs = jobs.filter((j) => filters.jobType!.includes(j.jobType));
  }

  if (filters.state && filters.state !== "all") {
    jobs = jobs.filter(
      (j) => j.location.allIndia || j.location.state === filters.state
    );
  }

  if (filters.district) {
    jobs = jobs.filter((j) => j.location.district === filters.district);
  }

  if (filters.minAge !== undefined) {
    jobs = jobs.filter(
      (j) =>
        j.eligibility.maxAge === undefined ||
        j.eligibility.maxAge >= filters.minAge!
    );
  }
  if (filters.maxAge !== undefined) {
    jobs = jobs.filter(
      (j) =>
        j.eligibility.minAge === undefined ||
        j.eligibility.minAge <= filters.maxAge!
    );
  }

  if (filters.lastDate) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setHours(23, 59, 59, 999);
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const endOfMonth = new Date(startOfToday);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    jobs = jobs.filter((j) => {
      const ld = new Date(j.dates.lastDate);
      if (filters.lastDate === "today") return ld >= startOfToday && ld <= endOfToday;
      if (filters.lastDate === "week") return ld >= startOfToday && ld <= endOfWeek;
      if (filters.lastDate === "month") return ld >= startOfToday && ld <= endOfMonth;
      if (filters.lastDate === "upcoming") return ld > endOfMonth;
      return true;
    });
  }

  // Sorting
  const sort = filters.sort ?? "latest";
  jobs.sort((a, b) => {
    if (sort === "closing_soon") {
      return new Date(a.dates.lastDate).getTime() - new Date(b.dates.lastDate).getTime();
    }
    if (sort === "most_viewed") {
      return (b.views ?? 0) - (a.views ?? 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = jobs.length;
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const start = (page - 1) * pageSize;
  const results = jobs.slice(start, start + pageSize);

  return { results, total };
}

export function getStats() {
  const jobs = readAll().map((j) => ({ ...j, status: resolveEffectiveStatus(j) }));
  const totalPublished = jobs.filter((j) => j.status === "published").length;
  const active = jobs.filter((j) => j.status === "published").length;
  const expired = jobs.filter((j) => j.status === "expired").length;
  const draft = jobs.filter((j) => j.status === "draft" || j.status === "scheduled").length;
  const mostViewed = [...jobs].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  const endingSoon = jobs
    .filter((j) => j.status === "published")
    .sort((a, b) => new Date(a.dates.lastDate).getTime() - new Date(b.dates.lastDate).getTime())
    .slice(0, 5);
  const totalVisitors = jobs.reduce((sum, j) => sum + (j.views ?? 0), 0) + 18342; // baseline demo traffic

  return { totalPublished, active, expired, draft, mostViewed, endingSoon, totalVisitors, totalJobs: jobs.length };
}

export function createJob(
  input: Omit<JobPosting, "id" | "slug" | "createdAt" | "updatedAt" | "views">
): JobPosting {
  const jobs = readAll();
  const id = nanoid(10);
  const baseSlug = slugify(`${input.title}-${input.organization}`);
  const slug = ensureUniqueSlug(baseSlug);
  const now = new Date().toISOString();
  const job: JobPosting = {
    ...input,
    id,
    slug,
    views: 0,
    createdAt: now,
    updatedAt: now,
  };
  jobs.unshift(job);
  writeAll(jobs);
  return job;
}

export function updateJob(id: string, input: Partial<JobPosting>): JobPosting | undefined {
  const jobs = readAll();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return undefined;

  let nextSlug = jobs[idx].slug;
  if (input.title && input.title !== jobs[idx].title) {
    const base = slugify(`${input.title}-${jobs[idx].organization}`);
    nextSlug = ensureUniqueSlug(base, id);
  }

  const updated: JobPosting = {
    ...jobs[idx],
    ...input,
    slug: nextSlug,
    updatedAt: new Date().toISOString(),
  };
  jobs[idx] = updated;
  writeAll(jobs);
  return updated;
}

export function deleteJob(id: string): boolean {
  const jobs = readAll();
  const next = jobs.filter((j) => j.id !== id);
  const changed = next.length !== jobs.length;
  if (changed) writeAll(next);
  return changed;
}

export function getDistinctStates(): string[] {
  const jobs = readAll();
  const set = new Set<string>();
  jobs.forEach((j) => {
    if (!j.location.allIndia) set.add(j.location.state);
  });
  return Array.from(set).sort();
}
