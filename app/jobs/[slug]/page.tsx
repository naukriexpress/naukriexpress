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
import { hasPendingVacancyDetails, SSC_GD_NOTICE_PENDING_MARKER, VACANCY_DETAILS_PENDING_MARKER } from "@/lib/jobMarkers";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";

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

function htmlToPlainText(value?: string) {
  return (value || "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);

  if (!job) return { title: "Job Not Found" };

  const vacancyDetailsPending = hasPendingVacancyDetails({
    importantInstructions: job.content.importantInstructions,
    totalVacancies: job.totalVacancies,
    vacancyBreakdownCounts: job.vacancyBreakdown.map((row) => row.count),
  });
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
  const description = vacancyDetailsPending
    ? "Official vacancy details are awaited. The recruiting authority has not yet provided a verified post-wise vacancy breakdown that we can cite here. The total number of vacancies will be updated after the official notification is published."
    : job.seo.metaDescription ||
      [
        `Apply for ${job.title} at ${job.organization} in ${location}.`,
        vacancySummary,
        qualifications ? `for ${qualifications} candidates` : "",
        `Last date: ${formatDate(job.dates.lastDate)}.`,
      ]
        .filter(Boolean)
        .join(" ");

  return {
    title,
    description,
    alternates: { canonical: `/jobs/${job.slug}` },
    openGraph: {
      title: `${title} | NaukriExpress`,
      description,
      url: `${SITE_URL}/jobs/${job.slug}`,
      siteName: "NaukriExpress",
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${title} | NaukriExpress`,
      description,
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

  const vacancyDetailsPending = hasPendingVacancyDetails({
    importantInstructions: job.content.importantInstructions,
    totalVacancies: job.totalVacancies,
    vacancyBreakdownCounts: job.vacancyBreakdown.map((row) => row.count),
  });
  const noticeDetailsPending =
    Boolean(job.content.importantInstructions?.includes(SSC_GD_NOTICE_PENDING_MARKER)) ||
    Boolean(job.content.importantInstructions?.includes(VACANCY_DETAILS_PENDING_MARKER));

  await incrementViews(job.id);

  const { results: related } = await queryJobs({
    state: job.location.allIndia ? undefined : job.location.state,
    pageSize: 3,
  });

  const relatedJobs = related
    .filter((j) => j.id !== job.id)
    .slice(0, 3);

  const daysUntilDeadline = getDaysUntilDate(
    job.dates.lastDate,
    getIndiaTodayDate()
  );
  const hasApplicationLink = Boolean(
    job.links.applyOnline?.trim() ||
      job.vacancyBreakdown.some((row) => row.applyOnline?.trim())
  );
  const shouldRenderJobPosting =
    job.status === "published" &&
    !vacancyDetailsPending &&
    !noticeDetailsPending &&
    daysUntilDeadline !== null &&
    daysUntilDeadline >= 0 &&
    hasApplicationLink;

  const locationLabel = job.location.allIndia
    ? "All India"
    : [job.location.district, job.location.state].filter(Boolean).join(", ");
  const qualificationsLabel = job.eligibility.qualifications
    .map((qualification) => QUALIFICATION_LABELS[qualification])
    .filter(Boolean)
    .join(", ");
  const rowVacancyTotal = job.vacancyBreakdown.reduce(
    (sum, row) => sum + Math.max(0, Number(row.count) || 0),
    0
  );
  const cleanInstructions = (job.content.importantInstructions || "")
    .replace(/\[\[LAST_DATE_EXTENDED\]\]/g, "")
    .replace(SSC_GD_NOTICE_PENDING_MARKER, "")
    .replace(VACANCY_DETAILS_PENDING_MARKER, "")
    .trim();
  const schemaDescription = [
    job.title,
    job.organization,
    job.department,
    job.advertisementNumber ? `Advertisement Number: ${job.advertisementNumber}.` : "",
    job.totalVacancies > 0 || rowVacancyTotal > 0
      ? `Total vacancies: ${Math.max(job.totalVacancies, rowVacancyTotal)}.`
      : "",
    `Job type: ${JOB_TYPE_LABELS[job.jobType]}.`,
    locationLabel ? `Location: ${locationLabel}.` : "",
    qualificationsLabel ? `Educational qualification: ${qualificationsLabel}.` : "",
    job.eligibility.genders.length
      ? `Eligible gender: ${job.eligibility.genders.join(" and ")}.`
      : "",
    `Age limit: ${ageLimitLabel(job.eligibility.minAge, job.eligibility.maxAge)}.`,
    job.eligibility.ageRelaxation ? `Age relaxation: ${job.eligibility.ageRelaxation}.` : "",
    job.salary ? `Salary / stipend: ${job.salary}.` : "",
    job.applicationFee ? `Application fee: ${job.applicationFee}.` : "",
    `Last date to apply: ${formatDate(job.dates.lastDate)}.`,
    job.vacancyBreakdown.length
      ? `Post-wise vacancies: ${job.vacancyBreakdown
          .map((row) => `${row.post}: ${row.count}`)
          .join("; ")}.`
      : "",
    htmlToPlainText(job.content.vacancyDetails),
    htmlToPlainText(job.content.eligibility),
    htmlToPlainText(job.content.selectionProcess),
    htmlToPlainText(job.content.howToApply),
    htmlToPlainText(cleanInstructions),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: schemaDescription || job.title,
    ...(job.advertisementNumber
      ? {
          identifier: {
            "@type": "PropertyValue",
            name: job.organization,
            value: job.advertisementNumber,
          },
        }
      : {}),
    datePosted: job.publishAt || job.createdAt,
    validThrough: job.dates.lastDate.slice(0, 10),
    ...(job.jobType === "government" || job.jobType === "private"
      ? { employmentType: "FULL_TIME" }
      : job.jobType === "internship"
        ? { employmentType: "INTERN" }
        : job.jobType === "contract"
          ? { employmentType: "CONTRACTOR" }
          : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization,
      ...(job.links.officialWebsite ? { sameAs: job.links.officialWebsite } : {}),
      ...(job.logoUrl ? { logo: job.logoUrl } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(!job.location.allIndia && job.location.district
          ? { addressLocality: job.location.district }
          : {}),
        ...(!job.location.allIndia && job.location.state
          ? { addressRegion: job.location.state }
          : {}),
        addressCountry: "IN",
      },
    },
    totalJobOpenings:
      job.totalVacancies > 0
        ? job.totalVacancies
        : rowVacancyTotal > 0
          ? rowVacancyTotal
          : undefined,
    url: `${SITE_URL}/jobs/${job.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jobs",
        item: `${SITE_URL}/jobs`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: job.title,
        item: `${SITE_URL}/jobs/${job.slug}`,
      },
    ],
  };

  return (
    <div className="container-page py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {shouldRenderJobPosting && (
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
                  {vacancyDetailsPending
                    ? "Awaiting confirmation"
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
              Post-wise Vacancy Details
            </h2>

            {vacancyDetailsPending ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
                <p className="font-semibold">Official vacancy details are awaited.</p>
                <p className="mt-1">
                  The recruiting authority has not yet provided a verified post-wise and category-wise vacancy breakdown that we can cite here. The total number of vacancies will be updated after the official notification is published.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-900/10 text-left text-ink-700/60">
                      <th className="py-2 pr-4 font-medium">Post</th>
                      <th className="py-2 pr-4 font-medium">Required Qualification</th>
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
                          A post-wise vacancy breakdown is not available in this listing. Please check the official notification for verified post details.
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
                            {row.qualification?.trim() ||
                              job.eligibility.qualifications
                                .map((qualification) => QUALIFICATION_LABELS[qualification])
                                .filter(Boolean)
                                .join(", ") ||
                              "Not specified"}
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
                  Qualification
                </p>
                <p className="text-sm font-semibold text-ink-900">
                  {noticeDetailsPending
                    ? "As per official notification"
                    : job.eligibility.qualifications
                        .map((q) => QUALIFICATION_LABELS[q])
                        .join(", ") || "As per official notification"}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">
                  Age Limit
                </p>
                <p className="text-sm font-semibold text-ink-900">
{noticeDetailsPending
                    ? "As per official notification"
                    : ageLimitLabel(job.eligibility.minAge, job.eligibility.maxAge)}
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
                  {noticeDetailsPending ? "Awaiting official notification" : formatDate(job.dates.startDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">Last Date</p>
                <p className="text-sm font-semibold text-saffron-600">
                  {noticeDetailsPending ? "Awaiting official notification" : formatDate(job.dates.lastDate)}
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
                  {noticeDetailsPending ? "Awaiting official notification" : formatDate(job.dates.examDate)}
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
                  {noticeDetailsPending
                    ? "To be confirmed in official notification"
                    : job.salary || "As per official notification"}
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
          {job.content.importantInstructions?.replace("[[LAST_DATE_EXTENDED]]", "").replace(SSC_GD_NOTICE_PENDING_MARKER, "").replace(VACANCY_DETAILS_PENDING_MARKER, "").trim() && (
            <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
              <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
                Required Documents &amp; Important Instructions
              </h2>

              <div
                className="prose-sm text-ink-800 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{
                  __html: job.content.importantInstructions.replace("[[LAST_DATE_EXTENDED]]", "").replace(SSC_GD_NOTICE_PENDING_MARKER, "").replace(VACANCY_DETAILS_PENDING_MARKER, "").trim(),
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
