import type { Metadata } from "next";
import InfoListingPage from "@/components/InfoListingPage";

export const metadata: Metadata = {
  title: "Answer Key - Provisional & Final Answer Keys",
  description: "Access provisional and final answer keys for recent government recruitment exams.",
};

export default function AnswerKeyPage() {
  return (
    <InfoListingPage
      title="Answer Key"
      description="Provisional and final answer keys are published here once released by the exam-conducting body."
      ctaLabel="View Details"
    />
  );
}
