"use client";

import type { JobPosting } from "@/lib/types";

/**
 * Keep the Latest Job Updates heading as a section marker on the homepage.
 * The job cards, pagination and View All block are intentionally omitted.
 */
export default function HomeLatestJobs(_props: {
  sourceJobs: JobPosting[] | null;
  loadFailed: boolean;
}) {
  return (
    <section
      id="latest-job-updates"
      className="container-page mt-6 scroll-mt-24 sm:mt-8"
      aria-labelledby="latest-job-updates-heading"
    >
      <h2
        id="latest-job-updates-heading"
        className="font-display text-xl font-bold text-ink-900 sm:text-2xl"
      >
        Latest Job Updates
      </h2>
    </section>
  );
}
