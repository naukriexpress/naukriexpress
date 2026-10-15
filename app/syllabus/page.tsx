import type { Metadata } from "next";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const metadata: Metadata = {
  title: "Syllabus - Government Exam Syllabus",
  description:
    "Check the latest government exam syllabus, exam patterns and official syllabus links.",
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

export const dynamic = "force-dynamic";
}
