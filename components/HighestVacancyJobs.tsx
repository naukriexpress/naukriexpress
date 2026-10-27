"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { JobPosting } from "@/lib/types";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";
import { hasPendingVacancyDetails } from "@/lib/jobMarkers";

const JOBS_ENDPOINT = "/api/jobs?status=published&sort=latest&page=1&pageSize=500";

const CARD_TONES = [
  "blue", "orange", "teal", "violet", "rose", "indigo",
  "amber", "cyan", "emerald", "pink", "royal", "copper",
] as const;

function getVerifiedVacancyCount(job: JobPosting): number {
  const pending = hasPendingVacancyDetails({
    noticeDetailsPending: job.noticeDetailsPending,
    totalVacancies: job.totalVacancies,
    vacancyBreakdownCounts: job.vacancyBreakdown.map((row) => row.count),
  });

  if (pending || job.noticeDetailsPending) return 0;

  const rowTotal = job.vacancyBreakdown.reduce(
    (sum, row) => sum + Math.max(0, Number(row.count) || 0),
    0
  );

  return Math.max(Math.max(0, Number(job.totalVacancies) || 0), rowTotal);
}

function getJobIcon(job: JobPosting): string {
  const name = `${job.title} ${job.organization}`.toLowerCase();
  if (/railway|\brrb\b|train|locomotive/.test(name)) return "🚆";
  if (/police|crpf|army|defence|defense|itbp|assam rifles|coast guard/.test(name)) return "🛡️";
  if (/bank|nicl|lic\b|insurance/.test(name)) return "🏦";
  if (/apprentice|apprenticeship|trainee/.test(name)) return "🎓";
  if (/hospital|health|aiims|medical/.test(name)) return "🏥";
  if (/teacher|teaching|school|university|college/.test(name)) return "🎓";
  return "🏛️";
}

function formatVacancies(value: number): string {
  return value.toLocaleString("en-IN");
}

function VacancyButtonSkeleton() {
  return (
    <div
      className="h-[92px] animate-pulse rounded-xl border border-ink-900/10 bg-white p-3 shadow-card"
      aria-hidden="true"
    >
      <div className="flex h-full items-center gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-brand-50" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-5/6 rounded bg-ink-900/10" />
          <div className="h-5 w-24 rounded-full bg-saffron-100" />
        </div>
      </div>
    </div>
  );
}

export default function HighestVacancyJobs() {
  const [jobs, setJobs] = useState<JobPosting[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [today, setToday] = useState(getIndiaTodayDate);

  useEffect(() => {
    const controller = new AbortController();

    fetch(JOBS_ENDPOINT, {
      cache: "no-store",
      signal: controller.signal,
    })
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

  // Keep deadlines accurate if a visitor leaves the homepage open across midnight IST.
  useEffect(() => {
    const interval = window.setInterval(() => setToday(getIndiaTodayDate()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const topJobs = useMemo(() => {
    if (!jobs) return [];

    return jobs
      .filter((job) => {
        if (job.status !== "published" || job.noticeDetailsPending) return false;
        const vacancies = getVerifiedVacancyCount(job);
        const daysLeft = getDaysUntilDate(job.dates.lastDate, today);
        // Keep the item visible through its published last date; hide it from the next day.
        return vacancies > 0 && daysLeft !== null && daysLeft >= 0;
      })
      .sort((a, b) => {
        const vacancyDifference = getVerifiedVacancyCount(b) - getVerifiedVacancyCount(a);
        if (vacancyDifference !== 0) return vacancyDifference;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 12);
  }, [jobs, today]);

  if (loadFailed || (jobs && topJobs.length === 0)) return null;

  return (
    <section className="container-page mt-6 sm:mt-8" aria-labelledby="highest-vacancy-heading">
      <div className="highest-vacancy-panel rounded-2xl border border-brand-100 bg-brand-50/70 p-4 shadow-card sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="highest-vacancy-icon grid h-12 w-12 shrink-0 place-items-center rounded-full bg-saffron-100 text-2xl"
              aria-hidden="true"
            >
              🏆
            </span>
            <div className="min-w-0">
              <h2
                id="highest-vacancy-heading"
                className="font-display text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl"
              >
                Highest Vacancy Jobs
              </h2>
              <p className="highest-vacancy-description mt-1 text-xs leading-relaxed text-ink-700/75 sm:text-sm">
                Explore current recruitments with the most confirmed vacancies. These links automatically disappear after the last date.
              </p>
            </div>
          </div>
          <span
            className="highest-vacancy-count shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 shadow-sm"
            aria-live="polite"
          >
            {jobs ? `${topJobs.length} Jobs` : "Loading…"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy={!jobs}>
          {jobs
            ? topJobs.map((job, index) => {
                const vacancies = getVerifiedVacancyCount(job);
                const tone = CARD_TONES[index % CARD_TONES.length];
                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.slug}`}
                    prefetch={false}
                    aria-label={`View ${job.title}, ${formatVacancies(vacancies)} vacancies`}
                    className="highest-vacancy-card group flex min-h-[92px] min-w-0 items-center gap-3 rounded-xl border p-3 transition-all duration-200 focus-visible:outline-offset-4"
                    data-tone={tone}
                  >
                    <span
                      className="highest-vacancy-job-icon grid h-12 w-12 shrink-0 place-items-center rounded-full text-2xl"
                      data-tone={tone}
                      aria-hidden="true"
                    >
                      {getJobIcon(job)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="highest-vacancy-job-title line-clamp-2 block text-sm font-extrabold leading-snug transition-colors">
                        {job.title}
                      </span>
                      <span
                        className="highest-vacancy-post-badge mt-2 inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-extrabold"
                        data-tone={tone}
                      >
                        {formatVacancies(vacancies)} Posts
                      </span>
                    </span>
                    <span
                      className="highest-vacancy-arrow grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl font-bold transition-transform group-hover:translate-x-0.5"
                      data-tone={tone}
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </Link>
                );
              })
            : Array.from({ length: 12 }).map((_, index) => (
                <VacancyButtonSkeleton key={index} />
              ))}
        </div>
      </div>
    </section>
  );
}
