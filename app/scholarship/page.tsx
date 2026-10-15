import type { Metadata } from "next";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const metadata: Metadata = {
  title: "Scholarship - Government Scholarship Updates",
  description:
    "Find the latest scholarship notifications, eligibility criteria, last dates and official Apply Online links.",
};

export default function ScholarshipPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Scholarship
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-ink-700/70">
        Latest scholarship notifications, eligibility details, scholarship
        amounts, deadlines and official application links.
      </p>

      <PublicUpdatesList category="scholarship" />
    </main>
  );

export const dynamic = "force-dynamic";
}
