"use client";

import { useEffect, useState } from "react";
import type { JobPosting } from "@/lib/types";
import HomeLatestJobs from "./HomeLatestJobs";
import HomepageQuickUpdates from "./HomepageQuickUpdates";

// Both vacancy highlights and Latest Job Updates reuse one cached homepage request.
const JOBS_PAGE_SIZE = 500;
const JOBS_ENDPOINT = `/api/jobs?status=published&sort=latest&page=1&pageSize=${JOBS_PAGE_SIZE}`;

export default function HighestVacancySections() {
  const [jobs, setJobs] = useState<JobPosting[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let firstPageLoaded = false;

    async function loadHomepageJobs() {
      try {
        const response = await fetch(JOBS_ENDPOINT, { signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load homepage jobs");

        const firstPage = (await response.json()) as {
          data?: JobPosting[];
          total?: number;
        };
        if (!Array.isArray(firstPage.data)) throw new Error("Unexpected jobs response");

        firstPageLoaded = true;
        // Render the highlight sections and Latest Job Updates from this same batch.
        setJobs(firstPage.data);

        const total = Number.isFinite(firstPage.total)
          ? Number(firstPage.total)
          : firstPage.data.length;
        const totalPages = Math.ceil(total / JOBS_PAGE_SIZE);
        if (totalPages <= 1) return;

        // Only fetch more if the published dataset exceeds the first 500 jobs.
        const remainingPages = await Promise.all(
          Array.from({ length: totalPages - 1 }, async (_, index) => {
            const page = index + 2;
            const pageResponse = await fetch(
              `/api/jobs?status=published&sort=latest&page=${page}&pageSize=${JOBS_PAGE_SIZE}`,
              { signal: controller.signal }
            );
            if (!pageResponse.ok) throw new Error("Unable to load the next homepage jobs batch");
            const pageResult = (await pageResponse.json()) as { data?: JobPosting[] };
            if (!Array.isArray(pageResult.data)) throw new Error("Unexpected jobs page response");
            return pageResult.data;
          })
        );

        if (!controller.signal.aborted) {
          setJobs([...firstPage.data, ...remainingPages.flat()]);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== "AbortError" && !firstPageLoaded) {
          setLoadFailed(true);
        }
      }
    }

    void loadHomepageJobs();
    return () => controller.abort();
  }, []);

  return (
    <>
      <div className="container-page mt-6 sm:mt-8">
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
          <div className="min-w-0">
            <HomeLatestJobs sourceJobs={jobs} loadFailed={loadFailed} />
          </div>
          <HomepageQuickUpdates />
        </div>
      </div>
    </>
  );
}
