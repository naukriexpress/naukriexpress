import type { Metadata } from "next";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Government Scholarship Updates",
  description: "Find government scholarship notifications, eligibility details, application deadlines and official Apply Online links for students across India.",
  alternates: {
    canonical: "https://www.naukriexpress.space/scholarship",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Government Scholarship Updates | NaukriExpress",
    description: "Find government scholarship notifications, eligibility details, application deadlines and official Apply Online links for students across India.",
    url: "https://www.naukriexpress.space/scholarship",
  },
  twitter: {
    card: "summary",
    title: "Government Scholarship Updates | NaukriExpress",
    description: "Find government scholarship notifications, eligibility details, application deadlines and official Apply Online links for students across India.",
  },
};

export default function ScholarshipPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Scholarship
      </h1>


      <PublicUpdatesList category="scholarship" />
    </main>
  );
}
