import type { Metadata } from "next";
import Link from "next/link";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Government Exam Results",
  description: "Check government exam results, scorecards and merit lists. Read result-checking guidance and open the official result portal for each notice.",
  alternates: {
    canonical: "https://www.naukriexpress.space/results",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Latest Government Exam Results | NaukriExpress",
    description: "Find result declarations, scorecards and merit-list updates with links to the recruiting authority.",
    url: "https://www.naukriexpress.space/results",
  },
  twitter: {
    card: "summary",
    title: "Latest Government Exam Results | NaukriExpress",
    description: "Find result declarations, scorecards and merit-list updates with links to the recruiting authority.",
  },
};

export default function ResultsPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Government Exam Results
      </h1>
      <div className="mt-4 max-w-3xl space-y-3 text-sm leading-7 text-ink-700">
        <p>
          This directory brings together result announcements, scorecard links
          and merit-list notices from recruitment boards and examination
          authorities. Open the individual update to see the organisation,
          publication date and the official result link available for that
          notice.
        </p>
        <h2 className="pt-1 text-base font-bold text-ink-900">
          How to check a result correctly
        </h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Confirm that the exam name, post and examination year match your application.</li>
          <li>Use the recruiting authority’s official portal or PDF, not an unofficial copy.</li>
          <li>Check whether the notice is a scorecard, provisional list, final merit list or a result for the next selection stage.</li>
          <li>Read the official instructions for login details, document verification and further stages.</li>
        </ol>
        <p>
          A result update on NaukriExpress is an information aid, not a
          selection confirmation. The examining authority’s result and
          instructions are final. Send corrections or missing official links
          through our <Link href="/contact" className="font-semibold text-brand-700 underline underline-offset-4">Contact Us page</Link>.
        </p>
      </div>

      <PublicUpdatesList category="results" />
    </main>
  );
}
