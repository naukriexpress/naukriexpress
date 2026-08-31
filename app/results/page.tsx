import type { Metadata } from "next";
import InfoListingPage from "@/components/InfoListingPage";

export const metadata: Metadata = {
  title: "Results - Check Exam & Recruitment Results",
  description: "Check the latest results for government exams and recruitment drives across India.",
};

export default function ResultsPage() {
  return (
    <InfoListingPage
      title="Results"
      description="Track results for recruitment exams. Click a job to see the full recruitment timeline and official links."
      ctaLabel="View Details"
    />
  );
}
