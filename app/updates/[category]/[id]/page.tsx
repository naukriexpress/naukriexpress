import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicUpdateDetail from "@/components/PublicUpdateDetail";
import {
  getEducationDirectory,
  getPublicAdmitCardLinks,
  getPublicSiteUpdates,
  type SiteUpdateCategory,
} from "@/lib/public-content-cache";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.naukriexpress.space";
const UPDATE_CATEGORIES: SiteUpdateCategory[] = ["results", "answer-key", "syllabus", "education", "scholarship"];

type DetailRecord =
  | { kind: "admit-card"; item: { id: number; title: string; url: string } }
  | { kind: "site-update"; item: Awaited<ReturnType<typeof getEducationDirectory>>[number] };

async function findRecord(category: string, idValue: string): Promise<DetailRecord | null> {
  if (!/^\d+$/.test(idValue)) return null;
  const id = Number(idValue);
  if (!Number.isSafeInteger(id)) return null;

  if (category === "admit-card") {
    const links = await getPublicAdmitCardLinks();
    const item = links.find((entry) => entry.id === id);
    return item ? { kind: "admit-card", item } : null;
  }

  if (!UPDATE_CATEGORIES.includes(category as SiteUpdateCategory)) return null;
  const categoryType = category as SiteUpdateCategory;
  const items = categoryType === "education"
    ? await getEducationDirectory()
    : await getPublicSiteUpdates(categoryType);
  const item = items.find((entry) => entry.id === id);
  return item ? { kind: "site-update", item } : null;
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; id: string };
}): Promise<Metadata> {
  try {
    const record = await findRecord(params.category, params.id);
    if (!record) return { title: "Update Not Found | NaukriExpress", robots: { index: false, follow: true } };
    const title = record.item.title;
    const description = record.kind === "admit-card"
      ? "Official admit card and hall ticket link on NaukriExpress."
      : (record.item.description || `Latest ${record.item.category.replace("-", " ")} update on NaukriExpress.`).slice(0, 155);
    const canonical = `${SITE_URL}/updates/${params.category}/${params.id}`;
    return {
      title: `${title} | NaukriExpress`,
      description,
      alternates: { canonical },
      openGraph: { type: "article", siteName: "NaukriExpress", title, description, url: canonical },
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Update | NaukriExpress", robots: { index: false, follow: true } };
  }
}

export default async function PublicUpdateDetailPage({
  params,
}: {
  params: { category: string; id: string };
}) {
  const record = await findRecord(params.category, params.id).catch(() => null);
  if (!record) notFound();
  return <PublicUpdateDetail record={record} />;
}
