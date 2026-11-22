import Link from "next/link";
import type { Metadata } from "next";
import HighestVacancySections from "@/components/HighestVacancySections";

const SITE_URL = "https://www.naukriexpress.space";

// Homepage job highlights are rendered from a short-lived server cache so
// the visitor receives real job rows in the initial HTML rather than waiting
// for a large client-side /api/jobs download.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "NaukriExpress | Latest Government & Private Jobs in India" },
  description:
    "NaukriExpress helps candidates compare government jobs, private vacancies, Maharashtra recruitment and apprenticeships using qualification and eligibility filters, with links to official notices.",
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "NaukriExpress | Latest Government & Private Jobs in India",
    description:
      "Explore recruitment notices, filter opportunities by eligibility and open the original notification before applying.",
    url: `${SITE_URL}/`,
  },
  twitter: {
    card: "summary",
    title: "NaukriExpress | Latest Government & Private Jobs in India",
    description:
      "Government jobs, private vacancies, apprenticeships and recruitment guidance across India.",
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
      <HighestVacancySections />

      {/* Important Links */}
      <section className="container-page mt-6 mb-8">
        <div className="rounded-xl2 bg-brand-50 p-4 sm:p-6">
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

      <section className="container-page mb-10">
        <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-display text-xl font-extrabold text-ink-900 sm:text-2xl">
            Find vacancies that match your eligibility
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-700">
            A recruitment title alone does not tell you whether a post is
            suitable. Use the job filters to narrow the list by qualification,
            age, gender, category, job type, location and application deadline.
            For multi-post recruitment, check the qualification and age rule
            against the exact post you intend to apply for.
          </p>
          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-bold text-ink-900">1. Shortlist</h3>
              <p className="mt-2 leading-6 text-ink-700">
                Apply the filters that describe your current qualification and
                preferred location. A filter result is a starting point, not a
                final eligibility decision.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-bold text-ink-900">2. Verify the notice</h3>
              <p className="mt-2 leading-6 text-ink-700">
                Open the official notification PDF and confirm the post-wise
                qualification, age cut-off, category rules, fees and dates.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <h3 className="font-bold text-ink-900">3. Apply at the source</h3>
              <p className="mt-2 leading-6 text-ink-700">
                Use the recruiting authority’s own application portal and keep
                the submitted form and payment receipt for your records.
              </p>
            </div>
          </div>
          <p className="mt-5 text-xs leading-6 text-ink-700/70">
            NaukriExpress is an independent information service. The recruiting
            authority’s notification and website remain the final source for
            eligibility and application instructions.
          </p>
        </div>
      </section>
    </>
  );
}
