"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { JobPosting } from "@/lib/types";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";
import { hasPendingVacancyDetails } from "@/lib/jobMarkers";

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

function formatLastDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : "—";
}

function getCountdownCopy(daysLeft: number): { value: string; unit: string; accessible: string } {
  if (daysLeft <= 0) return { value: "Today", unit: "Last Day", accessible: "Last date is today" };
  if (daysLeft === 1) return { value: "1", unit: "Day", accessible: "1 day remaining" };
  return { value: String(daysLeft), unit: "Days", accessible: `${daysLeft} days remaining` };
}

/** Animate the number and circular progress ring together, stopping at the real deadline. */
function AnimatedCountdownCircle({
  daysLeft,
  tone,
  lastDate,
}: {
  daysLeft: number;
  tone: (typeof CARD_TONES)[number];
  lastDate: string;
}) {
  // Render the verified deadline immediately. A short CSS slide-in remains,
  // while removing one interval per card keeps mobile scrolling responsive.
  const finalDays = Math.max(0, daysLeft);
  const progress = daysLeft <= 0 ? 100 : (finalDays / daysLeft) * 100;
  const circleRadius = 29;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progress / 100);
  const countdown = getCountdownCopy(daysLeft);

  return (
    <span
      className="highest-vacancy-countdown !flex !h-8 !w-[76px] !shrink-0 !items-center !justify-center !gap-1 !rounded-full !px-1 !py-0 sm:!h-10 sm:!w-[94px] sm:!gap-1.5 sm:!px-1.5"
      data-tone={tone}
      aria-label={countdown.accessible}
      title={`Last date: ${lastDate}`}
    >
      <span
        className={`highest-vacancy-countdown-value !grid !h-[22px] !w-[22px] !shrink-0 !place-items-center !rounded-full !border !border-current !text-xs !font-black !leading-none sm:!h-[27px] sm:!w-[27px] sm:!text-sm ${daysLeft === 0 ? "highest-vacancy-countdown-today !h-auto !w-auto !border-0 !px-1 !text-[10px] sm:!text-xs" : ""}`}
      >
        {daysLeft === 0 ? countdown.value : (
          <span key={finalDays} className="highest-vacancy-countdown-slide">
            {finalDays}
          </span>
        )}
      </span>
      <span className="highest-vacancy-countdown-unit !mt-0 !text-[9px] sm:!text-[11px]">
        {countdown.unit}
      </span>
    </span>
  );
}

function VacancyButtonSkeleton() {
  return (
    <div
      className="flex h-[58px] items-center gap-2 rounded-xl border border-ink-900/10 bg-white px-2 shadow-card sm:gap-3 sm:px-3"
      aria-hidden="true"
    >
      <div className="h-8 w-8 shrink-0 rounded-full bg-brand-50 sm:h-9 sm:w-9" />
      <div className="h-4 min-w-0 flex-1 rounded bg-ink-900/10" />
      <div className="h-6 w-16 shrink-0 rounded-full bg-saffron-100" />
      <div className="h-4 w-[88px] shrink-0 rounded bg-red-100 sm:w-[116px]" />
      <div className="h-8 w-[76px] shrink-0 rounded-full bg-brand-100 sm:h-10 sm:w-[94px]" />
    </div>
  );
}

export default function HighestVacancyJobs({
  jobs,
  loadFailed,
}: {
  jobs: JobPosting[] | null;
  loadFailed: boolean;
}) {
  const [today, setToday] = useState(getIndiaTodayDate);

  // Keep deadlines accurate if a visitor leaves the homepage open across midnight IST.
  useEffect(() => {
    const interval = window.setInterval(() => setToday(getIndiaTodayDate()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const topJobs = useMemo(() => {
    if (!jobs) return [];

    return jobs
      .filter((job) => {
        // Keep apprenticeship recruitments exclusively in the separate
        // "Highest Vacancy Apprentice" section.
        if (job.jobType === "apprenticeship") return false;
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
;
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
            </div>
          </div>
          <span
            className="highest-vacancy-count shrink-0 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700 shadow-sm"
            aria-live="polite"
          >
            {jobs ? `${topJobs.length} Jobs` : "Loading…"}
          </span>
        </div>

        <div className="flex flex-col gap-2" aria-busy={!jobs}>
          {jobs
            ? topJobs.map((job, index) => {
                const vacancies = getVerifiedVacancyCount(job);
                const daysLeft = getDaysUntilDate(job.dates.lastDate, today) ?? 0;
                const countdown = getCountdownCopy(daysLeft);
                const tone = CARD_TONES[index % CARD_TONES.length];
                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.slug}`}
                    aria-label={`View details for ${job.title}; ${formatVacancies(vacancies)} vacancies; last date ${formatLastDate(job.dates.lastDate)}; ${countdown.accessible}`}
                    title={`View details for ${job.title} — ${formatVacancies(vacancies)} Posts — Last date: ${formatLastDate(job.dates.lastDate)}`}
                    className="highest-vacancy-card group flex !h-[58px] !min-h-[58px] w-full min-w-0 items-center !gap-1.5 rounded-xl border !px-2 !py-1.5 transition-all duration-200 focus-visible:outline-offset-4 sm:!gap-3 sm:!px-3"
                    data-tone={tone}
                  >
                    <span
                      className="highest-vacancy-job-icon grid !h-8 !w-8 shrink-0 place-items-center rounded-full text-lg sm:!h-9 sm:!w-9 sm:text-xl"
                      data-tone={tone}
                      aria-hidden="true"
                    >
                      {getJobIcon(job)}
                    </span>
                    <span className="highest-vacancy-job-title min-w-0 flex-1 truncate whitespace-nowrap text-[11px] font-extrabold leading-snug sm:text-sm">
                      {job.title}
                    </span>
                    <span
                      className="highest-vacancy-post-badge highest-vacancy-row-post inline-flex shrink-0 items-center rounded-full !px-2 !py-1 !text-[10px] font-extrabold sm:!text-xs"
                      data-tone={tone}
                    >
                      {formatVacancies(vacancies)} Posts
                    </span>
                    <span
                      className="highest-vacancy-last-date inline-flex w-[88px] shrink-0 items-center justify-center gap-0.5 whitespace-nowrap text-[9px] font-extrabold tabular-nums text-red-600 sm:w-[116px] sm:gap-1 sm:text-xs"
                      title={`Last date: ${formatLastDate(job.dates.lastDate)}`}
                    >
                      <span aria-hidden="true">📅</span>
                      <time dateTime={job.dates.lastDate}>{formatLastDate(job.dates.lastDate)}</time>
                    </span>
                    <AnimatedCountdownCircle
                      daysLeft={daysLeft}
                      tone={tone}
                      lastDate={job.dates.lastDate}
                    />
                  </Link>
                );
              })
            : Array.from({ length: 6 }).map((_, index) => (
                <VacancyButtonSkeleton key={index} />
              ))}
        </div>
      </div>
    </section>
  );
}
