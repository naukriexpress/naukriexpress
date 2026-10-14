import Link from "next/link";
import { queryJobs } from "@/lib/db";
import { CATEGORY_LABELS, QUALIFICATION_LABELS } from "@/lib/types";
import type { JobPosting } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function genderLabel(job: JobPosting) {
  const genders = job.eligibility.genders;
  if (genders.includes("male") && genders.includes("female")) return "Male & Female";
  if (genders.includes("male")) return "Male only";
  if (genders.includes("female")) return "Female only";
  return "—";
}

export default async function ApprenticePage() {
  const { results: jobs, total } = await queryJobs({
    jobType: ["apprenticeship"],
    sort: "latest",
    pageSize: 100,
  });

  return (
    <main className="container-page py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          Latest Apprentice Recruitment
        </h1>
        <p className="mt-1 text-sm text-ink-700/70">
          Apprentice vacancies, trade-wise positions and online application links.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-xl2 border border-ink-900/10 bg-white p-6 text-ink-700 shadow-card">
          <h2 className="text-lg font-semibold text-ink-900">
            No Apprentice Recruitment Available
          </h2>
          <p className="mt-2 text-sm">
            Published Apprentice recruitments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const initials = job.organization
              .split(" ")
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase();
            const trades = job.vacancyBreakdown || [];
            const hasTradeLinks = trades.some((trade) => trade.applyOnline?.trim());

            return (
              <article
                key={job.id}
                className="group flex flex-col rounded-xl2 border border-ink-900/10 bg-white p-4 shadow-card transition-shadow hover:shadow-cardHover sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-50 font-display text-sm font-bold text-brand-700">
                    {initials || "AP"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/jobs/${job.slug}`} className="min-w-0">
                        <h2 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink-900 group-hover:text-brand-700">
                          {job.title}
                        </h2>
                      </Link>
                      <StatusBadge job={job} />
                    </div>
                    <p className="mt-0.5 text-sm text-ink-700">
                      {job.organization}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-ink-700/60">Total Vacancies</dt>
                    <dd className="font-semibold text-ink-900">
                      {job.totalVacancies.toLocaleString("en-IN")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-700/60">Location</dt>
                    <dd className="truncate font-medium text-ink-900">
                      {job.location.allIndia ? "All India" : job.location.district || job.location.state}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-700/60">Qualification</dt>
                    <dd className="font-medium text-ink-900">
                      {job.eligibility.qualifications.map((q) => QUALIFICATION_LABELS[q]).join(", ") || "As per notification"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-700/60">Eligible Gender</dt>
                    <dd className="font-medium text-ink-900">{genderLabel(job)}</dd>
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

                {job.eligibility.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.eligibility.categories.map((category) => (
                      <span key={category} className="chip chip-inactive px-2 py-0.5 text-xs">
                        {CATEGORY_LABELS[category]}
                      </span>
                    ))}
                  </div>
                )}

                {trades.length > 0 && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-semibold text-ink-700">Trade / Post Details</p>
                    <div className="space-y-2">
                      {trades.map((trade, index) => {
                        const applyLink = trade.applyOnline?.trim() || job.links.applyOnline || "";
                        return (
                          <div key={`${job.id}-trade-${index}`} className="flex items-center justify-between gap-2 text-sm">
                            <span className="min-w-0 flex-1 text-ink-900">
                              {trade.post} <span className="text-xs text-ink-700/70">({Number(trade.count || 0).toLocaleString("en-IN")})</span>
                            </span>
                            {applyLink ? (
                              <a
                                href={applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="shrink-0 rounded-md bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                              >
                                Apply
                              </a>
                            ) : (
                              <span className="shrink-0 text-xs text-ink-700/50">Link unavailable</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-auto grid grid-cols-3 gap-2 border-t border-ink-900/10 pt-3.5 mt-4">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="rounded-lg border border-brand-600 px-2 py-2 text-center text-xs font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    View Details
                  </Link>
                  <a
                    href={(hasTradeLinks ? trades.find((trade) => trade.applyOnline?.trim())?.applyOnline : job.links.applyOnline) || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-600 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Apply Online
                  </a>
                  <a
                    href={job.links.officialNotification || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-saffron-500 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-saffron-600"
                  >
                    Notification
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
