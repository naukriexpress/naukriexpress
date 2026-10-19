import type { Metadata } from "next";
import InfoListingPage from "@/components/InfoListingPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Latest Admit Cards & Hall Tickets",
  description: "Find government exam admit cards and hall tickets. Check release status, exam dates, download links and official instructions for upcoming recruitment tests.",
  alternates: {
    canonical: "https://www.naukriexpress.space/admit-card",
  },
  openGraph: {
    type: "website",
    siteName: "NaukriExpress",
    title: "Latest Admit Cards & Hall Tickets | NaukriExpress",
    description: "Find government exam admit cards and hall tickets. Check release status, exam dates, download links and official instructions for upcoming recruitment tests.",
    url: "https://www.naukriexpress.space/admit-card",
  },
  twitter: {
    card: "summary",
    title: "Latest Admit Cards & Hall Tickets | NaukriExpress",
    description: "Find government exam admit cards and hall tickets. Check release status, exam dates, download links and official instructions for upcoming recruitment tests.",
  },
};

export default function AdmitCardPage() {
  return (
    <InfoListingPage
      title="Admit Card / Hall Ticket"
      description="Check exam dates and download your admit card for these recruitment drives once released by the respective board."
      ctaLabel="View / Download"
    />
  );
}
