import type { Metadata } from "next";
import { Suspense } from "react";
import { Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobBySlug, incrementViews } from "@/lib/db";
import {
  CATEGORY_LABELS,
  QUALIFICATION_LABELS,
  JOB_TYPE_LABELS,
} from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import ShareButtons from "@/components/ShareButtons";
import RelatedJobs, { RelatedJobsSkeleton } from "@/components/RelatedJobs";
import { hasPendingVacancyDetails } from "@/lib/jobMarkers";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.naukriexpress.space";

const cardFont = Manrope({ subsets: ["latin"], display: "swap" });

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

function parseEligibilityRows(value?: string): { label: string; value: string }[] | null {
  if (!value?.trim()) return null;

  // RichTextEditor stores contentEditable markup. Convert block boundaries
  // back into lines so "Label | Value" entries can render as a specification table.
  const plain = value
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "")
    .replace(/<\/(?:ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)));

  const lines = plain.split(/[\r\n]+/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return null;

  const rows = lines.map((line) => {
    const separator = line.indexOf("|");
    if (separator <= 0) return null;

    const label = line.slice(0, separator).trim().replace(/^[-*•]\s*/, "");
    const rowValue = line.slice(separator + 1).trim();
    return label && rowValue ? { label, value: rowValue } : null;
  });

  // Only use the table layout when every non-empty line follows the exact
  // Label | Value pattern; regular eligibility paragraphs keep rich-text styling.
  if (rows.some((row) => row === null)) return null;
  return rows as { label: string; value: string }[];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);

  if (!job) return { title: "Job Not Found" };

  const vacancyDetailsPending = hasPendingVacancyDetails({
    noticeDetailsPending: job.noticeDetailsPending,
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
    noticeDetailsPending: job.noticeDetailsPending,
    totalVacancies: job.totalVacancies,
    vacancyBreakdownCounts: job.vacancyBreakdown.map((row) => row.count),
  });
  const noticeDetailsPending = Boolean(job.noticeDetailsPending);

  // Record the visit without holding up the main job content render.
  void incrementViews(job.id).catch((error: unknown) => {
    console.error("Job view count update failed:", error);
  });

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
  const eligibilityRows = parseEligibilityRows(job.content.eligibility);
  const rowVacancyTotal = job.vacancyBreakdown.reduce(
    (sum, row) => sum + Math.max(0, Number(row.count) || 0),
    0
  );
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
    htmlToPlainText(job.content.eligibility),
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
          <div className={`${cardFont.className} job-detail-panel rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7`}>
            <div className="job-title-panel relative mb-5 overflow-hidden rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50/70 p-4 pl-5 shadow-sm sm:p-5 sm:pl-6">
              <div
                aria-hidden="true"
                className="job-title-accent absolute inset-y-3 left-0 w-1 rounded-r-full bg-gradient-to-b from-sky-500 via-blue-600 to-violet-600"
              />
              <div className="relative flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="job-title-eyebrow inline-flex items-center rounded-md border border-sky-200 bg-sky-100/80 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-sky-800 sm:text-[10px]">
                      Recruitment
                    </span>
                    <span className="job-title-subeyebrow text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500 sm:text-[10px]">
                      Official Notice
                    </span>
                  </div>

                  <h1 className="job-main-heading font-display text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-[2rem] sm:leading-tight">
                    {job.title}
                  </h1>

                  <p className="job-organization mt-2 text-sm font-bold text-sky-800">
                    {job.organization}
                  </p>

                  <p className="job-department mt-0.5 text-xs leading-relaxed text-slate-600">
                    {job.department}
                  </p>
                </div>

                <div className="shrink-0">
                  <StatusBadge job={job} />
                </div>
              </div>
            </div>

            <div className={`${cardFont.className} mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-4`}>
              <div className="job-meta-card job-meta-card--sky min-w-0 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-3.5 shadow-sm transition-colors hover:border-sky-200">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-sky-700">Advt. No.</p>
                <p className="break-words text-sm font-bold leading-snug text-slate-900">
                  {job.advertisementNumber || "As notified"}
                </p>
              </div>

              <div className="job-meta-card job-meta-card--emerald min-w-0 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3.5 shadow-sm transition-colors hover:border-emerald-200">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-700">Total Vacancies</p>
                <p className="break-words text-sm font-extrabold leading-snug text-emerald-950 sm:text-base">
                  {vacancyDetailsPending
                    ? "Awaiting confirmation"
                    : job.totalVacancies > 0
                      ? job.totalVacancies.toLocaleString("en-IN")
                      : "Check official notification"}
                </p>
              </div>

              <div className="job-meta-card job-meta-card--violet min-w-0 rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-3.5 shadow-sm transition-colors hover:border-violet-200">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-violet-700">Job Type</p>
                <p className="break-words text-sm font-bold leading-snug text-slate-900">
                  {JOB_TYPE_LABELS[job.jobType]}
                </p>
              </div>

              <div className="job-meta-card job-meta-card--amber min-w-0 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-3.5 shadow-sm transition-colors hover:border-amber-200">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-amber-700">Location</p>
                <p className="break-words text-sm font-bold leading-snug text-slate-900">
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
          <section className={`${cardFont.className} job-detail-panel mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7`}>
            <h2 className="mb-4 font-display text-lg font-extrabold tracking-tight text-ink-900">
              Post-wise Vacancy Details
            </h2>

            {vacancyDetailsPending ? (
              <div className="vacancy-pending-panel rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 text-sm text-amber-950 shadow-sm sm:p-5">
                <p className="font-bold">Official vacancy details are awaited.</p>
                <p className="mt-1 leading-relaxed">
                  The recruiting authority has not yet provided a verified post-wise vacancy breakdown that we can cite here. The total number of vacancies will be updated after the official notification is published.
                </p>
              </div>
            ) : (
              <div role="table" aria-label="Post-wise vacancy details" className="space-y-3">
                <div
                  role="row"
                  className="vacancy-table-head hidden grid-cols-[3.25rem_minmax(0,1.5fr)_minmax(0,1.35fr)_5rem_auto] gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-600 lg:grid"
                >
                  <div role="columnheader" className="vacancy-column-header vacancy-column-header--serial text-center">Sr. No.</div>
                  <div role="columnheader" className="vacancy-column-header vacancy-column-header--post">Post</div>
                  <div role="columnheader" className="vacancy-column-header vacancy-column-header--qualification">Required Qualification</div>
                  <div role="columnheader" className="vacancy-column-header vacancy-column-header--count text-center">Vacancies</div>
                  <div role="columnheader" className="vacancy-column-header vacancy-column-header--apply text-right">Apply Online</div>
                </div>

                {job.vacancyBreakdown.length === 0 ? (
                  <div className="vacancy-empty-panel rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                    A post-wise vacancy breakdown is not available in this listing. Please check the official notification for verified post details.
                  </div>
                ) : job.vacancyBreakdown.map((row, i) => {
                  const tradeLink =
                    ("applyOnline" in row &&
                    typeof row.applyOnline === "string"
                      ? row.applyOnline.trim()
                      : "") || job.links.applyOnline;

                  const rowTone = i % 5 === 0
                    ? "border-sky-100 bg-gradient-to-br from-sky-50/80 to-white hover:border-sky-200"
                    : i % 5 === 1
                      ? "border-teal-100 bg-gradient-to-br from-teal-50/80 to-white hover:border-teal-200"
                      : i % 5 === 2
                        ? "border-violet-100 bg-gradient-to-br from-violet-50/80 to-white hover:border-violet-200"
                        : i % 5 === 3
                          ? "border-amber-100 bg-gradient-to-br from-amber-50/80 to-white hover:border-amber-200"
                          : "border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white hover:border-emerald-200";

                  return (
                    <div
                      role="row"
                      key={i}
                      className={`vacancy-row-card grid grid-cols-1 gap-3 rounded-xl border p-4 shadow-sm transition-all sm:grid-cols-2 lg:grid-cols-[3.25rem_minmax(0,1.5fr)_minmax(0,1.35fr)_5rem_auto] lg:items-center lg:gap-4 ${rowTone}`}
                    >
                      <div role="cell" className="min-w-0 lg:text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-sky-700 lg:hidden">Sr. No.</p>
                        <span className="vacancy-row-serial inline-flex min-w-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-sm font-extrabold tabular-nums text-sky-800">
                          {i + 1}
                        </span>
                      </div>

                      <div role="cell" className="min-w-0">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-sky-700 lg:hidden">Post</p>
                        <span className="vacancy-post-badge inline-flex max-w-full whitespace-normal break-words rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-extrabold leading-relaxed text-emerald-800">
                          {row.post}
                        </span>
                      </div>

                      <div role="cell" className="min-w-0">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-sky-700 lg:hidden">Required Qualification</p>
                        <span className="vacancy-qualification-badge inline-flex max-w-full whitespace-normal break-words rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-extrabold leading-relaxed text-emerald-800">
                          {row.qualification?.trim() ||
                            job.eligibility.qualifications
                              .map((qualification) => QUALIFICATION_LABELS[qualification])
                              .filter(Boolean)
                              .join(", ") ||
                            "Not specified"}
                        </span>
                      </div>

                      <div role="cell" className="min-w-0 lg:text-center">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-700 lg:hidden">Vacancies</p>
                        <span className="vacancy-row-count inline-flex min-w-10 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-extrabold tabular-nums text-emerald-800">
                          {row.count.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div role="cell" className="min-w-0 lg:text-right">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-700 lg:hidden">Apply Online</p>
                        {tradeLink ? (
                          <a
                            href={tradeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="vacancy-apply-button inline-flex w-full items-center justify-center whitespace-nowrap rounded-lg border border-emerald-600 bg-emerald-600 px-3.5 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-700 hover:bg-emerald-700 hover:shadow-md sm:w-auto"
                          >
                            Apply Online
                          </a>
                        ) : (
                          <span className="vacancy-link-missing inline-block rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                            Link not added
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Eligibility */}
          <section className={`${cardFont.className} job-detail-panel mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7`}>
            <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
              Eligibility
            </h2>

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="job-eligibility-card job-eligibility-card--teal min-w-0 rounded-xl border border-teal-100 border-l-4 border-l-teal-500 bg-gradient-to-br from-teal-50/80 to-white p-4 shadow-sm">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-teal-700">
                  Eligible Gender
                </p>
                <p className="break-words text-sm font-bold leading-snug text-slate-900">
                  {job.eligibility.genders.length ? job.eligibility.genders.join(" & ") : "As per official notification"}
                </p>
              </div>

              <div className="job-eligibility-card job-eligibility-card--sky min-w-0 rounded-xl border border-sky-100 border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50/80 to-white p-4 shadow-sm">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-sky-700">
                  Qualification
                </p>
                <p className="break-words text-sm font-bold leading-snug text-slate-900">
                  {noticeDetailsPending
                    ? "As per official notification"
                    : job.eligibility.qualifications
                        .map((q) => QUALIFICATION_LABELS[q])
                        .join(", ") || "As per official notification"}
                </p>
              </div>

              <div className="job-eligibility-card job-eligibility-card--violet min-w-0 rounded-xl border border-violet-100 border-l-4 border-l-violet-500 bg-gradient-to-br from-violet-50/80 to-white p-4 shadow-sm">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-violet-700">
                  Age Limit
                </p>
                <p className="break-words text-sm font-bold leading-snug text-slate-900">
                  {noticeDetailsPending
                    ? "As per official notification"
                    : ageLimitLabel(job.eligibility.minAge, job.eligibility.maxAge)}
                </p>
              </div>
            </div>

            {job.eligibility.ageRelaxation && (
              <div className="job-age-relaxation-card mb-4 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white p-4 shadow-sm">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-amber-700">
                  Age Relaxation
                </p>
                <p className="break-words text-sm font-semibold leading-relaxed text-slate-900">
                  {job.eligibility.ageRelaxation}
                </p>
              </div>
            )}

            {job.content.eligibility && (
              <div className="job-eligibility-details mt-5 border-t border-slate-100 pt-5">
                <h3 className="job-eligibility-details-title mb-3 text-sm font-extrabold tracking-tight text-slate-800">
                  Eligibility Details
                </h3>

                {eligibilityRows ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {eligibilityRows.map((row, index) => (
                      <div
                        key={index}
                        className={`eligibility-specification-card ${index % 5 === 0 ? "eligibility-specification-card--sky" : index % 5 === 1 ? "eligibility-specification-card--teal" : index % 5 === 2 ? "eligibility-specification-card--violet" : index % 5 === 3 ? "eligibility-specification-card--amber" : "eligibility-specification-card--emerald"} min-w-0 rounded-xl border p-4 shadow-sm transition-colors ${
                          index % 5 === 0
                            ? "border-sky-100 bg-gradient-to-br from-sky-50 to-white hover:border-sky-200"
                            : index % 5 === 1
                              ? "border-teal-100 bg-gradient-to-br from-teal-50 to-white hover:border-teal-200"
                              : index % 5 === 2
                                ? "border-violet-100 bg-gradient-to-br from-violet-50 to-white hover:border-violet-200"
                                : index % 5 === 3
                                  ? "border-amber-100 bg-gradient-to-br from-amber-50 to-white hover:border-amber-200"
                                  : "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white hover:border-emerald-200"
                        }`}
                      >
                        <p
                          className={`eligibility-specification-label mb-2 text-[10px] font-bold uppercase tracking-[0.13em] ${
                            index % 5 === 0
                              ? "text-sky-700"
                              : index % 5 === 1
                                ? "text-teal-700"
                                : index % 5 === 2
                                  ? "text-violet-700"
                                  : index % 5 === 3
                                    ? "text-amber-700"
                                    : "text-emerald-700"
                          }`}
                        >
                          {row.label}
                        </p>
                        <p className="eligibility-specification-value break-words text-sm font-bold leading-relaxed text-slate-900">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="eligibility-richtext-panel rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/70 via-white to-violet-50/40 p-3 shadow-sm sm:p-4">
                    <div
                      className="eligibility-richtext-content prose-sm text-ink-800 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_p]:rounded-lg [&_p]:border [&_p]:border-sky-100 [&_p]:bg-white/90 [&_p]:px-3 [&_p]:py-3 [&_p]:shadow-sm [&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_li]:rounded-md [&_li]:border [&_li]:border-violet-100 [&_li]:bg-violet-50/50 [&_li]:px-3 [&_li]:py-2"
                      dangerouslySetInnerHTML={{
                        __html: job.content.eligibility,
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Important Dates and Fee */}
          <section className={`${cardFont.className} job-detail-panel mt-5 rounded-xl2 border border-slate-200 bg-white p-5 shadow-card sm:p-7`}>
            <h2 className="mb-4 font-display text-lg font-extrabold tracking-tight text-ink-900">
              Important Dates &amp; Fee
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="job-date-card job-date-card--sky min-w-0 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-4 shadow-sm transition-colors hover:border-sky-200">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-sky-700">
                  Application Start
                </p>
                <p className="break-words text-sm font-bold leading-snug text-slate-900">
                  {noticeDetailsPending ? "Awaiting official notification" : formatDate(job.dates.startDate)}
                </p>
              </div>

              <div className="job-date-card job-date-card--rose min-w-0 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4 shadow-sm transition-colors hover:border-rose-200">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-rose-700">
                  Last Date
                </p>
                <p className="break-words text-sm font-bold leading-snug text-rose-700">
                  {noticeDetailsPending ? "Awaiting official notification" : formatDate(job.dates.lastDate)}
                </p>
                {job.lastDateExtended && (
                  <span className="mt-2 inline-block rounded-full border border-orange-200 bg-orange-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-orange-800">
                    Last Date Extended
                  </span>
                )}
              </div>

              <div className="job-date-card job-date-card--violet min-w-0 rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm transition-colors hover:border-violet-200">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-violet-700">
                  Exam Date
                </p>
                <p className="break-words text-sm font-bold leading-snug text-slate-900">
                  {noticeDetailsPending ? "Awaiting official notification" : formatDate(job.dates.examDate)}
                </p>
              </div>

              <div className="job-date-card job-date-card--amber min-w-0 rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm transition-colors hover:border-amber-200">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-amber-700">
                  Application Fee
                </p>
                <p className="break-words text-sm font-bold leading-relaxed text-slate-900">
                  {job.applicationFee || "As per notification"}
                </p>
              </div>

              <div className="job-date-card job-date-card--emerald min-w-0 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm transition-colors hover:border-emerald-200 sm:col-span-2 lg:col-span-2">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.13em] text-emerald-700">
                  Salary / Pay Scale
                </p>
                <p className="break-words text-sm font-bold leading-relaxed text-emerald-950">
                  {noticeDetailsPending
                    ? "To be confirmed in official notification"
                    : job.salary || "As per official notification"}
                </p>
              </div>
            </div>
          </section>

          {/* Share */}
          <section className="job-detail-panel mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
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

            <Suspense fallback={<RelatedJobsSkeleton />}>
              <RelatedJobs
                currentJobId={job.id}
                state={job.location.allIndia ? undefined : job.location.state}
              />
            </Suspense>
          </div>
        </aside>
      </div>
    </div>
  );
}
