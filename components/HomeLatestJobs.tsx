"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import type { JobPosting } from "@/lib/types";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";
import { hasPendingVacancyDetails } from "@/lib/jobMarkers";

const HOME_PAGE_SIZE = 12;

function isNoticeAwaited(job: JobPosting): boolean {
  return Boolean(job.noticeDetailsPending);
}

function getVerifiedVacancyCount(job: JobPosting): number {
  const pending = hasPendingVacancyDetails({
    noticeDetailsPending: job.noticeDetailsPending,
    totalVacancies: job.totalVacancies,
    vacancyBreakdownCounts: job.vacancyBreakdown.map((row) => row.count),
  });
  if (pending || isNoticeAwaited(job)) return 0;

  const rowTotal = job.vacancyBreakdown.reduce(
    (sum, row) => sum + Math.max(0, Number(row.count) || 0),
    0
  );
  return Math.max(Math.max(0, Number(job.totalVacancies) || 0), rowTotal);
}

function isClosingSoon(job: JobPosting, today: string): boolean {
  if (job.status !== "published" || isNoticeAwaited(job)) return false;
  const days = getDaysUntilDate(job.dates.lastDate, today);
  return days !== null && days >= 0 && days <= 7;
}

function sortPriorityJobs(jobs: JobPosting[], today: string): JobPosting[] {
  return [...jobs].sort((a, b) => {
    const urgentA = isClosingSoon(a, today);
    const urgentB = isClosingSoon(b, today);
    if (urgentA !== urgentB) return urgentA ? -1 : 1;

    if (urgentA && urgentB) {
      const daysA = getDaysUntilDate(a.dates.lastDate, today);
      const daysB = getDaysUntilDate(b.dates.lastDate, today);
      if (daysA !== null && daysB !== null && daysA !== daysB) {
        return daysA - daysB;
      }
    }

    const vacancyDifference = getVerifiedVacancyCount(b) - getVerifiedVacancyCount(a);
    if (vacancyDifference !== 0) return vacancyDifference;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function JobCardSkeleton() {
  return (
    <article className="job-card-skeleton rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-200 sm:h-16 sm:w-16" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-12 rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-9 rounded-lg bg-slate-100" />
        ))}
      </div>
    </article>
  );
}

export default function HomeLatestJobs({
  sourceJobs,
  loadFailed,
}: {
  sourceJobs: JobPosting[] | null;
  loadFailed: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reuse the exact same published-job batch that powers both Highest Vacancy
  // sections. Exclude the highlighted top 12 so homepage cards never duplicate.
  const jobs = useMemo(() => {
    if (!sourceJobs) return null;

    const today = getIndiaTodayDate();
    const highestVacancyIds = new Set(
      sourceJobs
        .filter((job) => {
          if (job.jobType === "apprenticeship") return false;
          if (job.status !== "published" || job.noticeDetailsPending) return false;
          const vacancies = getVerifiedVacancyCount(job);
          const daysLeft = getDaysUntilDate(job.dates.lastDate, today);
          return vacancies > 0 && daysLeft !== null && daysLeft >= 0;
        })
        .sort((a, b) => {
          const vacancyDifference = getVerifiedVacancyCount(b) - getVerifiedVacancyCount(a);
          if (vacancyDifference !== 0) return vacancyDifference;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 12)
        .map((job) => job.id)
    );

    const latestJobs = sourceJobs.filter(
      (job) => job.jobType !== "apprenticeship" && !highestVacancyIds.has(job.id)
    );
    return sortPriorityJobs(latestJobs, today);
  }, [sourceJobs]);

  const totalPages = jobs ? Math.max(1, Math.ceil(jobs.length / HOME_PAGE_SIZE)) : 1;
  const pageStart = (currentPage - 1) * HOME_PAGE_SIZE;
  const visibleJobs = jobs ? jobs.slice(pageStart, pageStart + HOME_PAGE_SIZE) : [];

  return (
    <section id="latest-job-updates" className="container-page mt-8 scroll-mt-24 sm:mt-10">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Latest Job Updates</h1>
        </div>
        <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700" aria-live="polite">
          {jobs ? `${jobs.length} Jobs` : loadFailed ? "Try again" : "Loading jobs…"}
        </span>
      </div>

      {loadFailed ? (
        <div className="rounded-xl2 border border-ink-900/10 bg-white p-6 text-center shadow-card">
          <p className="font-semibold text-ink-900">Jobs abhi load nahi ho sake.</p>
          <p className="mt-1 text-sm text-ink-700/70">Website available hai; job data dobara try karein.</p>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
          <Link href="/jobs" className="ml-2 inline-flex rounded-lg border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700">
            Browse all jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs
            ? visibleJobs.map((job) => <JobCard key={job.id} job={job} />)
            : Array.from({ length: 6 }).map((_, index) => <JobCardSkeleton key={index} />)}
        </div>
      )}

      {jobs && totalPages > 1 && (
        <nav className="mt-6 flex flex-wrap items-center justify-center gap-3" aria-label="Homepage job pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((page) => Math.max(1, page - 1));
              document.getElementById("latest-job-updates")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
              currentPage === 1
                ? "cursor-not-allowed border-ink-900/10 text-ink-700/40"
                : "border-brand-600 text-brand-700 hover:bg-brand-50"
            }`}
          >
            ← Previous
          </button>
          <span className="text-center text-sm text-ink-700" aria-live="polite">
            Page {currentPage} of {totalPages} · Showing {pageStart + 1}–{Math.min(pageStart + HOME_PAGE_SIZE, jobs.length)} of {jobs.length} jobs
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((page) => Math.min(totalPages, page + 1));
              document.getElementById("latest-job-updates")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
              currentPage === totalPages
                ? "cursor-not-allowed border-ink-900/10 text-ink-700/40"
                : "border-brand-600 text-brand-700 hover:bg-brand-50"
            }`}
          >
            Next →
          </button>
        </nav>
      )}

      <Link href="/jobs?pageSize=50" className="mt-6 block rounded-lg border border-brand-600 px-4 py-3 text-center text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50">
        View all jobs →
      </Link>
    </section>
  );
}
