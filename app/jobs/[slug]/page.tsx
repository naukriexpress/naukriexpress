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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);

  if (!job) return { title: "Job Not Found" };

  const location = job.location.allIndia
    ? "All India"
    : [job.location.district, job.location.state].filter(Boolean).join(", ") ||
      "India";
  const qualifications = job.eligibility.qualifications
    .map((qualification) => QUALIFICATION_LABELS[qualification])
    .filter(Boolean)
    .join(", ");
  const title =
    job.seo.title ||
    `${job.title} in ${location} | Apply Online`;
  const description =
    job.seo.metaDescription ||
    [
      `Apply for ${job.title} at ${job.organization} in ${location}.`,
      `${job.totalVacancies} ${JOB_TYPE_LABELS[job.jobType].toLowerCase()} openings`,
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
    description:
      job.content.eligibility?.replace(/<[^>]+>/g, "") || job.title,
    identifier: {
      "@type": "PropertyValue",
      name: job.organization,
      value: job.advertisementNumber,
    },
    datePosted: job.createdAt,
    validThrough: new Date(job.dates.lastDate).toISOString(),
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
    totalJobOpenings: job.totalVacancies,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jobPostingSchema),
        }}
      />

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
                  {job.totalVacancies.toLocaleString("en-IN")}
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
                  {job.vacancyBreakdown.map((row, i) => {
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
                  {job.eligibility.genders.join(" & ")}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">
                  Qualification
                </p>
                <p className="text-sm font-semibold text-ink-900">
                  {job.eligibility.qualifications
                    .map((q) => QUALIFICATION_LABELS[q])
                    .join(", ")}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">Age Limit</p>
                <p className="text-sm font-semibold text-ink-900">
                  {job.eligibility.minAge ?? "—"} –{" "}
                  {job.eligibility.maxAge ?? "—"} years
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
                  {formatDate(job.dates.startDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-ink-700/60">Last Date</p>
                <p className="text-sm font-semibold text-saffron-600">
                  {formatDate(job.dates.lastDate)}
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
                  {formatDate(job.dates.examDate)}
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
                  {job.salary || "As per rules"}
                </p>
              </div>
            </div>
          </section>

          {/* Selection Process */}
          {job.content.selectionProcess && (
            <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
              <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
                Selection Process
              </h2>

              <div
                className="prose-sm text-ink-800 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{
                  __html: job.content.selectionProcess,
                }}
              />
            </section>
          )}

          {/* How to Apply */}
          {job.content.howToApply && (
            <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
              <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
                How to Apply
              </h2>

              <div
                className="prose-sm text-ink-800 [&_p]:mb-2"
                dangerouslySetInnerHTML={{
                  __html: job.content.howToApply,
                }}
              />
            </section>
          )}

          {/* Important Instructions */}
          {job.content.importantInstructions && (
            <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card sm:p-7">
              <h2 className="mb-3 font-display text-lg font-bold text-ink-900">
                Required Documents &amp; Important Instructions
              </h2>

              <div
                className="prose-sm text-ink-800 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{
                  __html: job.content.importantInstructions.replace("[[LAST_DATE_EXTENDED]]", "").trim(),
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
