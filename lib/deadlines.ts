import type { JobPosting } from "./types";

export function effectiveLastDate(job: Pick<JobPosting, "dates">): string {
  return job.dates.extendedLastDate || job.dates.lastDate;
}
