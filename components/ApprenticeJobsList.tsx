"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CompactJobRow from "@/components/CompactJobRow";
import type { JobPosting } from "@/lib/types";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";

function compareApprenticeDeadlines(a: JobPosting, b: JobPosting, today: string): number {
  const daysA = getDaysUntilDate(a.dates.lastDate, today);
  const daysB = getDaysUntilDate(b.dates.lastDate, today);

  // Records with a valid deadline come before records without one.
  if (daysA === null && daysB !== null) return 1;
  if (daysA !== null && daysB === null) return -1;

  if (daysA !== null && daysB !== null) {
    const activeA = daysA >= 0;
    const activeB = daysB >= 0;

    // Applications that are still open are listed first, by closest deadline.
    if (activeA !== activeB) return activeA ? -1 : 1;
    if (activeA && activeB && daysA !== daysB) return daysA - daysB;

    // If any published records have expired, keep them after open applications,
    // with the most recently expired records first.
    if (!activeA && !activeB && daysA !== daysB) return daysB - daysA;
  }

  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export default function ApprenticeJobsList() {
  const [jobs, setJobs] = useState<JobPosting[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAllApprentices() {
      const firstResponse = await fetch(
        "/api/jobs?status=published&sort=latest&page=1&pageSize=100&jobType=apprenticeship",
        { cache: "no-store", signal: controller.signal }
      );
      if (!firstResponse.ok) throw new Error("Apprentice jobs could not be loaded");
      const firstPage = await firstResponse.json() as { data?: JobPosting[]; total?: number; pageSize?: number };
      if (!Array.isArray(firstPage.data)) throw new Error("Unexpected jobs response");
      const total = Math.max(firstPage.total || firstPage.data.length, firstPage.data.length);
      const pageSize = Math.max(firstPage.pageSize || 100, 1);
      const pageCount = Math.ceil(total / pageSize);
      const laterPages = await Promise.all(
        Array.from({ length: Math.max(0, pageCount - 1) }, async (_, index) => {
          const page = index + 2;
          const response = await fetch(
            `/api/jobs?status=published&sort=latest&page=${page}&pageSize=${pageSize}&jobType=apprenticeship`,
            { cache: "no-store", signal: controller.signal }
          );
          if (!response.ok) throw new Error("Apprentice jobs could not be loaded");
          const result = await response.json() as { data?: JobPosting[] };
          if (!Array.isArray(result.data)) throw new Error("Unexpected jobs response");
          return result.data;
        })
      );
      const today = getIndiaTodayDate();
      setJobs([...firstPage.data, ...laterPages.flat()].sort((a, b) =>
        compareApprenticeDeadlines(a, b, today)
      ));
      setError(false);
    }

    void loadAllApprentices().catch((reason: unknown) => {
      if (reason instanceof Error && reason.name !== "AbortError") setError(true);
    });
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError") setError(true);
      });

    return () => controller.abort();
  }, [retry]);

  return (
    <section className="mt-6" aria-live="polite">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-700/70">
          {jobs ? `${jobs.length} apprentice recruitments` : error ? "Jobs could not be loaded" : "Loading apprentice recruitments…"}
        </p>
        <Link href="/jobs?jobType=apprenticeship" className="shrink-0 rounded-lg border border-brand-600 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-50">
          Browse in Jobs
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-ink-900/10 bg-white p-6 text-center shadow-card">
          <h2 className="font-semibold text-ink-900">Apprentice updates are temporarily unavailable.</h2>
          <p className="mt-1 text-sm text-ink-700/70">Page open ho gayi hai; data dobara try kar sakte hain.</p>
          <button type="button" onClick={() => { setError(false); setJobs(null); setRetry((value) => value + 1); }} className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
            Retry
          </button>
        </div>
      ) : jobs === null ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-[58px] animate-pulse rounded-xl border border-ink-900/10 bg-brand-50" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-ink-900/10 bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-ink-900">No Apprentice Recruitment Available</h2>
          <p className="mt-2 text-sm text-ink-700/70">Published Apprentice recruitments will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((job) => <CompactJobRow key={job.id} job={job} />)}
        </div>
      )}
    </section>
  );
}
