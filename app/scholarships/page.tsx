import type { Metadata } from "next";
import TypeListingPage from "@/components/TypeListingPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Latest Scholarships | Eligibility, Deadline and Apply Link",
  description: "Explore active scholarship programmes, eligibility, application deadlines and official apply links.",
  alternates: { canonical: "/scholarships" },
};

export default function ScholarshipsPage({ searchParams }: { searchParams: { page?: string } }) {
  return <TypeListingPage type="scholarship" title="Scholarships" description="Scholarship programmes, deadlines and application details." page={Number(searchParams.page) || 1} basePath="/scholarships" />;
}
