import { unstable_cache } from "next/cache";
import { getJobBySlug, queryJobs } from "@/lib/db";
import { getPool } from "@/lib/pgClient";
import type { JobFilters } from "@/lib/types";

// These tagged wrappers are only used by public pages; admin reads stay uncached.
const cachedJobQuery = unstable_cache(
  async (filters: JobFilters) => queryJobs(filters),
  ["public-job-query-v1"],
  { revalidate: 300, tags: ["public-jobs"] }
);

const cachedJobBySlug = unstable_cache(
  async (slug: string) => (await getJobBySlug(slug)) ?? null,
  ["public-job-by-slug-v1"],
  { revalidate: 300, tags: ["public-jobs"] }
);

export function getCachedPublicJobs(filters: JobFilters) {
  return cachedJobQuery(filters);
}

export function getCachedPublicJob(slug: string) {
  return cachedJobBySlug(slug);
}

export type AdmitCardLink = {
  id: number;
  title: string;
  url: string;
};

const getAdmitCardLinks = unstable_cache(
  async (): Promise<AdmitCardLink[]> => {
    const { rows } = await getPool().query(
      `SELECT id, title, url
       FROM admit_card_links
       ORDER BY created_at DESC`
    );
    return rows as AdmitCardLink[];
  },
  ["public-admit-card-links-v1"],
  { revalidate: 300, tags: ["public-admit-cards"] }
);

export function getCachedAdmitCardLinks() {
  return getAdmitCardLinks();
}

export type PublicUpdateItem = {
  id: number;
  title: string;
  organization: string | null;
  description: string | null;
  publish_date: string | null;
  amount: string | null;
  eligibility: string | null;
  last_date: string | null;
  item_url: string | null;
  objection_url: string | null;
  apply_url: string | null;
};

const getSiteUpdates = unstable_cache(
  async (category: "results" | "answer-key" | "syllabus" | "scholarship") => {
    const { rows } = await getPool().query(
      `SELECT id, title, organization, description, publish_date,
              amount, eligibility, last_date, item_url, objection_url, apply_url
       FROM site_updates
       WHERE category = $1
       ORDER BY created_at DESC`,
      [category]
    );
    return rows as PublicUpdateItem[];
  },
  ["public-site-updates-v1"],
  { revalidate: 300, tags: ["public-site-updates"] }
);

export function getCachedPublicUpdates(
  category: "results" | "answer-key" | "syllabus" | "scholarship"
) {
  return getSiteUpdates(category);
}
