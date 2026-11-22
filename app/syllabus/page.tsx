import type { Metadata } from "next";
import Link from "next/link";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Government Exam Syllabus & Exam Patterns",
  description: "Find government exam syllabus PDFs and exam-pattern notices, with guidance for checking the correct post, subject and recruitment cycle.",
  alternates: {
    canonical: "https://www.naukriexpress.space/syllabus",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Government Exam Syllabus & Exam Patterns | NaukriExpress",
    description: "Find official syllabus and exam-pattern notices for recruitment tests.",
    url: "https://www.naukriexpress.space/syllabus",
  },
  twitter: {
    card: "summary",
    title: "Government Exam Syllabus & Exam Patterns | NaukriExpress",
    description: "Find official syllabus and exam-pattern notices for recruitment tests.",
  },
};

export default function SyllabusPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Government Exam Syllabus
      </h1>
      <div className="mt-4 max-w-3xl space-y-3 text-sm leading-7 text-ink-700">
        <p>
          Use this directory to locate syllabus, scheme-of-examination and
          exam-pattern updates. A syllabus can differ by post, subject,
          recruitment year or examination stage, so the title of a PDF alone
          is not enough to confirm that it applies to your exam.
        </p>
        <h2 className="pt-1 text-base font-bold text-ink-900">
          Check these details in the official PDF
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Recruitment advertisement number, post name and applicable year.</li>
          <li>Paper or subject names, number of questions and total marks.</li>
          <li>Exam duration, marking method and any negative-marking rule.</li>
          <li>Whether the authority has published a corrigendum or a revised syllabus.</li>
        </ul>
        <p>
          NaukriExpress links to source material for convenience. Follow the
          latest instructions of the examining authority, and report a broken
          PDF or mismatched syllabus through <Link href="/contact" className="font-semibold text-brand-700 underline underline-offset-4">Contact Us</Link>.
        </p>
      </div>

      <PublicUpdatesList category="syllabus" />
    </main>
  );
}
