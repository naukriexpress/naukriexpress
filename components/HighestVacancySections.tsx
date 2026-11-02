"use client";

import { useEffect, useState } from "react";
import type { JobPosting } from "@/lib/types";
import HighestVacancyJobs from "./HighestVacancyJobs";
import HighestVacancyApprentice from "./HighestVacancyApprentice";

// Both highlight sections share one cached request and become visible together.
const JOBS_ENDPOINT = "/api/jobs?status=published&sort=latest&page=1&pageSize=500";

export default function HighestVacancySections() {
  const [jobs, setJobs] = useState<JobPosting[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetch(JOBS_ENDPOINT, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load vacancy highlights");
        return response.json();
      })
      .then((result: { data?: JobPosting[] }) => {
        if (!Array.isArray(result.data)) throw new Error("Unexpected jobs response");
        setJobs(result.data);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") setLoadFailed(true);
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      <HighestVacancyJobs jobs={jobs} loadFailed={loadFailed} />
      <HighestVacancyApprentice jobs={jobs} loadFailed={loadFailed} />
    </>
  );
}
