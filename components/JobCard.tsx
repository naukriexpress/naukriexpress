import Link from "next/link";
import type { ReactNode } from "react";
import type { JobPosting } from "@/lib/types";
import { CATEGORY_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";
import { hasPendingVacancyDetails } from "@/lib/jobMarkers";
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

type DetailTone = "emerald" | "rose" | "violet" | "amber" | "sky";

const DETAIL_TONES: Record<DetailTone, { card: string; label: string; icon: string }> = {
  emerald: {
    card: "job-card-detail--emerald border-emerald-100 bg-gradient-to-br from-emerald-50 to-white",
    label: "text-emerald-800",
    icon: "bg-emerald-100 text-emerald-700",
  },
  rose: {
    card: "job-card-detail--rose border-rose-100 bg-gradient-to-br from-rose-50 to-white",
    label: "text-rose-800",
    icon: "bg-rose-100 text-rose-700",
  },
  violet: {
    card: "job-card-detail--violet border-violet-100 bg-gradient-to-br from-violet-50 to-white",
    label: "text-violet-800",
    icon: "bg-violet-100 text-violet-700",
  },
  amber: {
    card: "job-card-detail--amber border-amber-100 bg-gradient-to-br from-amber-50 to-white",
    label: "text-amber-800",
    icon: "bg-amber-100 text-amber-700",
  },
  sky: {
    card: "job-card-detail--sky border-sky-100 bg-gradient-to-br from-sky-50 to-white",
    label: "text-sky-800",
    icon: "bg-sky-100 text-sky-700",
  },
};

function DetailCard({
  label,
  value,
  icon,
  tone,
  extra,
}: {
  label: string;
  value: ReactNode;
  icon: string;
  tone: DetailTone;
  extra?: ReactNode;
}) {
  const styles = DETAIL_TONES[tone];

  return (
    <div className={`job-card-detail min-w-0 rounded-xl border p-3 shadow-sm sm:p-3.5 ${styles.card}`}>
      <div className="flex min-w-0 items-start gap-2.5">
        <span aria-hidden="true" className={`job-card-detail-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg ${styles.icon}`}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <dt className={`job-card-detail-label mb-1 text-[11px] font-semibold leading-snug ${styles.label}`}>
            {label}
          </dt>
          <dd className="job-card-detail-value break-words text-sm font-bold leading-snug text-slate-950">
            {value}
          </dd>
          {extra}
        </div>
      </div>
    </div>
  );
}

const CATEGORY_TONES = [
  "job-card-category--sky",
  "job-card-category--emerald",
  "job-card-category--violet",
  "job-card-category--amber",
  "job-card-category--rose",
];

export default function JobCard({ job }: { job: JobPosting }) {
  const initials = job.organization
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const vacancyDetailsPending = hasPendingVacancyDetails({
    noticeDetailsPending: job.noticeDetailsPending,
    totalVacancies: job.totalVacancies,
    vacancyBreakdownCounts: job.vacancyBreakdown.map((row) => row.count),
  });
  const noticeDetailsPending = Boolean(job.noticeDetailsPending);

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

  const qualification = noticeDetailsPending
    ? "As per official notification"
    : job.eligibility.qualifications.map((q) => QUALIFICATION_LABELS[q]).join(", ") || "As per notification";
  const lastDateLabel = noticeDetailsPending
    ? "Awaiting official notification"
    : formatDate(job.dates.lastDate);

  return (
    <article className="job-listing-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg">
      {deadlineAlert && (
        <div role="alert" className="job-deadline-alert flex items-center gap-2 bg-gradient-to-r from-red-600 via-red-600 to-rose-500 px-4 py-2.5 text-white">
          <span aria-hidden="true">🚨</span>
          <span className="text-xs font-extrabold tracking-wide sm:text-sm">{deadlineAlert}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="job-card-logo grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-sky-100 bg-sky-50 font-display text-base font-extrabold text-sky-800 sm:h-16 sm:w-16 sm:text-lg">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={`/jobs/${job.slug}`}
                aria-label={`View details for ${job.title}`}
                className="job-card-title-link min-w-0 flex-1 rounded-md focus-visible:outline-offset-4"
              >
                <h3 className="job-card-title line-clamp-3 font-display text-base font-extrabold leading-snug tracking-tight text-slate-950 transition-colors group-hover:text-sky-700 sm:text-[17px]">
                  {job.title}
                </h3>
                <p className="job-card-organization mt-1 text-sm font-semibold leading-snug text-sky-800">{job.organization}</p>
              </Link>
              <div className="shrink-0">
                <StatusBadge job={job} />
              </div>
            </div>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2.5 text-sm">
          <DetailCard
            label="Total Vacancies"
            value={vacancyDetailsPending
              ? "Awaiting confirmation"
              : job.totalVacancies > 0
                ? job.totalVacancies.toLocaleString("en-IN")
                : "Check notification"}
            icon="👥"
            tone="emerald"
          />
          <DetailCard
            label="Location"
            value={job.location.allIndia ? "All India" : job.location.district || job.location.state}
            icon="📍"
            tone="rose"
          />
          <DetailCard
            label="Qualification"
            value={qualification}
            icon="🎓"
            tone="violet"
          />
          <DetailCard
            label="Eligible Gender"
            value={genderLabel(job.eligibility.genders)}
            icon="👤"
            tone="amber"
          />
          <DetailCard
            label="Age Limit"
            value={noticeDetailsPending
              ? "As per official notification"
              : ageLimitLabel(job.eligibility.minAge, job.eligibility.maxAge)}
            icon="🗓️"
            tone="sky"
          />
          <DetailCard
            label="Last Date"
            value={lastDateLabel}
            icon="📅"
            tone="rose"
            extra={!noticeDetailsPending && job.lastDateExtended ? (
              <span className="job-card-extended mt-2 inline-block rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                Last Date Extended
              </span>
            ) : undefined}
          />
        </dl>

        {job.eligibility.categories.length > 0 && (
          <div className="job-card-categories mt-4 flex flex-wrap gap-1.5" aria-label="Eligible categories">
            {job.eligibility.categories.map((category, index) => (
              <span
                key={category}
                className={`job-card-category rounded-full border px-3 py-1 text-xs font-bold ${CATEGORY_TONES[index % CATEGORY_TONES.length]}`}
              >
                {CATEGORY_LABELS[category]}
              </span>
            ))}
          </div>
        )}

        <div className="job-card-actions mt-auto grid grid-cols-3 gap-2 border-t border-slate-200 pt-4 mt-4">
          <Link
            href={`/jobs/${job.slug}`}
            className="job-card-action job-card-action--view inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-600 bg-white px-2 py-2 text-center text-xs font-extrabold text-blue-700 transition-colors hover:bg-blue-50 sm:text-sm"
          >
            View Details
          </Link>
          {job.links.applyOnline ? (
            <a
              href={job.links.applyOnline}
              target="_blank"
              rel="noopener noreferrer"
              className="job-card-action job-card-action--apply inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-800 bg-blue-800 px-2 py-2 text-center text-xs font-extrabold text-white transition-colors hover:bg-blue-900 sm:text-sm"
            >
              Apply Online
            </a>
          ) : (
            <span className="job-card-action job-card-action--apply job-card-action--disabled inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-800 bg-blue-800 px-2 py-2 text-center text-xs font-extrabold text-white opacity-75 sm:text-sm">
              Apply Link Awaited
            </span>
          )}
          {job.links.officialNotification ? (
            <a
              href={job.links.officialNotification}
              target="_blank"
              rel="noopener noreferrer"
              className="job-card-action job-card-action--notice inline-flex min-h-10 items-center justify-center rounded-lg border border-orange-500 bg-orange-500 px-2 py-2 text-center text-xs font-extrabold text-white transition-colors hover:bg-orange-600 sm:text-sm"
            >
              Notification
            </a>
          ) : job.links.officialWebsite ? (
            <a
              href={job.links.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="job-card-action job-card-action--notice inline-flex min-h-10 items-center justify-center rounded-lg border border-orange-500 bg-orange-500 px-2 py-2 text-center text-xs font-extrabold text-white transition-colors hover:bg-orange-600 sm:text-sm"
            >
              Official Website
            </a>
          ) : (
            <span className="job-card-action job-card-action--notice job-card-action--disabled inline-flex min-h-10 items-center justify-center rounded-lg border border-orange-500 bg-orange-500 px-2 py-2 text-center text-xs font-extrabold text-white opacity-75 sm:text-sm">
              Notice Awaited
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
