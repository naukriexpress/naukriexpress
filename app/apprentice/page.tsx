import ApprenticeJobsList from "@/components/ApprenticeJobsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest Apprentice Recruitment | ITI, Diploma & Graduate Jobs",
  description:
    "Browse current apprentice recruitment across India for ITI, Diploma and Graduate candidates. Check eligibility, trade-wise vacancies, application deadlines, official notifications and apply links.",
  alternates: {
    canonical: "https://www.naukriexpress.space/apprentice",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Latest Apprentice Recruitment | ITI, Diploma & Graduate Jobs | NaukriExpress",
    description: "Browse current apprentice recruitment across India for ITI, Diploma and Graduate candidates. Check eligibility, trade-wise vacancies, application deadlines, official notifications and apply links.",
    url: "https://www.naukriexpress.space/apprentice",
  },
  twitter: {
    card: "summary",
    title: "Latest Apprentice Recruitment | ITI, Diploma & Graduate Jobs | NaukriExpress",
    description: "Browse current apprentice recruitment across India for ITI, Diploma and Graduate candidates. Check eligibility, trade-wise vacancies, application deadlines, official notifications and apply links.",
  },
};

export default function ApprenticePage() {
  return (
    <main className="container-page py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          Latest Apprentice Recruitment
        </h1>
      </div>

      <ApprenticeJobsList />
    </main>
  );
}
