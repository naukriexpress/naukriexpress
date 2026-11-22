import type { Metadata } from "next";
import Link from "next/link";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Government Scholarship Updates",
  description: "Find scholarship notices, benefits, eligibility conditions, application deadlines and official application links for students in India.",
  alternates: {
    canonical: "https://www.naukriexpress.space/scholarship",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Government Scholarship Updates | NaukriExpress",
    description: "Explore scholarship notices and check scheme-specific eligibility with official sources.",
    url: "https://www.naukriexpress.space/scholarship",
  },
  twitter: {
    card: "summary",
    title: "Government Scholarship Updates | NaukriExpress",
    description: "Explore scholarship notices and check scheme-specific eligibility with official sources.",
  },
};

export default function ScholarshipPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Scholarship Schemes & Updates
      </h1>
      <div className="mt-4 max-w-3xl space-y-3 text-sm leading-7 text-ink-700">
        <p>
          This page collects scholarship and student-benefit announcements
          with the eligibility and application details available in each
          notice. Scheme rules are not interchangeable: income limits,
          domicile, course, institution type, marks, category and renewal
          conditions can vary between schemes and academic years.
        </p>
        <h2 className="pt-1 text-base font-bold text-ink-900">
          Check eligibility before you apply
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Confirm the academic year and whether the scheme is for fresh or renewal applications.</li>
          <li>Read the official rules for course, institution, income and category requirements.</li>
          <li>Check the required documents, bank-account conditions and any institute-verification step.</li>
          <li>Note the application deadline and whether a separate correction or institute-submission deadline applies.</li>
        </ul>
        <p>
          The published benefit amount is subject to the scheme guidelines and
          the student’s verified application. Always apply through the
          government or scheme provider’s official portal. Report outdated
          details through <Link href="/contact" className="font-semibold text-brand-700 underline underline-offset-4">Contact Us</Link>.
        </p>
      </div>

      <PublicUpdatesList category="scholarship" />
    </main>
  );
}
