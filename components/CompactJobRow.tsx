import Link from "next/link";
import type { JobPosting } from "@/lib/types";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";
import { hasPendingVacancyDetails } from "@/lib/jobMarkers";

function vacancyCount(job: JobPosting): number {
  const pending = hasPendingVacancyDetails({
    noticeDetailsPending: job.noticeDetailsPending,
    totalVacancies: job.totalVacancies,
    vacancyBreakdownCounts: job.vacancyBreakdown.map((row) => row.count),
  });
  if (pending || job.noticeDetailsPending) return 0;
  const rowTotal = job.vacancyBreakdown.reduce(
    (sum, row) => sum + Math.max(0, Number(row.count) || 0), 0
  );
  return Math.max(Math.max(0, Number(job.totalVacancies) || 0), rowTotal);
}

function formatLastDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? day + "/" + month + "/" + year.slice(-2) : "—";
}

export default function CompactJobRow({ job }: { job: JobPosting }) {
  const vacancies = vacancyCount(job);
  const rawDaysLeft = getDaysUntilDate(job.dates.lastDate, getIndiaTodayDate());
  const closed = job.status === "expired" || (rawDaysLeft !== null && rawDaysLeft < 0);
  const daysLeft = closed ? null : rawDaysLeft;
  const urgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
  const value = daysLeft === null ? "—" : String(daysLeft);
  const vacancyLabel = vacancies > 0 ? vacancies.toLocaleString("en-IN") : "Vacancy Awaited";
  const countdownLabel = closed
    ? "Applications closed"
    : daysLeft === 0
      ? "Last date today"
      : daysLeft === null
        ? "Deadline unavailable"
        : daysLeft + " days remaining";

  const lastDateClass = daysLeft === 0
    ? "border-red-300 bg-red-50 text-red-700"
    : "border-ink-900/10 bg-white text-ink-800";
  const titleClass = daysLeft === 0 ? "text-red-700" : "text-ink-900";

  return (
    <Link
      href={`/jobs/${job.slug}`}
      prefetch={false}
      aria-label={`View ${job.title}; ${vacancyLabel} vacancies; last date ${formatLastDate(job.dates.lastDate)}; ${countdownLabel}`}
      title={`View details for ${job.title} — ${vacancyLabel} vacancies — Last date: ${job.dates.lastDate || "Not specified"}`}
      className="highest-vacancy-card compact-job-row group flex min-h-[64px] h-auto w-full min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 transition-all duration-200 focus-visible:outline-offset-4 sm:gap-3 sm:px-3"
      data-tone="blue"
    >
      <span className="inline-flex shrink-0 items-center">
        <span
          className="highest-vacancy-countdown !grid !h-10 !w-10 !shrink-0 !place-items-center !rounded-full !p-0 !text-sm !font-black sm:!h-12 sm:!w-12 sm:!text-base"
          data-tone="blue"
          data-urgent={urgent ? "true" : "false"}
          data-closed={closed ? "true" : "false"}
          aria-label={countdownLabel}
        >
          {value}
        </span>
      </span>

      <span className={`highest-vacancy-job-title line-clamp-2 min-w-0 flex-1 whitespace-normal break-words text-[13px] font-extrabold leading-snug sm:text-[15px] lg:text-[17px] ${titleClass}`}>
        {job.title}
      </span>

      <span className="ml-auto flex shrink-0 flex-col items-end justify-center gap-1">
        <span
          className="highest-vacancy-post-badge highest-vacancy-row-post inline-flex items-center rounded-full !px-2.5 !py-1.5 !text-xs font-extrabold"
          data-tone="blue"
          aria-label={vacancyLabel + " vacancies"}
        >
          {vacancyLabel}
        </span>
        <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold leading-none ${lastDateClass}`}>
          {formatLastDate(job.dates.lastDate).split("/").join("-")}
        </span>
      </span>
    </Link>
  );
}
