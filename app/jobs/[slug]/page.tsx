import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobBySlug, incrementViews, queryJobs } from "@/lib/db";
import {
  CATEGORY_LABELS,
  QUALIFICATION_LABELS,
  JOB_TYPE_LABELS,
} from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import ShareButtons from "@/components/ShareButtons";
import { SSC_GD_NOTICE_PENDING_MARKER } from "@/lib/jobMarkers";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.naukriexpress.space";

function formatDate(iso?: string) {
  if (!iso) return "—";

  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ageLimitLabel(minAge?: number, maxAge?: number) {
  if (minAge !== undefined && maxAge !== undefined) return `${minAge}–${maxAge} years`;
  if (minAge !== undefined) return `${minAge}+ years`;
  if (maxAge !== undefined) return `Up to ${maxAge} years`;
  return "As per official notification";
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);

  if (!job) return { title: "Job Not Found" };

  const noticePending = Boolean(
    job.content.importantInstructions?.includes(SSC_GD_NOTICE_PENDING_MARKER)
  );
  const location = job.location.allIndia
    ? "All India"
    : [job.location.district, job.location.state].filter(Boolean).join(", ") ||
      "India";
  const qualifications = job.eligibility.qualifications
    .map((qualification) => QUALIFICATION_LABELS[qualification])
    .filter(Boolean)
    .join(", ");
  const vacancySummary = job.totalVacancies > 0
    ? `${job.totalVacancies} ${JOB_TYPE_LABELS[job.jobType].toLowerCase()} openings`
    : "Vacancy details should be confirmed from the official notification";
  const title =
    job.seo.title ||
    `${job.title} in ${location} | Apply Online`;
  const description =
    job.seo.metaDescription ||
    (noticePending
      ? "Upcoming SSC GD Constable Recruitment 2027. Official vacancy count, exact dates and application link are awaiting confirmation from SSC."
      : [
      `Apply for ${job.title} at ${job.organization} in ${location}.`,
      vacancySummary,
      qualifications ? `for ${qualifications} candidates` : "",
      `Last date: ${formatDate(job.dates.lastDate)}.`,
    ]
      .filter(Boolean)
      .join(" "));

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/jobs/${job.slug}`,
      type: "article",
    },
  };
}

export default async function JobDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const job = await getJobBySlug(params.slug);

  if (!job) notFound();

  const noticePending = Boolean(
    job.content.importantInstructions?.includes(SSC_GD_NOTICE_PENDING_MARKER)
  );

  await incrementViews(job.id);

  const { results: related } = await queryJobs({
    state: job.location.allIndia ? undefined : job.location.state,
    pageSize: 3,
  });

  const relatedJobs = related
    .filter((j) => j.id !== job.id)
    .slice(0, 3);

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: noticePending
      ? "Upcoming SSC GD Constable Recruitment 2027. Official vacancies and exact application dates are awaiting confirmation."
      : job.content.eligibility?.replace(/<[^>]+>/g, "") || job.title,
    identifier: {
      "@type": "PropertyValue",
      name: job.organization,
      value: job.advertisementNumber,
    },
    datePosted: job.createdAt,
    validThrough: noticePending ? undefined : new Date(job.dates.lastDate).toISOString(),
    employmentType:
      job.jobType === "government" || job.jobType === "private"
        ? "FULL_TIME"
        : job.jobType === "internship"
          ? "INTERN"
          : "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization,
      sameAs: job.links.officialWebsite,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressRegion: job.location.state,
        addressCountry: "IN",
      },
    },
    totalJobOpenings: noticePending ? undefined : job.totalVacancies,
    baseSalary: job.salary
      ? {
          "@type": "MonetaryAmount",
          currency: "INR",
          value: {
            "@type": "QuantitativeValue",
            value: job.salary,
          },
        }
      : undefined,
  };

  return (
    <div className="container-page py-8">
      {!noticePending && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jobPostingSchema),
          }}
        />
      )}

      <nav className="mb-4 text-xs text-ink-700/60">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/jobs" className="hover:underline">
          Jobs
        </Link>{" "}
        / <span className="text-ink-900">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {/* Job Header */}
          <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-xl font-bold leading-snug text-ink-900 sm:text-2xl">
                  {job.title}
                </h1>

                <p className="mt-1 text-sm font-medium text-brand-700">
                  {job.organization}
                </p>

                <p className="text-xs text-ink-700/60">
                  {job.department}
                </p>
              </div>

              <StatusBadge job={job} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-900/10 pt-5 sm:grid-cols-4">
              <div>
                <p className="text-xs text-ink-700/60">Advt. No.</p>
                <p className="text-sm font-semibold text-ink-900">
                  {job.advertisementNumber}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">
                  Total Vacancies
                </p>
                <p className="text-sm font-semibold text-ink-900">
                  {noticePending
                    ? "Awaiting SSC notice"
                    : job.totalVacancies > 0
                      ? job.totalVacancies.toLocaleString("en-IN")
                      : "Check official notification"}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">Job Type</p>
                <p className="text-sm font-semibold text-ink-900">
                  {JOB_TYPE_LABELS[job.jobType]}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">Location</p>
                <p className="text-sm font-semibold text-ink-900">
                  {job.location.allIndia
                    ? "All India"
                    : job.location.district || job.location.state}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {job.eligibility.categories.map((c) => (
                <span
                  key={c}
                  className="chip chip-inactive px-2.5 py-1 text-xs"
                >
                  {CATEGORY_LABELS[c]}
                </span>
              ))}
            </div>
          </div>

          {/* Post-wise Vacancy Details and Apply Online Links */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
              Post-wise &amp; Category-wise Vacancy Details
            </h2>

            {noticePending ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                <p className="font-semibold">Official vacancy details are awaited.</p>
                <p className="mt-1">
                  SSC has not yet provided a verified 2027 force-wise and category-wise vacancy breakup that we can cite here. The total number of vacancies will be updated after the official SSC notice is published.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-900/10 text-left text-ink-700/60">
                      <th className="py-2 pr-4 font-medium">Post</th>
                      <th className="py-2 pr-4 font-medium">
                        Category-wise Breakup
                      </th>
                      <th className="py-2 pr-4 text-right font-medium">
                        Vacancies
                      </th>
                      <th className="py-2 font-medium">Apply Online</th>
                    </tr>
                  </thead>
  
                  <tbody>
                    {job.vacancyBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-3 text-sm text-ink-700">
                          A post-wise vacancy breakdown is not available in this listing. Please check the official notification for the verified post and category-wise figures.
                        </td>
                      </tr>
                    ) : job.vacancyBreakdown.map((row, i) => {
                      const tradeLink =
                        ("applyOnline" in row &&
                        typeof row.applyOnline === "string"
                          ? row.applyOnline.trim()
                          : "") || job.links.applyOnline;
  
                      return (
                        <tr
                          key={i}
                          className="border-b border-ink-900/5"
                        >
                          <td className="py-2.5 pr-4 font-medium text-ink-900">
                            {row.post}
                          </td>
  
                          <td className="py-2.5 pr-4 text-ink-700">
                            {row.category || "—"}
                          </td>
  
                          <td className="py-2.5 pr-4 text-right font-semibold text-ink-900">
                            {row.count.toLocaleString("en-IN")}
                          </td>
  
                          <td className="py-2.5">
                            {tradeLink ? (
                              <a
                                href={tradeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block whitespace-nowrap rounded-lg bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-green-700"
                              >
                                Apply Online
                              </a>
                            ) : (
                              <span className="text-xs text-ink-700/60">
                                Link not added
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Eligibility */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
              Eligibility
            </h2>

            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-ink-700/60">
                  Eligible Gender
                </p>
                <p className="text-sm font-semibold capitalize text-ink-900">
{job.eligibility.genders.length ? job.eligibility.genders.join(" & ") : "As per official notification"}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">
                  {noticePending ? "Qualification (tentative)" : "Qualification"}
                </p>
                <p className="text-sm font-semibold text-ink-900">
                  {job.eligibility.qualifications
                    .map((q) => QUALIFICATION_LABELS[q])
                    .join(", ") || "As per official notification"}
                  {noticePending ? " (previous-cycle pattern; confirm in 2027 notice)" : ""}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">
                  {noticePending ? "Age Limit (tentative)" : "Age Limit"}
                </p>
                <p className="text-sm font-semibold text-ink-900">
{ageLimitLabel(job.eligibility.minAge, job.eligibility.maxAge)}
                </p>
              </div>
            </div>

            {job.eligibility.ageRelaxation && (
              <p className="mb-4 text-sm text-ink-700">
                <strong>Age Relaxation:</strong>{" "}
                {job.eligibility.ageRelaxation}
              </p>
            )}

            {job.content.eligibility && (
              <div
                className="prose-sm text-ink-800 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{
                  __html: job.content.eligibility,
                }}
              />
            )}
          </section>

          {/* Important Dates and Fee */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
              Important Dates &amp; Fee
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-ink-700/60">
                  Application Start
                </p>
                <p className="text-sm font-semibold text-ink-900">
                  {noticePending ? "Awaiting official notification" : formatDate(job.dates.startDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">Last Date</p>
                <p className="text-sm font-semibold text-saffron-600">
                  {noticePending ? "October 2026 (tentative; exact day awaited)" : formatDate(job.dates.lastDate)}
                </p>
                {job.content.importantInstructions?.includes("[[LAST_DATE_EXTENDED]]") && (
                  <span className="mt-1 inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">
                    Last Date Extended
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs text-ink-700/60">Exam Date</p>
                <p className="text-sm font-semibold text-ink-900">
                  {noticePending ? "January–March 2027 (tentative)" : formatDate(job.dates.examDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">
                  Application Fee
                </p>
                <p className="text-sm font-semibold text-ink-900">
                  {job.applicationFee || "As per notification"}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">
                  Salary / Pay Scale
                </p>
                <p className="text-sm font-semibold text-ink-900">
                  {noticePending
                    ? "Previous-cycle pay: ₹21,700–₹69,100; 2027 pay scale awaited"
                    : job.salary || "As per rules"}
                </p>
              </div>
            </div>
          </section>

          {/* Selection Process */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
              Selection Process
            </h2>

            {job.content.selectionProcess ? (
              <div
                className="prose-sm text-ink-800 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{
                  __html: job.content.selectionProcess,
                }}
              />
            ) : (
              <p className="text-sm leading-relaxed text-ink-800">
                A verified, recruitment-specific selection-stage summary is not
                available in this listing. Check the official notification for
                the exact examination, skill or physical tests, interview,
                merit-list and document-verification requirements. Only rely on
                stages specified by the recruiting authority.
              </p>
            )}
          </section>

          {/* How to Apply */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
              How to Apply
            </h2>

            {job.content.howToApply ? (
              <div
                className="prose-sm text-ink-800 [&_p]:mb-2"
                dangerouslySetInnerHTML={{
                  __html: job.content.howToApply,
                }}
              />
            ) : (
              <div className="prose-sm space-y-2 text-ink-800">
                <p>
                  Read the official notification and confirm your eligibility,
                  application dates, fee, required documents and instructions
                  before starting an application.
                </p>
                <p>
                  Use the application link or official website shown on this
                  page when available. If a link is not listed, visit the
                  recruiting authority's official site to confirm whether the
                  application window is open. Save your submission receipt and
                  pay fees only through the official application process.
                </p>
              </div>
            )}
          </section>

          {/* Important Instructions */}
          {job.content.importantInstructions?.replace("[[LAST_DATE_EXTENDED]]", "").replace(SSC_GD_NOTICE_PENDING_MARKER, "").trim() && (
            <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
              <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
                Required Documents &amp; Important Instructions
              </h2>

              <div
                className="prose-sm text-ink-800 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{
                  __html: job.content.importantInstructions.replace("[[LAST_DATE_EXTENDED]]", "").replace(SSC_GD_NOTICE_PENDING_MARKER, "").trim(),
                }}
              />
            </section>
          )}

          {/* Share */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
              Share this Job
            </h2>

            <ShareButtons
              title={job.title}
              url={`${SITE_URL}/jobs/${job.slug}`}
            />
          </section>
        </div>

        {/* Sticky Action Sidebar */}
        <aside>
          <div className="sticky top-24 space-y-3">
            <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card">
              {job.links.applyOnline && (
                <a
                  href={job.links.applyOnline}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Apply Online
                </a>
              )}

              {job.links.officialNotification && (
                <a
                  href={job.links.officialNotification}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 block w-full rounded-lg bg-saffron-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-saffron-600"
                >
                  Official Notification (PDF)
                </a>
              )}

              {job.links.officialWebsite && (
                <a
                  href={job.links.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 block w-full rounded-lg border border-ink-900/15 px-4 py-3 text-center text-sm font-semibold text-ink-800 hover:bg-ink-900/5"
                >
                  Official Website
                </a>
              )}
            </div>

            {relatedJobs.length > 0 && (
              <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card">
                <h3 className="mb-3 font-display text-sm font-bold text-ink-900">
                  Related Jobs
                </h3>

                <div className="space-y-2">
                  {relatedJobs.map((r) => (
                    <Link
                      key={r.id}
                      href={`/jobs/${r.slug}`}
                      className="block rounded-lg border border-ink-900/10 p-3 text-xs hover:border-brand-400"
                    >
                      <p className="line-clamp-2 font-semibold text-ink-900">
                        {r.title}
                      </p>

                      <p className="mt-0.5 text-ink-700/60">
                        {r.organization}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
