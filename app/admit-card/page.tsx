import type { Metadata } from "next";
import InfoListingPage from "@/components/InfoListingPage";

export const metadata: Metadata = {
  title: "Admit Card - Download Hall Tickets",
  description: "Download admit cards / hall tickets for upcoming government exams and recruitment tests.",
};

export default function AdmitCardPage() {
  return (
    <InfoListingPage
      title="Admit Card / Hall Ticket"
      description="Check exam dates and download your admit card for these recruitment drives once released by the respective board."
      ctaLabel="View Details"
    />
  );
}
