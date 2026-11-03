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
    const sitemapUrls = ["https://www.naukriexpress.space/sitemap.xml"];

    for (const group of SITEMAP_FILE_GROUPS) {
      const entries = collections[group.prefix];
      const pages = sitemapChunkCount(entries);
      for (let page = 1; page <= pages; page += 1) {
        sitemapUrls.push(sitemapUrl(group.prefix, page));
      }
    }

    const entries = sitemapUrls.map((url) => {
      const lastmod = new Date().toISOString();
      return "<sitemap><loc>" + escapeXml(url) + "</loc><lastmod>" + lastmod + "</lastmod></sitemap>";
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
