import type { Metadata } from "next";
import PublicUpdatesList from "@/components/PublicUpdatesList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Government Exam Answer Keys",
  description: "Check the latest government exam answer keys, response sheets and objection details, with links to official recruitment-board notices.",
  alternates: {
    canonical: "https://www.naukriexpress.space/answer-key",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Latest Government Exam Answer Keys | NaukriExpress",
    description: "Check the latest government exam answer keys, response sheets and objection details, with links to official recruitment-board notices.",
    url: "https://www.naukriexpress.space/answer-key",
  },
  twitter: {
    card: "summary",
    title: "Latest Government Exam Answer Keys | NaukriExpress",
    description: "Check the latest government exam answer keys, response sheets and objection details, with links to official recruitment-board notices.",
  },
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
}
