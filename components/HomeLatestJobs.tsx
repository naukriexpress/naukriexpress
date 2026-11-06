"use client";

import CompactJobRow from "@/components/CompactJobRow";
import type { JobPosting } from "@/lib/types";

/**
 * Keep the Latest Job Updates heading as a section marker on the homepage.
 * The job cards, pagination and View All block are intentionally omitted.
 */
export default function HomeLatestJobs(_props: {
  sourceJobs: JobPosting[] | null;
  loadFailed: boolean;
}) {
  const jobs = _props.sourceJobs;

  return (
    <section
      id="latest-job-updates"
      className="container-page mt-6 scroll-mt-24 sm:mt-8"
      aria-labelledby="latest-job-updates-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id="latest-job-updates-heading"
          className="font-display text-xl font-bold text-ink-900 sm:text-2xl"
        >
          Latest Job Updates
        </h2>
        <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          {jobs ? `${jobs.length} Jobs` : "Loading…"}
        </span>
      </div>

      {jobs === null ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[58px] animate-pulse rounded-xl border border-ink-900/10 bg-brand-50" />
          ))}
        </div>
      ) : _props.loadFailed ? (
        <div className="rounded-2xl border border-ink-900/10 bg-white p-6 text-center shadow-card">
          <h3 className="font-semibold text-ink-900">Job updates are temporarily unavailable.</h3>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-ink-900/10 bg-white p-6 shadow-card">
          <h3 className="text-lg font-semibold text-ink-900">No Job Recruitment Available</h3>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => (
            <CompactJobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
}
