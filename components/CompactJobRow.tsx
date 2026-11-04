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

function jobIcon(job: JobPosting): string {
  const name = (job.title + " " + job.organization).toLowerCase();
  if (/railway|\brrb\b|train|locomotive/.test(name)) return "🚆";
  if (/police|crpf|army|defence|defense|itbp|assam rifles|coast guard/.test(name)) return "🛡️";
  if (/bank|nicl|lic\b|insurance/.test(name)) return "🏦";
  if (/apprentice|apprenticeship|trainee/.test(name)) return "🎓";
  if (/hospital|health|aiims|medical/.test(name)) return "🏥";
  if (/teacher|teaching|school|university|college/.test(name)) return "🎓";
  return "🏛️";
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
      <span className="highest-vacancy-job-icon grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl" data-tone="emerald" aria-hidden="true">
        {jobIcon(job)}
      </span>
      <span className="highest-vacancy-job-title min-w-0 flex-1 whitespace-normal break-words text-[13px] font-extrabold leading-snug sm:text-[15px]">
        {job.title}
      </span>
      <span className="highest-vacancy-post-badge highest-vacancy-row-post inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[10px] font-extrabold sm:text-xs" data-tone="emerald">
        {vacancyLabel}
      </span>
      <span
        className="highest-vacancy-countdown !grid !h-11 !w-11 !shrink-0 !place-items-center !rounded-full !p-0 !text-base !font-black sm:!h-12 sm:!w-12"
        data-tone="emerald"
        data-urgent={urgent ? "true" : "false"}
        data-closed={closed ? "true" : "false"}
        aria-label={closed ? "Applications closed" : daysLeft === 0 ? "Last date today" : daysLeft === null ? "Deadline unavailable" : daysLeft + " days remaining"}
      >
        {value}
      </span>
    </Link>
  );
}
