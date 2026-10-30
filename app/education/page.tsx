import type { Metadata } from "next";
import EducationDirectory from "@/components/EducationDirectory";
import { getPublicSiteUpdates } from "@/lib/public-content-cache";

export const metadata: Metadata = {
  title: "Education Entrance Exams & Admission Updates",
  description:
    "Explore Maharashtra and All India entrance exams, admission schedules, official notifications and application links on NaukriExpress.",
};

const VALID_CATEGORIES = [
  "ug",
  "pg",
  "mba-management",
  "phd-research",
  "medical-health",
  "engineering-architecture",
  "law",
  "teaching",
  "design-arts",
  "agriculture",
];

export default async function EducationPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const allItems = await getPublicSiteUpdates("education");
  const requestedCategory = searchParams?.category || "all";
  const activeCategory = VALID_CATEGORIES.includes(requestedCategory)
    ? requestedCategory
    : "all";
  const items =
    activeCategory === "all"
      ? allItems
      : allItems.filter((item) => item.education_category === activeCategory);
  const categoryCounts = Object.fromEntries(
    VALID_CATEGORIES.map((category) => [
      category,
      allItems.filter((item) => item.education_category === category).length,
    ])
  );

  return (
    <EducationDirectory
      items={items}
      activeCategory={activeCategory}
      categoryCounts={categoryCounts}
    />
  );
}
