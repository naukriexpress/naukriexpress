import { NextResponse } from "next/server";
import {
  escapeXml,
  getSitemapCollections,
  SITEMAP_FILE_GROUPS,
  sitemapChunkCount,
  sitemapUrl,
} from "@/lib/sitemap-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collections = await getSitemapCollections();
    const sitemapEntries: Array<{ url: string; lastModified?: string }> = [
      { url: "https://www.naukriexpress.space/sitemap.xml" },
    ];

    for (const group of SITEMAP_FILE_GROUPS) {
      const entries = collections[group.prefix];
      const pages = sitemapChunkCount(entries);
      for (let page = 1; page <= pages; page += 1) {
        const chunk = entries.slice((page - 1) * 200, page * 200);
        const modifiedValues = chunk
          .map((entry) => entry.lastModified)
          .filter((value): value is string => Boolean(value))
          .sort();
        sitemapEntries.push({
          url: sitemapUrl(group.prefix, page),
          lastModified: modifiedValues[modifiedValues.length - 1],
        });
      }
    }

    const entries = sitemapEntries.map((entry) => {
      const lastmod = entry.lastModified
        ? "<lastmod>" + escapeXml(entry.lastModified) + "</lastmod>"
        : "";
      return "<sitemap><loc>" + escapeXml(entry.url) + "</loc>" + lastmod + "</sitemap>";
    });

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      entries.join("\n") + "\n</sitemapindex>";

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap index generation failed:", error);
    return new NextResponse("Sitemap index temporarily unavailable", { status: 503 });
  }
}
