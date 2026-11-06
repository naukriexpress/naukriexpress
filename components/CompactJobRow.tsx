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
  const value = closed || daysLeft === null ? "—" : String(daysLeft);
  const vacancyLabel = vacancies > 0 ? vacancies.toLocaleString("en-IN") + " Posts" : "Vacancy Awaited";

  return (
    <Link
      href={`/jobs/${job.slug}`}
      prefetch={false}
      aria-label={`View ${job.title}; ${vacancyLabel}; ${closed ? "Applications closed" : daysLeft === 0 ? "Last date today" : daysLeft === null ? "Deadline unavailable" : daysLeft + " days remaining"}`}
      title={`${job.title} — ${vacancyLabel} — Last date: ${job.dates.lastDate || "Not specified"}`}
      className="highest-vacancy-card compact-job-row group flex min-h-[58px] h-auto w-full min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 transition-all duration-200 focus-visible:outline-offset-4 sm:gap-3 sm:px-3"
      data-tone="emerald"
    >
      <span
        className="highest-vacancy-countdown !grid !h-9 !w-9 !shrink-0 !place-items-center !rounded-full !p-0 !text-sm !font-black sm:!h-10 sm:!w-10"
        data-tone="emerald"
        data-urgent={urgent ? "true" : "false"}
        data-closed={closed ? "true" : "false"}
        aria-label={closed ? "Applications closed" : daysLeft === 0 ? "Last date today" : daysLeft === null ? "Deadline unavailable" : daysLeft + " days remaining"}
        title={job.dates.lastDate ? "Last date: " + formatLastDate(job.dates.lastDate) : "Last date not specified"}
      >
        {value}
      </span>
      <span className="highest-vacancy-job-title min-w-0 flex-1 whitespace-normal break-words text-[13px] font-extrabold leading-snug sm:text-[15px]">
        {job.title}
      </span>
      <span className="highest-vacancy-post-badge highest-vacancy-row-post inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[10px] font-extrabold sm:text-xs" data-tone="emerald">
        {vacancyLabel}
      </span>
      <span
        className="inline-flex shrink-0 items-center rounded-md border border-ink-900/10 bg-white px-2 py-1 text-[9px] font-bold leading-none text-ink-800 sm:text-[11px]"
        aria-label={"Last date " + formatLastDate(job.dates.lastDate)}
        title={"Last date: " + formatLastDate(job.dates.lastDate)}
      >
        {formatLastDate(job.dates.lastDate)}
      </span>
    </Link>
  );
}
