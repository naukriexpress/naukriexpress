import Link from "next/link";
import type { JobPosting } from "@/lib/types";
import { CATEGORY_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import StatusBadge from "./StatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
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

  return (
    <div className="group flex flex-col rounded-xl2 border border-ink-900/10 bg-white p-4 sm:p-5 shadow-card hover:shadow-cardHover transition-shadow">
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
            <StatusBadge job={job} />
          </div>
          <p className="mt-0.5 text-sm text-ink-700">{job.organization}</p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-ink-700/60">Total Vacancies</dt>
          <dd className="font-semibold text-ink-900">{job.totalVacancies.toLocaleString("en-IN")}</dd>
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
            {job.eligibility.qualifications.map((q) => QUALIFICATION_LABELS[q]).join(", ")}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">Eligible Gender</dt>
          <dd className="font-medium text-ink-900">{genderLabel(job.eligibility.genders)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">Age Limit</dt>
          <dd className="font-medium text-ink-900">
            {job.eligibility.minAge ?? "—"}–{job.eligibility.maxAge ?? "—"} yrs
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-700/60">Last Date</dt>
          <dd className="font-semibold text-saffron-600">{formatDate(job.dates.lastDate)}</dd>
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
        <a
          href={job.links.applyOnline || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-brand-600 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Apply Online
        </a>
        <a
          href={job.links.officialNotification || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-saffron-500 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-saffron-600 transition-colors"
        >
          Notification
        </a>
      </div>
    </div>
  );
}
