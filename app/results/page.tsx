import type { Metadata } from "next";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const metadata: Metadata = {
  title: "Results - Check Exam & Recruitment Results",
  description:
    "Check the latest government exam results, merit lists and official result links.",
};

export default function ResultsPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Results
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-ink-700/70">
        Government exam results, merit lists and official result links.
      </p>

      <PublicUpdatesList category="results" />
    </main>
  );

export const dynamic = "force-dynamic";
}
