import { unstable_cache } from "next/cache";
import { NextResponse } from "next/server";
import { getAllJobsRaw } from "@/lib/db";
import {
  getEducationDirectory,
  getPublicAdmitCardLinks,
  getPublicSiteUpdates,
  type SiteUpdateCategory,
} from "@/lib/public-content-cache";
import type { JobPosting } from "@/lib/types";

export const SITE_URL = "https://www.naukriexpress.space";
export const SITEMAP_CHUNK_SIZE = 200;

export const SITEMAP_FILE_GROUPS = [
  { prefix: "post", label: "Jobs", category: "jobs" },
  { prefix: "apprentice", label: "Apprenticeships", category: "apprentice" },
  { prefix: "admit-card", label: "Admit Cards", category: "admit-card" },
  { prefix: "result", label: "Results", category: "results" },
  { prefix: "answer-key", label: "Answer Keys", category: "answer-key" },
  { prefix: "syllabus", label: "Syllabus", category: "syllabus" },
  { prefix: "education", label: "Education Entrance Exams", category: "education" },
  { prefix: "scholarship", label: "Scholarships", category: "scholarship" },
] as const;

export type SitemapFilePrefix = (typeof SITEMAP_FILE_GROUPS)[number]["prefix"];
export type SitemapEntry = { url: string; lastModified?: string };

function dateValue(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function uniqueByUrl(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

// Each category has its own cached data loader. A missing or temporarily
// unavailable source for one category must not prevent other sitemaps working.
const cachedPublicJobs = unstable_cache(
  async () => getAllJobsRaw(),
  ["naukriexpress-sitemap-public-jobs-v2"],
  { revalidate: 300, tags: ["jobs", "sitemaps"] }
);

const cachedAdmitCardEntries = unstable_cache(
  async (): Promise<SitemapEntry[]> => {
    const records = await getPublicAdmitCardLinks();
    return uniqueByUrl(records.map((item) => ({
      url: SITE_URL + "/updates/admit-card/" + item.id,
    })));
  },
  ["naukriexpress-sitemap-admit-cards-v2"],
  { revalidate: 300, tags: ["admit-cards", "sitemaps"] }
);

const cachedUpdateEntries = unstable_cache(
  async (category: SiteUpdateCategory): Promise<SitemapEntry[]> => {
    const records = await getPublicSiteUpdates(category);
    return uniqueByUrl(records.map((item) => ({
      url: SITE_URL + "/updates/" + category + "/" + item.id,
      lastModified: dateValue(item.publish_date),
    })));
  },
  ["naukriexpress-sitemap-updates-v2"],
  { revalidate: 300, tags: ["site-updates", "sitemaps"] }
);

const cachedEducationEntries = unstable_cache(
  async (): Promise<SitemapEntry[]> => {
    const records = await getEducationDirectory();
    return uniqueByUrl(records.map((item) => ({
      url: SITE_URL + "/updates/education/" + item.id,
      lastModified: dateValue(item.publish_date),
    })));
  },
  ["naukriexpress-sitemap-education-v2"],
  { revalidate: 300, tags: ["education-overrides", "sitemaps"] }
);

async function getJobEntries(kind: "post" | "apprentice" | "scholarship"): Promise<SitemapEntry[]> {
  const jobs = await cachedPublicJobs();
  const publicJobs = jobs.filter((job: JobPosting) =>
    (job.status === "published" || job.status === "expired") &&
    typeof job.slug === "string" &&
    job.slug.trim().length > 0
  );
  const seen = new Set<string>();
  const entries = publicJobs
    .filter((job) => {
      const type = String(job.jobType);
      if (kind === "apprentice") return type === "apprenticeship";
      if (kind === "scholarship") return type === "scholarship";
      return type !== "apprenticeship" && type !== "scholarship";
    })
    .filter((job) => {
      const slug = job.slug.trim();
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((job) => ({
      url: SITE_URL + "/jobs/" + encodeURIComponent(job.slug.trim()),
      lastModified: dateValue(job.updatedAt),
    }));
  return uniqueByUrl(entries);
}

const cachedJobEntries = {
  post: unstable_cache(
    () => getJobEntries("post"),
    ["naukriexpress-sitemap-posts-v2"],
    { revalidate: 300, tags: ["jobs", "sitemaps"] }
  ),
  apprentice: unstable_cache(
    () => getJobEntries("apprentice"),
    ["naukriexpress-sitemap-apprentices-v2"],
    { revalidate: 300, tags: ["jobs", "sitemaps"] }
  ),
  scholarship: unstable_cache(
    () => getJobEntries("scholarship"),
    ["naukriexpress-sitemap-scholarship-jobs-v2"],
    { revalidate: 300, tags: ["jobs", "sitemaps"] }
  ),
};

export async function getSitemapEntries(prefix: SitemapFilePrefix): Promise<SitemapEntry[]> {
  switch (prefix) {
    case "post":
      return cachedJobEntries.post();
    case "apprentice":
      return cachedJobEntries.apprentice();
    case "admit-card":
      return cachedAdmitCardEntries();
    case "result":
      return cachedUpdateEntries("results");
    case "answer-key":
      return cachedUpdateEntries("answer-key");
    case "syllabus":
      return cachedUpdateEntries("syllabus");
    case "education":
      return cachedEducationEntries();
    case "scholarship": {
      const [updates, jobs] = await Promise.all([
        cachedUpdateEntries("scholarship"),
        cachedJobEntries.scholarship(),
      ]);
      return uniqueByUrl([...updates, ...jobs]);
    }
  }
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function sitemapUrl(prefix: SitemapFilePrefix, page: number): string {
  return SITE_URL + "/" + prefix + "-sitemap" + page + ".xml";
}

export function sitemapChunkCount(entries: SitemapEntry[]): number {
  return Math.max(1, Math.ceil(entries.length / SITEMAP_CHUNK_SIZE));
}

export async function createSitemapResponse(
  prefix: SitemapFilePrefix,
  page: number
): Promise<NextResponse> {
  try {
    if (!Number.isSafeInteger(page) || page < 1) {
      return new NextResponse("Not found", { status: 404 });
    }

    const entries = await getSitemapEntries(prefix);
    const start = (page - 1) * SITEMAP_CHUNK_SIZE;
    const chunk = entries.slice(start, start + SITEMAP_CHUNK_SIZE);

    // Keep page 1 a valid XML sitemap even if a category is temporarily empty.
    // Non-existent later chunks still return 404 to avoid phantom sitemap URLs.
    if (page > 1 && chunk.length === 0) {
      return new NextResponse("Not found", { status: 404 });
    }

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
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (error) {
    console.error("Category sitemap generation failed:", prefix, page, error);
    return new NextResponse("Sitemap temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "60", "Cache-Control": "no-store" },
    });
  }
}
