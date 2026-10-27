import type { Metadata } from "next";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Government Exam Results",
  description: "Check the latest government exam results, scorecards and merit lists. Find result status and official result links for recruitment and competitive exams.",
  alternates: {
    canonical: "https://www.naukriexpress.space/results",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Latest Government Exam Results | NaukriExpress",
    description: "Check the latest government exam results, scorecards and merit lists. Find result status and official result links for recruitment and competitive exams.",
    url: "https://www.naukriexpress.space/results",
  },
  twitter: {
    card: "summary",
    title: "Latest Government Exam Results | NaukriExpress",
    description: "Check the latest government exam results, scorecards and merit lists. Find result status and official result links for recruitment and competitive exams.",
  },
};

export default function ResultsPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Results
      </h1>


      <PublicUpdatesList category="results" />
    </main>
  );
}
