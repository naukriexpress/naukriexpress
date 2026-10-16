import Link from "next/link";
import type { Metadata } from "next";
import { queryJobs } from "@/lib/db";
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

export default async function HomePage() {
  const [{ results: latestJobs }, { results: featuredJobs }] = await Promise.all([
    queryJobs({ sort: "latest", pageSize: 12, jobType: ["government", "private", "contract", "internship"] }),
    queryJobs({ featuredOnly: true, pageSize: 4, jobType: ["government", "private", "contract", "internship"] }),
  ]);

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
      {/* Latest Jobs */}
      <section className="container-page mt-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">Latest Job Updates</h2>
            <p className="text-sm text-ink-700/70 mt-1">Freshly posted vacancies, updated every day.</p>
          </div>
          <Link href="/jobs" className="hidden sm:inline text-sm font-semibold text-brand-700 hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
        <Link href="/jobs" className="mt-5 block text-center text-sm font-semibold text-brand-700 sm:hidden">
          View all jobs →
        </Link>
      </section>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <section className="container-page mt-16">
          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold text-ink-900">Featured Jobs</h2>
            <p className="text-sm text-ink-700/70 mt-1">High-vacancy and high-interest recruitments.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

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
