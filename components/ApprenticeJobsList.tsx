"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import type { JobPosting } from "@/lib/types";

function JobCardSkeleton() {
  return (
    <article className="job-card-skeleton animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-200 sm:h-16 sm:w-16" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-4 w-2/3 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-[76px] rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
        <div className="h-10 rounded-lg bg-slate-100" />
        <div className="h-10 rounded-lg bg-slate-200" />
        <div className="h-10 rounded-lg bg-orange-100" />
      </div>
    </article>
  );
}

export default function ApprenticeJobsList() {
  const [jobs, setJobs] = useState<JobPosting[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/jobs?status=published&sort=latest&page=1&pageSize=100&jobType=apprenticeship", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Apprentice jobs could not be loaded");
        return response.json();
      })
      .then((result: { data?: JobPosting[] }) => {
        if (!Array.isArray(result.data)) throw new Error("Unexpected jobs response");
        setJobs(result.data);
        setError(false);
      })
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <JobCardSkeleton key={index} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-ink-900/10 bg-white p-6 shadow-card">
          <h2 className="text-lg font-semibold text-ink-900">No Apprentice Recruitment Available</h2>
          <p className="mt-2 text-sm text-ink-700/70">Published Apprentice recruitments will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </section>
  );
}
