import { NextResponse } from "next/server";
import {
  escapeXml,
  getSitemapCollections,
  SITEMAP_CHUNK_SIZE,
  type SitemapFilePrefix,
} from "@/lib/sitemap-data";

export const dynamic = "force-dynamic";

const VALID_PREFIXES = new Set<SitemapFilePrefix>([
  "post", "apprentice", "admit-card", "result",
  "answer-key", "syllabus", "education", "scholarship",
]);

export async function GET(
  _request: Request,
  { params }: { params: { sitemapFile: string } }
) {
  const match = /^(post|apprentice|admit-card|result|answer-key|syllabus|education|scholarship)-sitemap(\d+)\.xml$/.exec(params.sitemapFile);
  if (!match) return new NextResponse("Not found", { status: 404 });

  const prefix = match[1] as SitemapFilePrefix;
  const page = Number(match[2]);
  if (!VALID_PREFIXES.has(prefix) || !Number.isSafeInteger(page) || page < 1) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const collections = await getSitemapCollections();
    const entries = collections[prefix];
    const start = (page - 1) * SITEMAP_CHUNK_SIZE;
    const chunk = entries.slice(start, start + SITEMAP_CHUNK_SIZE);
    if (chunk.length === 0) return new NextResponse("Not found", { status: 404 });

    const urls = chunk.map((entry) => {
      const modified = entry.lastModified
        ? "<lastmod>" + escapeXml(entry.lastModified) + "</lastmod>"
        : "";
      return "<url><loc>" + escapeXml(entry.url) + "</loc>" + modified + "</url>";
    });

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.join("\n") + "\n</urlset>";

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Category sitemap generation failed:", prefix, error);
    return new NextResponse("Sitemap temporarily unavailable", { status: 503 });
  }
}
