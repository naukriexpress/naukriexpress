import * as local from "./db.local";
import type { JobFilters, JobPosting } from "./types";

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

// --- Admit Cards ---
export async function getAllAdmitCards() {
  if (usePg()) return (await import("./db.pg")).getAllAdmitCards();
  return [];
}

export async function createAdmitCard(input: any) {
  if (usePg()) return (await import("./db.pg")).createAdmitCard(input);
  return null;
}

export async function updateAdmitCard(id: string, input: any) {
  if (usePg()) {
    const pg = await import("./db.pg");
    if (typeof (pg as any).updateAdmitCard === "function") {
      return (pg as any).updateAdmitCard(id, input);
    }
  }
  return null;
}

export async function deleteAdmitCard(id: string) {
  if (usePg()) {
    const pg = await import("./db.pg");
    if (typeof (pg as any).deleteAdmitCard === "function") {
      return (pg as any).deleteAdmitCard(id);
    }
  }
  return null;
}

// --- Tickers ---
export async function getAllTickers() {
  if (usePg()) return (await import("./db.pg")).getAllTickers();
  return [];
}

export async function createTicker(input: any) {
  if (usePg()) return (await import("./db.pg")).createTicker(input);
  return null;
}

export async function updateTicker(id: string, input: any) {
  if (usePg()) {
    const pg = await import("./db.pg");
    if (typeof (pg as any).updateTicker === "function") {
      return (pg as any).updateTicker(id, input);
    }
  }
  return null;
}

export async function deleteTicker(id: string) {
  if (usePg()) {
    const pg = await import("./db.pg");
    if (typeof (pg as any).deleteTicker === "function") {
      return (pg as any).deleteTicker(id);
    }
  }
  return null;
}

// --- Results ---
export async function getAllResults() {
  if (usePg()) return (await import("./db.pg")).getAllResults();
  return [];
}

export async function createResult(input: any) {
  if (usePg()) return (await import("./db.pg")).createResult(input);
  return null;
}

export async function updateResult(id: string, input: any) {
  if (usePg()) {
    const pg = await import("./db.pg");
    if (typeof (pg as any).updateResult === "function") {
      return (pg as any).updateResult(id, input);
    }
  }
  return null;
}

export async function deleteResult(id: string) {
  if (usePg()) {
    const pg = await import("./db.pg");
    if (typeof (pg as any).deleteResult === "function") {
      return (pg as any).deleteResult(id);
    }
  }
  return null;
}