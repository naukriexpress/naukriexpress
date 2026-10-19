import Link from "next/link";
import type { JobPosting } from "@/lib/types";
import { CATEGORY_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";
import { hasPendingVacancyDetails, SSC_GD_NOTICE_PENDING_MARKER, VACANCY_DETAILS_PENDING_MARKER } from "@/lib/jobMarkers";
import StatusBadge from "./StatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function ageLimitLabel(minAge?: number, maxAge?: number) {
  if (minAge !== undefined && maxAge !== undefined) return `${minAge}–${maxAge} yrs`;
  if (minAge !== undefined) return `${minAge}+ yrs`;
  if (maxAge !== undefined) return `Up to ${maxAge} yrs`;
  return "As per notification";
}

function genderLabel(genders: JobPosting["eligibility"]["genders"]) {
  if (genders.includes("male") && genders.includes("female")) return "Male & Female";
  if (genders.includes("male")) return "Male only";
  if (genders.includes("female")) return "Female only";
  return "—";
}

export default function JobCard({ job }: { job: JobPosting }) {
  const initials = job.organization
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const vacancyDetailsPending = hasPendingVacancyDetails({
    importantInstructions: job.content.importantInstructions,
    totalVacancies: job.totalVacancies,
    vacancyBreakdownCounts: job.vacancyBreakdown.map((row) => row.count),
  });
  const noticeDetailsPending =
    Boolean(job.content.importantInstructions?.includes(SSC_GD_NOTICE_PENDING_MARKER)) ||
    Boolean(job.content.importantInstructions?.includes(VACANCY_DETAILS_PENDING_MARKER));

  const daysToDeadline = noticeDetailsPending || job.status === "expired"
    ? null
    : getDaysUntilDate(job.dates.lastDate, getIndiaTodayDate());
  const deadlineAlert = daysToDeadline !== null && daysToDeadline >= 0 && daysToDeadline <= 7
    ? daysToDeadline === 0
      ? "LAST DATE TODAY — APPLY NOW"
      : daysToDeadline === 1
        ? "LAST DATE TOMORROW — APPLY NOW"
        : `LAST DATE IN ${daysToDeadline} DAYS — APPLY NOW`
    : null;

  return (
    <div className="group flex flex-col rounded-xl2 border border-ink-900/10 bg-white p-4 shadow-card transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-cardHover sm:p-5">
      {deadlineAlert && (
        <div role="alert" className="-mx-4 -mt-4 mb-4 flex items-center gap-2 rounded-t-xl2 bg-red-600 px-4 py-2.5 text-white sm:-mx-5 sm:-mt-5 sm:px-5">
          <span aria-hidden="true">🚨</span>
          <span className="text-xs font-extrabold tracking-wide sm:text-sm">{deadlineAlert}</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-50 font-display text-sm font-bold text-brand-700">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/jobs/${job.slug}`} className="min-w-0">
              <h3 className="font-display text-base font-semibold text-ink-900 leading-snug line-clamp-2 group-hover:text-brand-700">
                {job.title}
              </h3>
            </Link>
            {!deadlineAlert && <StatusBadge job={job} />}
          </div>
          <p className="mt-0.5 text-sm text-ink-700">{job.organization}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-ink-700/60">Total Vacancies</dt>
          <dd className="font-semibold text-ink-900">
            {vacancyDetailsPending
              ? "Awaiting confirmation"
              : job.totalVacancies > 0
                ? job.totalVacancies.toLocaleString("en-IN")
                : "Check notification"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">Location</dt>
          <dd className="font-medium text-ink-900 truncate">
            {job.location.allIndia ? "All India" : job.location.district || job.location.state}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">Qualification</dt>
          <dd className="font-medium text-ink-900 truncate">
            {noticeDetailsPending
              ? "As per official notification"
              : job.eligibility.qualifications.map((q) => QUALIFICATION_LABELS[q]).join(", ") || "As per notification"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">Eligible Gender</dt>
          <dd className="font-medium text-ink-900">{genderLabel(job.eligibility.genders)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">Age Limit</dt>
          <dd className="font-medium text-ink-900">
            {noticeDetailsPending
              ? "As per official notification"
              : ageLimitLabel(job.eligibility.minAge, job.eligibility.maxAge)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">Last Date</dt>
          <dd className="font-semibold text-saffron-600">
            {noticeDetailsPending ? "Awaiting official notification" : formatDate(job.dates.lastDate)}
          </dd>
          {!noticeDetailsPending && job.content.importantInstructions?.includes("[[LAST_DATE_EXTENDED]]") && (
            <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">
              Last Date Extended
            </span>
          )}
        </div>
      </dl>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.eligibility.categories.map((c) => (
          <span key={c} className="chip chip-inactive py-0.5 px-2 text-xs">
            {CATEGORY_LABELS[c]}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-900/10 pt-3.5">
        <Link
          href={`/jobs/${job.slug}`}
          className="rounded-lg border border-brand-600 px-2 py-2 text-center text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
        >
          View Details
        </Link>
        {job.links.applyOnline ? (
          <a
            href={job.links.applyOnline}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-600 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            Apply Online
          </a>
        ) : (
          <span className="rounded-lg bg-brand-600 px-2 py-2 text-center text-xs font-semibold text-white opacity-70">
            Apply Link Awaited
          </span>
        )}
        {job.links.officialNotification ? (
          <a
            href={job.links.officialNotification}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-saffron-500 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-saffron-600 transition-colors"
          >
            Notification
          </a>
        ) : job.links.officialWebsite ? (
          <a
            href={job.links.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-saffron-500 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-saffron-600 transition-colors"
          >
            Official Website
          </a>
        ) : (
          <span className="rounded-lg bg-saffron-500 px-2 py-2 text-center text-xs font-semibold text-white opacity-70">
            Notice Awaited
          </span>
        )}
      </div>
    </div>
  );
}
