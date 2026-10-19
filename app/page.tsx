import Link from "next/link";
import type { Metadata } from "next";
import { queryJobs } from "@/lib/db";
import type { JobPosting } from "@/lib/types";
import { hasPendingVacancyDetails, SSC_GD_NOTICE_PENDING_MARKER, VACANCY_DETAILS_PENDING_MARKER } from "@/lib/jobMarkers";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";
import JobCard from "@/components/JobCard";

const SITE_URL = "https://www.naukriexpress.space";

export const metadata: Metadata = {
  title: { absolute: "NaukriExpress | Latest Government & Private Jobs in India" },
  description:
    "NaukriExpress is an independent job update portal for government jobs, private jobs, Maharashtra vacancies, apprenticeships, admit cards, results and recruitment alerts across India.",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "NaukriExpress | Latest Government & Private Jobs in India",
    description:
      "Explore government jobs, private vacancies, Maharashtra recruitment, apprenticeships, admit cards and results on NaukriExpress.",
    url: `${SITE_URL}/`,
  },
  twitter: {
    card: "summary",
    title: "NaukriExpress | Latest Government & Private Jobs in India",
    description:
      "Government jobs, private vacancies, apprenticeships, admit cards and recruitment updates across India.",
  },
};

function isNoticeAwaited(job: JobPosting): boolean {
  const instructions = job.content.importantInstructions || "";
  return instructions.includes(SSC_GD_NOTICE_PENDING_MARKER) ||
    instructions.includes(VACANCY_DETAILS_PENDING_MARKER);
}

function getVerifiedVacancyCount(job: JobPosting): number {
  const pending = hasPendingVacancyDetails({
    importantInstructions: job.content.importantInstructions,
    totalVacancies: job.totalVacancies,
    vacancyBreakdownCounts: job.vacancyBreakdown.map((row) => row.count),
  });
  if (pending || isNoticeAwaited(job)) return 0;

  const rowTotal = job.vacancyBreakdown.reduce(
    (sum, row) => sum + Math.max(0, Number(row.count) || 0),
    0
  );
  return Math.max(Math.max(0, Number(job.totalVacancies) || 0), rowTotal);
}

function isClosingSoon(job: JobPosting, today: string): boolean {
  // A real published deadline should remain high priority even when vacancy
  // counts are not supplied. Only explicitly notice-pending posts are ignored.
  if (job.status !== "published" || isNoticeAwaited(job)) return false;
  const days = getDaysUntilDate(job.dates.lastDate, today);
  return days !== null && days >= 0 && days <= 7;
}

export default async function HomePage() {
  const { results: allLiveJobs } = await queryJobs({
    sort: "latest",
    status: "published",
    pageSize: 100,
    jobType: ["government", "private", "contract", "internship"],
  });
  const today = getIndiaTodayDate();

  // Closing-soon recruitments go first (soonest deadline first). Remaining
  // cards are ordered by verified vacancy count, then newest posting.
  const latestJobs = [...allLiveJobs]
    .sort((a, b) => {
      const urgentA = isClosingSoon(a, today);
      const urgentB = isClosingSoon(b, today);
      if (urgentA !== urgentB) return urgentA ? -1 : 1;

      if (urgentA && urgentB) {
        const daysA = getDaysUntilDate(a.dates.lastDate, today);
        const daysB = getDaysUntilDate(b.dates.lastDate, today);
        if (daysA !== null && daysB !== null && daysA !== daysB) {
          return daysA - daysB;
        }
      }

      const vacancyDifference = getVerifiedVacancyCount(b) - getVerifiedVacancyCount(a);
      if (vacancyDifference !== 0) return vacancyDifference;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 30);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "NaukriExpress",
    alternateName: ["Naukri Express", "naukriexpress.space"],
    url: `${SITE_URL}/`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Latest and priority-sorted jobs */}
      <section className="container-page mt-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">Latest Job Updates</h1>
            <p className="mt-1 text-sm text-ink-700/70">
              Last-date alerts first, followed by recruitments with more vacancies.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {latestJobs.length} Jobs
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <Link href="/jobs" className="mt-6 block rounded-lg border border-brand-600 px-4 py-3 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50">
          View all jobs →
        </Link>
      </section>

      {/* Important Links */}
      <section className="container-page mt-16 mb-16">
        <div className="rounded-xl2 bg-brand-50 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Important Links</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Admit Card", href: "/admit-card" },
              { label: "Results", href: "/results" },
              { label: "Answer Key", href: "/answer-key" },
              { label: "Syllabus", href: "/syllabus" },
              { label: "Government Jobs", href: "/jobs?jobType=government" },
              { label: "Maharashtra Jobs", href: "/jobs?state=Maharashtra" },
              { label: "Jobs Closing Today", href: "/jobs?lastDate=today" },
              { label: "Contact Us", href: "/contact" },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-lg bg-white px-3 py-3 text-center text-sm font-medium text-ink-800 shadow-card hover:shadow-cardHover transition-shadow"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
