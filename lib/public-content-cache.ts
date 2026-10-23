import { unstable_cache } from "next/cache";
import { getPool } from "@/lib/pgClient";

export const SITE_UPDATE_CATEGORIES = [
  "results",
  "answer-key",
  "syllabus",
  "scholarship",
] as const;

export type SiteUpdateCategory = (typeof SITE_UPDATE_CATEGORIES)[number];
export type SiteUpdateItem = {
  id: number; category: SiteUpdateCategory; title: string;
  organization: string | null; description: string | null;
  publish_date: string | null; amount: string | null;
  eligibility: string | null; last_date: string | null;
  item_url: string | null; objection_url: string | null; apply_url: string | null;
};
export type AdmitCardLink = { id: number; title: string; url: string };

let contentTablesReady: Promise<void> | null = null;

/** Initialize content tables once per warm server instance, not on each visitor request. */
export async function ensurePublicContentTables(): Promise<void> {
  if (!contentTablesReady) {
    const pool = getPool();
    contentTablesReady = Promise.all([
      pool.query(`
        CREATE TABLE IF NOT EXISTS site_updates (
          id BIGSERIAL PRIMARY KEY,
          category TEXT NOT NULL CHECK (category IN ('results', 'answer-key', 'syllabus', 'scholarship')),
          title TEXT NOT NULL, organization TEXT, description TEXT, publish_date DATE,
          amount TEXT, eligibility TEXT, last_date DATE, item_url TEXT,
          objection_url TEXT, apply_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `),
      pool.query(`
        CREATE TABLE IF NOT EXISTS admit_card_links (
          id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, url TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `),
    ]).then(() => undefined).catch((error) => {
      contentTablesReady = null;
      throw error;
    });
  }
  await contentTablesReady;
}

const cachedSiteUpdates = unstable_cache(
  async (category: string): Promise<SiteUpdateItem[]> => {
    await ensurePublicContentTables();
    const pool = getPool();
    const result = category === "all"
      ? await pool.query(`SELECT id, category, title, organization, description, publish_date,
          amount, eligibility, last_date, item_url, objection_url, apply_url
          FROM site_updates ORDER BY created_at DESC`)
      : await pool.query(`SELECT id, category, title, organization, description, publish_date,
          amount, eligibility, last_date, item_url, objection_url, apply_url
          FROM site_updates WHERE category = $1 ORDER BY created_at DESC`, [category]);
    return result.rows as SiteUpdateItem[];
  },
  ["naukriexpress-public-site-updates-v1"],
  { revalidate: 300, tags: ["site-updates"] }
);

export function getPublicSiteUpdates(category?: SiteUpdateCategory): Promise<SiteUpdateItem[]> {
  return cachedSiteUpdates(category ?? "all");
}

const cachedAdmitCards = unstable_cache(
  async (): Promise<AdmitCardLink[]> => {
    await ensurePublicContentTables();
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, title, url FROM admit_card_links ORDER BY created_at DESC`
    );
    return result.rows as AdmitCardLink[];
  },
  ["naukriexpress-admit-card-links-v1"],
  { revalidate: 300, tags: ["admit-cards"] }
);

export function getPublicAdmitCardLinks(): Promise<AdmitCardLink[]> {
  return cachedAdmitCards();
}
