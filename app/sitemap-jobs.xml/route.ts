import { NextResponse } from "next/server";
import { getAllJobsRaw } from "@/lib/db";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.naukriexpress.space";

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET() {
  const jobs = await getAllJobsRaw();
  const seen = new Set<string>();
  const entries = jobs
    .filter((job) => (job.status === "published" || job.status === "expired") && typeof job.slug === "string" && job.slug.trim().length > 0)
    .filter((job) => {
      const slug = job.slug.trim();
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((job) => {
      const date = job.updatedAt ? new Date(job.updatedAt) : null;
      const lastmod = date && !Number.isNaN(date.getTime()) ? "<lastmod>" + date.toISOString() + "</lastmod>" : "";
      const url = escapeXml(SITE_URL + "/jobs/" + encodeURIComponent(job.slug));
      const priority = job.featured ? "0.9" : "0.7";
      return "<url><loc>" + url + "</loc>" + lastmod + "<changefreq>daily</changefreq><priority>" + priority + "</priority></url>";
    });
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
