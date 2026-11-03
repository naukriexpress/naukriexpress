import { NextResponse } from "next/server";
import {
  escapeXml,
  getSitemapEntries,
  SITEMAP_CHUNK_SIZE,
  SITEMAP_FILE_GROUPS,
  SITE_URL,
  sitemapChunkCount,
  sitemapUrl,
} from "@/lib/sitemap-data";

export const dynamic = "force-dynamic";

export async function GET() {
  // The index itself must stay available even if one source table is down.
  // Include every category's first sitemap and compute extra chunks when data
  // is available. A failed category can still be fetched independently later.
  const sitemapUrls = new Set<string>([SITE_URL + "/sitemap.xml"]);

  const pageCounts = await Promise.all(
    SITEMAP_FILE_GROUPS.map(async (group) => {
      try {
        const entries = await getSitemapEntries(group.prefix);
        return { prefix: group.prefix, pages: sitemapChunkCount(entries) };
      } catch (error) {
        console.error("Sitemap index could not count category:", group.prefix, error);
        return { prefix: group.prefix, pages: 1 };
      }
    })
  );

  for (const { prefix, pages } of pageCounts) {
    for (let page = 1; page <= pages; page += 1) {
      sitemapUrls.add(sitemapUrl(prefix, page));
    }
  }

  const entries = [...sitemapUrls].map((url) =>
    "<sitemap><loc>" + escapeXml(url) + "</loc></sitemap>"
  );

  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join("\n") + "\n</sitemapindex>";

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
