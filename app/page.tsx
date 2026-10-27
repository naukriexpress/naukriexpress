import Link from "next/link";
import type { Metadata } from "next";
import HomeLatestJobs from "@/components/HomeLatestJobs";
import HighestVacancyJobs from "@/components/HighestVacancyJobs";

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
      "Explore government jobs, private vacancies, Maharashtra recruitment, apprenticeships, admit cards, results and recruitment updates on NaukriExpress.",
    url: `${SITE_URL}/`,
  },
  twitter: {
    card: "summary",
    title: "NaukriExpress | Latest Government & Private Jobs in India",
    description:
      "Government jobs, private vacancies, apprenticeships, admit cards and recruitment updates across India.",
  },
};

export default function HomePage() {
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

      {/* Highlight the currently open recruitments with the most confirmed vacancies. */}
      <HighestVacancyJobs />

      {/* Static page shell renders immediately; job data loads in the client feed. */}
      <HomeLatestJobs />

      {/* Important Links */}
      <section className="container-page mt-16 mb-16">
        <div className="rounded-xl2 bg-brand-50 p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-bold text-ink-900">Important Links</h2>
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
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg bg-white px-3 py-3 text-center text-sm font-medium text-ink-800 shadow-card transition-shadow hover:shadow-cardHover"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
