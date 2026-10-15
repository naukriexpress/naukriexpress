import type { Metadata } from "next";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const metadata: Metadata = {
  title: "Answer Key - Government Exam Answer Keys",
  description:
    "Check the latest government exam answer keys, official answer key links and objection details.",
};

export default function AnswerKeyPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Answer Key
      </h1>

      <p className="mt-2 max-w-2xl text-sm text-ink-700/70">
        Latest government exam answer keys, official answer key links and
        objection details.
      </p>

      <PublicUpdatesList category="answer-key" />
    </main>
  );

export const dynamic = "force-dynamic";
}
