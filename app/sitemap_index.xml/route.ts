import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.naukriexpress.space";

export async function GET() {
  const lastmod = new Date().toISOString();
  const sitemaps = [SITE_URL + "/sitemap.xml", SITE_URL + "/sitemap-jobs.xml", SITE_URL + "/sitemap-content.xml"];
  const entries = sitemaps.map((url) => "<sitemap><loc>" + url + "</loc><lastmod>" + lastmod + "</lastmod></sitemap>").join("\n");
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries + "\n</sitemapindex>";
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
