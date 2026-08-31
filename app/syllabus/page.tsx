import type { Metadata } from "next";
import InfoListingPage from "@/components/InfoListingPage";

export const metadata: Metadata = {
  title: "Syllabus - Exam Syllabus & Pattern",
  description: "Download the latest exam syllabus and exam pattern for government job recruitment exams.",
};

export default function SyllabusPage() {
  return (
    <InfoListingPage
      title="Syllabus &amp; Exam Pattern"
      description="Detailed syllabus and exam pattern for each recruitment, sourced from the official notification."
      ctaLabel="View Details"
    />
  );
}
