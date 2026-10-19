import type { Metadata } from "next";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Government Exam Syllabus & Exam Patterns",
  description: "Check government exam syllabus, exam patterns and official syllabus PDFs for recruitment tests. Find updates and links to relevant notices.",
  alternates: {
    canonical: "https://www.naukriexpress.space/syllabus",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Government Exam Syllabus & Exam Patterns | NaukriExpress",
    description: "Check government exam syllabus, exam patterns and official syllabus PDFs for recruitment tests. Find updates and links to relevant notices.",
    url: "https://www.naukriexpress.space/syllabus",
  },
  twitter: {
    card: "summary",
    title: "Government Exam Syllabus & Exam Patterns | NaukriExpress",
    description: "Check government exam syllabus, exam patterns and official syllabus PDFs for recruitment tests. Find updates and links to relevant notices.",
  },
};

export default function SyllabusPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Syllabus
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-ink-700/70">
        Latest government exam syllabus, exam patterns and official syllabus
        links.
      </p>

      <PublicUpdatesList category="syllabus" />
    </main>
  );
}
