import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getJobBySlug, incrementViews, queryJobs } from "@/lib/db";
import { CATEGORY_LABELS, QUALIFICATION_LABELS, JOB_TYPE_LABELS } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import ShareButtons from "@/components/ShareButtons";
import JobCard from "@/components/JobCard";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.naukriexpress.in";

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const job = await getJobBySlug(params.slug);
  if (!job) return { title: "Job Not Found" };

  const title = job.seo.title || `${job.title} | Apply Online, Eligibility, Last Date`;
  const description =
    job.seo.metaDescription ||
    `${job.title} at ${job.organization}. ${job.totalVacancies} vacancies. Check eligibility, age limit and last date to apply.`;

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

export default async function JobDetailsPage({ params }: { params: { slug: string } }) {
  const job = await getJobBySlug(params.slug);
  if (!job) notFound();

  await incrementViews(job.id);

  const { results: related } = await queryJobs({
    state: job.location.allIndia ? undefined : job.location.state,
    pageSize: 3,
  });
  const relatedJobs = related.filter((j) => j.id !== job.id).slice(0, 3);

  const jobPostingSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.content.eligibility?.replace(/<[^>]+>/g, "") || job.title,
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
      ? { "@type": "MonetaryAmount", currency: "INR", value: { "@type": "QuantitativeValue", value: job.salary } }
      : undefined,
  };

  return (
    <div className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingSchema) }} />

      <nav className="mb-4 text-xs text-ink-700/60">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        <Link href="/jobs" className="hover:underline">Jobs</Link> /{" "}
        <span className="text-ink-900">{job.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {/* Header */}
          <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-7 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900 leading-snug">{job.title}</h1>
                <p className="mt-1 text-sm font-medium text-brand-700">{job.organization}</p>
                <p className="text-xs text-ink-700/60">{job.department}</p>
              </div>
              <StatusBadge job={job} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-ink-900/10 pt-5 sm:grid-cols-4">
              <div>
                <p className="text-xs text-ink-700/60">Advt. No.</p>
                <p className="font-semibold text-ink-900 text-sm">{job.advertisementNumber}</p>
              </div>
              <div>
                <p className="text-xs text-ink-700/60">Total Vacancies</p>
                <p className="font-semibold text-ink-900 text-sm">{job.totalVacancies.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-xs text-ink-700/60">Job Type</p>
                <p className="font-semibold text-ink-900 text-sm">{JOB_TYPE_LABELS[job.jobType]}</p>
              </div>
              <div>
                <p className="text-xs text-ink-700/60">Location</p>
                <p className="font-semibold text-ink-900 text-sm">
                  {job.location.allIndia ? "All India" : job.location.district || job.location.state}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {job.eligibility.categories.map((c) => (
                <span key={c} className="chip chip-inactive text-xs py-1 px-2.5">{CATEGORY_LABELS[c]}</span>
              ))}
            </div>
          </div>

          {/* Post-wise / category-wise vacancy details */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-7 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Post-wise &amp; Category-wise Vacancy Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-900/10 text-left text-ink-700/60">
                    <th className="py-2 pr-4 font-medium">Post</th>
                    <th className="py-2 pr-4 font-medium">Category-wise Breakup</th>
                    <th className="py-2 font-medium text-right">Vacancies</th>
                  </tr>
                </thead>
                <tbody>
                  {job.vacancyBreakdown.map((row, i) => (
                    <tr key={i} className="border-b border-ink-900/5">
                      <td className="py-2.5 pr-4 font-medium text-ink-900">{row.post}</td>
                      <td className="py-2.5 pr-4 text-ink-700">{row.category}</td>
                      <td className="py-2.5 text-right font-semibold text-ink-900">{row.count.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Eligibility */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-7 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Eligibility</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-4">
              <div>
                <p className="text-xs text-ink-700/60">Eligible Gender</p>
                <p className="font-semibold text-ink-900 text-sm capitalize">{job.eligibility.genders.join(" & ")}</p>
              </div>
              <div>
                <p className="text-xs text-ink-700/60">Qualification</p>
                <p className="font-semibold text-ink-900 text-sm">
                  {job.eligibility.qualifications.map((q) => QUALIFICATION_LABELS[q]).join(", ")}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-700/60">Age Limit</p>
                <p className="font-semibold text-ink-900 text-sm">
                  {job.eligibility.minAge ?? "—"} – {job.eligibility.maxAge ?? "—"} years
                </p>
              </div>
            </div>
            {job.eligibility.ageRelaxation && (
              <p className="text-sm text-ink-700 mb-4"><strong>Age Relaxation:</strong> {job.eligibility.ageRelaxation}</p>
            )}
            {job.content.eligibility && (
              <div className="prose-sm text-ink-800 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: job.content.eligibility }} />
            )}
          </section>

          {/* Fee, dates, salary */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-7 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Important Dates &amp; Fee</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div><p className="text-xs text-ink-700/60">Application Start</p><p className="font-semibold text-ink-900 text-sm">{formatDate(job.dates.startDate)}</p></div>
              <div><p className="text-xs text-ink-700/60">Last Date</p><p className="font-semibold text-saffron-600 text-sm">{formatDate(job.dates.lastDate)}</p></div>
              <div><p className="text-xs text-ink-700/60">Exam Date</p><p className="font-semibold text-ink-900 text-sm">{formatDate(job.dates.examDate)}</p></div>
              <div><p className="text-xs text-ink-700/60">Application Fee</p><p className="font-semibold text-ink-900 text-sm">{job.applicationFee || "As per notification"}</p></div>
              <div><p className="text-xs text-ink-700/60">Salary / Pay Scale</p><p className="font-semibold text-ink-900 text-sm">{job.salary || "As per rules"}</p></div>
            </div>
          </section>

          {/* Selection process */}
          {job.content.selectionProcess && (
            <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-7 shadow-card">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Selection Process</h2>
              <div className="prose-sm text-ink-800 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{ __html: job.content.selectionProcess }} />
            </section>
          )}

          {/* How to apply */}
          {job.content.howToApply && (
            <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-7 shadow-card">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3">How to Apply</h2>
              <div className="prose-sm text-ink-800 [&_p]:mb-2"
                dangerouslySetInnerHTML={{ __html: job.content.howToApply }} />
            </section>
          )}

          {/* Instructions / documents */}
          {job.content.importantInstructions && (
            <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-7 shadow-card">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Required Documents &amp; Important Instructions</h2>
              <div className="prose-sm text-ink-800 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{ __html: job.content.importantInstructions }} />
            </section>
          )}

          {/* Share */}
          <section className="mt-5 rounded-xl2 border border-ink-900/10 bg-white p-5 sm:p-7 shadow-card">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Share this Job</h2>
            <ShareButtons title={job.title} url={`${SITE_URL}/jobs/${job.slug}`} />
          </section>
        </div>

        {/* Sticky action sidebar */}
        <aside>
          <div className="sticky top-24 space-y-3">
            <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card">
              <a
                href={job.links.applyOnline || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Apply Online
              </a>
              <a
                href={job.links.officialNotification || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 block w-full rounded-lg bg-saffron-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-saffron-600 transition-colors"
              >
                Official Notification (PDF)
              </a>
              <a
                href={job.links.officialWebsite || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 block w-full rounded-lg border border-ink-900/15 px-4 py-3 text-center text-sm font-semibold text-ink-800 hover:bg-ink-900/5 transition-colors"
              >
                Official Website
              </a>
              {job.youtubeUrl && (
                <a
                  href={job.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 flex items-center justify-center gap-1.5 w-full rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  ▶ Watch YouTube Video
                </a>
              )}
            </div>

            {relatedJobs.length > 0 && (
              <div className="rounded-xl2 border border-ink-900/10 bg-white p-5 shadow-card">
                <h3 className="font-display text-sm font-bold text-ink-900 mb-3">Related Jobs</h3>
                <div className="space-y-2">
                  {relatedJobs.map((r) => (
                    <Link key={r.id} href={`/jobs/${r.slug}`} className="block rounded-lg border border-ink-900/10 p-3 text-xs hover:border-brand-400">
                      <p className="font-semibold text-ink-900 line-clamp-2">{r.title}</p>
                      <p className="text-ink-700/60 mt-0.5">{r.organization}</p>
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
