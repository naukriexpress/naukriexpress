import { NextResponse } from "next/server";
import {
  getEducationDirectory,
  getPublicAdmitCardLinks,
  getPublicSiteUpdates,
} from "@/lib/public-content-cache";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.naukriexpress.space";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function lastmod(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : "<lastmod>" + date.toISOString() + "</lastmod>";
}

export async function GET() {
  const [allUpdates, education, admitCards] = await Promise.all([
    getPublicSiteUpdates(),
    getEducationDirectory(),
    getPublicAdmitCardLinks(),
  ]);

  // Education is sourced from the checked-in directory plus admin-edited overrides.
  // Other categories are the public records inserted through the Admin Portal.
  const updateRecords = [
    ...allUpdates.filter((item) => item.category !== "education"),
    ...education,
  ];
  const seen = new Set<string>();
  const entries: string[] = [];

  for (const item of updateRecords) {
    const key = item.category + ":" + item.id;
    if (seen.has(key)) continue;
    seen.add(key);
    const url = escapeXml(SITE_URL + "/updates/" + item.category + "/" + item.id);
    entries.push("<url><loc>" + url + "</loc>" + lastmod(item.publish_date) + "</url>");
  }

  for (const item of admitCards) {
    const key = "admit-card:" + item.id;
    if (seen.has(key)) continue;
    seen.add(key);
    const url = escapeXml(SITE_URL + "/updates/admit-card/" + item.id);
    entries.push("<url><loc>" + url + "</loc></url>");
  }

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join("\n") + "\n</urlset>";

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
