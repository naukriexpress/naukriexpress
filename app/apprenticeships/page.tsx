import type { Metadata } from "next";
import TypeListingPage from "@/components/TypeListingPage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Latest Apprenticeships | Vacancies and Apply Online",
  description: "Browse active apprenticeship vacancies, eligibility, last dates and official application links.",
  alternates: { canonical: "/apprenticeships" },
};

export default function ApprenticeshipsPage({ searchParams }: { searchParams: { page?: string } }) {
  return <TypeListingPage type="apprenticeship" title="Apprenticeships" description="Apprenticeship vacancies and application details." page={Number(searchParams.page) || 1} basePath="/apprenticeships" />;
}
