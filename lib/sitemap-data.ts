import { unstable_cache } from "next/cache";
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
export type SitemapCollections = Record<SitemapFilePrefix, SitemapEntry[]>;

const UPDATE_CATEGORIES: SiteUpdateCategory[] = [
  "results", "answer-key", "syllabus", "scholarship",
];

function uniqueByUrl(entries: SitemapEntry[]): SitemapEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}

function dateValue(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

async function loadSitemapCollections(): Promise<SitemapCollections> {
  const [jobs, updates, education, admitCards] = await Promise.all([
    getAllJobsRaw(),
    getPublicSiteUpdates(),
    getEducationDirectory(),
    getPublicAdmitCardLinks(),
  ]);

  const publicJobs = jobs.filter((job: JobPosting) =>
    (job.status === "published" || job.status === "expired") &&
    typeof job.slug === "string" &&
    job.slug.trim().length > 0
  );

  const uniqueSlugs = new Set<string>();
  const distinctJobs = publicJobs.filter((job) => {
    const slug = job.slug.trim();
    if (uniqueSlugs.has(slug)) return false;
    uniqueSlugs.add(slug);
    return true;
  });

  const jobEntry = (job: JobPosting): SitemapEntry => ({
    url: SITE_URL + "/jobs/" + job.slug,
    lastModified: dateValue(job.updatedAt),
  });

  const updateEntries = (category: SiteUpdateCategory): SitemapEntry[] => {
    const seenIds = new Set<number>();
    return updates
      .filter((item) => item.category === category)
      .filter((item) => {
        if (seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
      })
      .map((item) => ({
        url: SITE_URL + "/updates/" + category + "/" + item.id,
        lastModified: dateValue(item.publish_date),
      }));
  };

  return {
    post: uniqueByUrl(
      distinctJobs
        .filter((job) => job.jobType !== "apprenticeship" && job.jobType !== "scholarship")
        .map(jobEntry)
    ),
    apprentice: uniqueByUrl(
      distinctJobs
        .filter((job) => job.jobType === "apprenticeship")
        .map(jobEntry)
    ),
    "admit-card": uniqueByUrl(
      admitCards.map((item) => ({
        url: SITE_URL + "/updates/admit-card/" + item.id,
      }))
    ),
    result: uniqueByUrl(updateEntries("results")),
    "answer-key": uniqueByUrl(updateEntries("answer-key")),
    syllabus: uniqueByUrl(updateEntries("syllabus")),
    education: uniqueByUrl(
      education.map((item) => ({
        url: SITE_URL + "/updates/education/" + item.id,
        lastModified: dateValue(item.publish_date),
      }))
    ),
    scholarship: uniqueByUrl([
      ...updateEntries("scholarship"),
      ...distinctJobs.filter((job) => job.jobType === "scholarship").map(jobEntry),
    ]),
  };
}

const cachedSitemapCollections = unstable_cache(
  loadSitemapCollections,
  ["naukriexpress-category-sitemap-collections-v1"],
  { revalidate: 300, tags: ["sitemaps"] }
);

export function getSitemapCollections(): Promise<SitemapCollections> {
  return cachedSitemapCollections();
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
  return Math.ceil(entries.length / SITEMAP_CHUNK_SIZE);
}
