import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about NaukriExpress, an independent recruitment information portal operated by BGI Cybercafe, its source standards and how to report corrections.",
  alternates: {
    canonical: "https://www.naukriexpress.space/about",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "About Us | NaukriExpress",
    description: "How NaukriExpress organises recruitment information, official sources, eligibility summaries and corrections.",
    url: "https://www.naukriexpress.space/about",
  },
  twitter: {
    card: "summary",
    title: "About Us | NaukriExpress",
    description: "How NaukriExpress organises recruitment information, official sources, eligibility summaries and corrections.",
  },
};

export default function AboutPage() {
  return (
    <div className="container-page py-10 max-w-3xl prose-sm">
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">About NaukriExpress</h1>
      <div className="space-y-4 text-sm leading-relaxed text-ink-800">
        <p>
          NaukriExpress is an independent job information portal that helps
          candidates across India discover government and private job
          vacancies they may be eligible for. The job directory includes
          filters for qualification, gender, category, age, location, job
          type and closing date.
        </p>
        <p>
          We organise publicly available recruitment notifications into
          searchable summaries so candidates can compare important details
          before opening the original notice. NaukriExpress is not affiliated
          with any government department, recruitment board or private
          employer. The official notification remains the final authority.
        </p>
        <p>
          NaukriExpress is founded and operated by <strong>BGI Cybercafe</strong>.
        </p>

        <h2 className="font-display font-bold text-ink-900 mt-6">
          How We Prepare Recruitment Updates
        </h2>
        <p>
          A useful recruitment summary should identify the recruiting
          organisation, advertisement number when available, post names,
          post-wise vacancies, qualification, age limit, location, key dates,
          application fee and links to the official notification and
          application portal. The information shown can vary by notice because
          recruiting authorities do not always publish every detail at the
          same time.
        </p>
        <p>
          We use the recruiting authority’s notification and official website
          as the controlling sources. Where a date, fee, vacancy count,
          selection detail or application link has not been confirmed in the
          source material available to us, it should be treated as pending
          rather than assumed from an older recruitment cycle.
        </p>

        <h2 className="font-display font-bold text-ink-900 mt-6">
          Understanding Eligibility Filters
        </h2>
        <p>
          Filters are designed to help candidates create an initial shortlist.
          They do not replace post-wise eligibility rules. A recruitment with
          several posts may have different qualifications, age limits,
          experience requirements or category conditions for each post. In
          those cases, candidates should open the vacancy table and official
          notification and check the exact post before applying.
        </p>
        <p>
          A filter match is not a guarantee that an application will be
          accepted. The recruiting authority decides eligibility after
          checking the candidate’s documents and the rules in the applicable
          advertisement.
        </p>

        <h2 className="font-display font-bold text-ink-900 mt-6">
          Updates, Expired Notices and Corrections
        </h2>
        <p>
          Recruitment dates and instructions can change through corrigenda,
          revised notices or deadline extensions. When an official amendment
          is available, the relevant summary should be corrected to reflect
          it. A closing date shown in the past means that the listed
          application window has ended; an archived notice is provided for
          reference and should not be treated as an open vacancy.
        </p>
        <p>
          If you find an inaccurate qualification, an expired or broken link,
          a changed deadline or a missing official notice, please send the
          page URL and the relevant official source through our{" "}
          <Link href="/contact" className="font-semibold text-brand-700 underline underline-offset-4">
            Contact Us page
          </Link>
          . Including the advertisement number or exam name helps us identify
          the correct record.
        </p>
        <p>
          NaukriExpress provides information for convenience and does not make
          recruitment, admission, scholarship or examination decisions.
          Candidates should independently confirm eligibility, dates, fees,
          documents and application status with the relevant authority.
        </p>
      </div>
    </div>
  );
}
