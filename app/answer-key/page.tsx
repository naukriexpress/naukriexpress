import type { Metadata } from "next";
import Link from "next/link";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Government Exam Answer Keys",
  description: "Find provisional and final exam answer keys, candidate response sheets, objection windows and official examination-board links.",
  alternates: {
    canonical: "https://www.naukriexpress.space/answer-key",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Latest Government Exam Answer Keys | NaukriExpress",
    description: "Compare answer-key notices, response sheets and objection deadlines with official board updates.",
    url: "https://www.naukriexpress.space/answer-key",
  },
  twitter: {
    card: "summary",
    title: "Latest Government Exam Answer Keys | NaukriExpress",
    description: "Compare answer-key notices, response sheets and objection deadlines with official board updates.",
  },
};

export default function AnswerKeyPage() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        Government Exam Answer Keys
      </h1>
      <div className="mt-4 max-w-3xl space-y-3 text-sm leading-7 text-ink-700">
        <p>
          Answer-key notices can include a provisional key, a candidate’s
          recorded responses, an objection facility or a final answer key.
          These are different stages of the same examination process. Each
          update links to the official notice or portal where a link is
          available.
        </p>
        <h2 className="pt-1 text-base font-bold text-ink-900">
          Before submitting an objection
        </h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Match the examination date, paper, shift, question-paper set and response sheet.</li>
          <li>Read the board’s objection instructions, accepted evidence format and fee.</li>
          <li>Submit within the stated deadline and save the confirmation or receipt.</li>
          <li>Check the final answer key or later notice; a provisional key may be revised.</li>
        </ol>
        <p>
          Objection windows and fees are set by the examination authority and
          can close quickly. Verify the current instructions on the official
          portal before paying or submitting anything. To report an incorrect
          date or link, use <Link href="/contact" className="font-semibold text-brand-700 underline underline-offset-4">Contact Us</Link>.
        </p>
      </div>

      <PublicUpdatesList category="answer-key" />
    </main>
  );
}
