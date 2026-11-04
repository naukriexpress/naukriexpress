import { unstable_cache } from "next/cache";
import { getPool } from "@/lib/pgClient";
import type { PoolClient } from "pg";
import educationDirectory from "@/data/educationDirectory.json";
import admitCardLinksSnapshot from "@/data/admit-card-links.json";
import siteUpdateSnapshotData from "@/data/site-updates-snapshot.json";

export const SITE_UPDATE_CATEGORIES = [
  "results",
  "answer-key",
  "syllabus",
  "scholarship",
  "education",
] as const;

export type SiteUpdateCategory = (typeof SITE_UPDATE_CATEGORIES)[number];
export type SiteUpdateItem = {
  id: number; category: SiteUpdateCategory; title: string;
  organization: string | null; description: string | null;
  publish_date: string | null; amount: string | null;
  eligibility: string | null; last_date: string | null;
  item_url: string | null; objection_url: string | null; apply_url: string | null;
  education_category: string | null; start_date: string | null;
  exam_date: string | null; is_new: boolean;
  application_start_display: string | null;
  application_end_display: string | null;
  exam_date_display: string | null;
  academic_year: string | null;
  status_as_of: string | null;
  cap_url: string | null;
  official_website_url: string | null;
  source_id: string | null;
  created_at?: string;
  is_deleted?: boolean;
};
export type AdmitCardLink = { id: number; title: string; url: string };

let contentTablesReady: Promise<void> | null = null;

async function seedEducationDataset(client: PoolClient) {
  const version = "maharashtra-entrance-directory-2026-27-v1";
  const existing = await client.query(
    "SELECT version FROM education_dataset_imports WHERE version = $1",
    [version]
  );
  if (existing.rowCount) return;

  const dataset = educationSeed;

  for (const exam of dataset.exams) {
    const applicationEnd = exam.application.final_end_date || exam.application.initial_end_date;
    const description = [
      `Short name: ${exam.short_name}`,
      `Academic year: ${exam.academic_year}`,
      exam.courses?.length ? `Courses: ${exam.courses.join(", ")}` : "",
      `Exam level: ${exam.exam_level}; Type: ${exam.exam_type}`,
      exam.notes || "",
    ].filter(Boolean).join("\n");

    await client.query(
      `INSERT INTO site_updates (
        category, title, organization, description, publish_date,
        eligibility, last_date, item_url, apply_url,
        education_category, start_date, exam_date, is_new,
        application_start_display, application_end_display,
        exam_date_display, academic_year, status_as_of, cap_url,
        official_website_url, source_id
      ) VALUES (
        'education', $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, FALSE, $12, $13, $14, $15, $16, $17, $18, $19
      ) ON CONFLICT (source_id) DO NOTHING`,
      [
        exam.name,
        exam.conducting_authority || null,
        description || null,
        dataset.last_verified_date,
        exam.eligibility_summary || null,
        applicationEnd,
        exam.notification_pdf_url,
        exam.apply_url,
        exam.category_id,
        exam.application.start_date,
        exam.examination.start_date,
        exam.application.display_start || null,
        exam.application.display_end || null,
        exam.examination.display_date || null,
        exam.academic_year,
        exam.status_as_of_2026_10_30,
        exam.cap_url,
        exam.official_website_url,
        exam.id,
      ]
    );
  }

  await client.query(
    "INSERT INTO education_dataset_imports (version) VALUES ($1) ON CONFLICT (version) DO NOTHING",
    [version]
  );
}

/** Initialize content tables and import the supplied 2026-27 starter directory once. */
export async function ensurePublicContentTables(): Promise<void> {
  if (!contentTablesReady) {
    const pool = getPool();
    contentTablesReady = (async () => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(74620301)");
        await client.query(`
          CREATE TABLE IF NOT EXISTS site_updates (
            id BIGSERIAL PRIMARY KEY,
            category TEXT NOT NULL,
            title TEXT NOT NULL, organization TEXT, description TEXT, publish_date DATE,
            amount TEXT, eligibility TEXT, last_date DATE, item_url TEXT,
            objection_url TEXT, apply_url TEXT, is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await client.query(`
          ALTER TABLE site_updates DROP CONSTRAINT IF EXISTS site_updates_category_check;
          ALTER TABLE site_updates
            ADD CONSTRAINT site_updates_category_check
            CHECK (category IN ('results', 'answer-key', 'syllabus', 'scholarship', 'education'));
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS education_category TEXT;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS start_date DATE;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS exam_date DATE;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT FALSE;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS application_start_display TEXT;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS application_end_display TEXT;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS exam_date_display TEXT;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS academic_year TEXT;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS status_as_of TEXT;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS cap_url TEXT;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS official_website_url TEXT;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS source_id TEXT;
          ALTER TABLE site_updates ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
          CREATE UNIQUE INDEX IF NOT EXISTS site_updates_source_id_all_unique
            ON site_updates(source_id);
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS education_dataset_imports (
            version TEXT PRIMARY KEY,
            imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await client.query(`
          CREATE TABLE IF NOT EXISTS admit_card_links (
            id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, url TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        await seedEducationDataset(client);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    })().catch((error) => {
      contentTablesReady = null;
      throw error;
    });
  }
  await contentTablesReady;
}

const siteUpdateSnapshot = siteUpdateSnapshotData as SiteUpdateItem[];

const cachedSiteUpdates = unstable_cache(
  async (category: string): Promise<SiteUpdateItem[]> => {
    const snapshotRows = category === "all"
      ? siteUpdateSnapshot
      : siteUpdateSnapshot.filter((item) => item.category === category);

    try {
      await ensurePublicContentTables();
      const pool = getPool();
      const fields = `id, category, title, organization, description, publish_date,
        amount, eligibility, last_date, item_url, objection_url, apply_url,
        education_category, start_date, exam_date, is_new,
        application_start_display, application_end_display, exam_date_display,
        academic_year, status_as_of, cap_url, official_website_url, source_id,
        created_at, is_deleted`;
      const result = await pool.query(
        `SELECT ${fields} FROM site_updates
         ${category === "all" ? "" : "WHERE category = $1"}
         ORDER BY created_at DESC, id DESC`,
        category === "all" ? [] : [category]
      );
      const liveRows = result.rows.map((row) => ({ ...row, id: Number(row.id) }));
      const snapshotIds = new Set(snapshotRows.map((item) => String(item.id)));
      const liveById = new Map(liveRows.map((item) => [String(item.id), item]));
      const deletedIds = new Set(
        liveRows.filter((item) => item.is_deleted === true).map((item) => String(item.id))
      );

      const mergedSnapshot = snapshotRows
        .filter((item) => !deletedIds.has(String(item.id)))
        .map((snapshotItem) => {
          const liveItem = liveById.get(String(snapshotItem.id));
          if (!liveItem) return snapshotItem;
          liveById.delete(String(snapshotItem.id));
          const { is_deleted: _isDeleted, ...visibleItem } = liveItem;
          return { ...snapshotItem, ...visibleItem } as SiteUpdateItem;
        });

      const newLiveRecords = liveRows
        .filter((item) =>
          !snapshotIds.has(String(item.id)) &&
          item.is_deleted !== true &&
          (category !== "all" || item.category !== "education")
        )
        .map(({ is_deleted: _isDeleted, ...item }) => item as SiteUpdateItem);

      const updates = [...newLiveRecords, ...mergedSnapshot].sort((a, b) => {
        const dateA = new Date(a.created_at || a.publish_date || 0).getTime();
        const dateB = new Date(b.created_at || b.publish_date || 0).getTime();
        return dateB - dateA;
      });

      if (category === "all") {
        const educationRows = await getEducationDirectory();
        return [...educationRows, ...updates];
      }
      return updates;
    } catch (error) {
      // Keep all checked-in baseline records readable during a temporary DB outage.
      console.error("Site updates database unavailable; serving GitHub snapshot:", error);
      if (category === "education") return getEducationDirectory();
      if (category === "all") {
        const educationRows = await getEducationDirectory();
        return [...educationRows, ...snapshotRows];
      }
      return snapshotRows;
    }
  },
  ["naukriexpress-public-site-updates-v4"],
  { revalidate: 120, tags: ["site-updates"] }
);

export function getPublicSiteUpdates(category?: SiteUpdateCategory): Promise<SiteUpdateItem[]> {
  if (category === "education") return getEducationDirectory();
  return cachedSiteUpdates(category ?? "all");
}

type EducationSeedExam = {
  id: string;
  name: string;
  short_name: string;
  category_id: string;
  academic_year: string;
  courses: string[];
  exam_level: string;
  exam_type: string;
  conducting_authority: string;
  eligibility_summary: string;
  application: {
    start_date: string | null;
    initial_end_date: string | null;
    final_end_date: string | null;
    display_start: string;
    display_end: string;
  };
  examination: {
    start_date: string | null;
    display_date: string;
  };
  status_as_of_2026_10_30: string;
  notification_pdf_url: string | null;
  apply_url: string | null;
  cap_url: string | null;
  official_website_url: string | null;
  notes?: string;
};
type EducationSeed = { last_verified_date: string; exams: EducationSeedExam[] };
type EducationOverride = {
  id: number;
  source_id: string;
  start_date: string | null;
  last_date: string | null;
  item_url: string | null;
  apply_url: string | null;
  cap_url: string | null;
  official_website_url: string | null;
};

const educationSeed = educationDirectory as EducationSeed;

const cachedEducationOverrides = unstable_cache(
  async (): Promise<EducationOverride[]> => {
    try {
      await ensurePublicContentTables();
      const pool = getPool();
      const result = await pool.query(
        `SELECT id, source_id, start_date, last_date, item_url, apply_url,
                cap_url, official_website_url
         FROM site_updates
         WHERE category = 'education' AND source_id IS NOT NULL
           AND is_deleted IS NOT TRUE
         ORDER BY id ASC`
      );
      return result.rows.map((row) => ({ ...row, id: Number(row.id) })) as EducationOverride[];
    } catch (error) {
      console.error("Education date overrides unavailable; using GitHub dates:", error);
      return [];
    }
  },
  ["naukriexpress-education-editable-overrides-v2"],
  { revalidate: 120, tags: ["education-overrides"] }
);

const cachedDynamicEducationRecords = unstable_cache(
  async (): Promise<SiteUpdateItem[]> => {
    try {
      await ensurePublicContentTables();
      const pool = getPool();
      const result = await pool.query(
        `SELECT id, category, title, organization, description, publish_date,
                amount, eligibility, last_date, item_url, objection_url, apply_url,
                education_category, start_date, exam_date, is_new,
                application_start_display, application_end_display, exam_date_display,
                academic_year, status_as_of, cap_url, official_website_url, source_id,
                created_at
         FROM site_updates
         WHERE category = 'education' AND source_id IS NULL
           AND is_deleted IS NOT TRUE
         ORDER BY created_at DESC, id DESC`
      );
      return result.rows.map((row) => ({ ...row, id: Number(row.id) })) as SiteUpdateItem[];
    } catch (error) {
      console.error("New Education records unavailable:", error);
      return [];
    }
  },
  ["naukriexpress-dynamic-education-records-v1"],
  { revalidate: 120, tags: ["education-dynamic-records"] }
);

/** GitHub owns all fixed exam content; the database stores only admin-editable dates and URLs. */
export async function getEducationDirectory(): Promise<SiteUpdateItem[]> {
  const overrides = await cachedEducationOverrides();
  const bySourceId = new Map(overrides.map((item) => [item.source_id, item]));
  const dynamicRecords = await cachedDynamicEducationRecords();

  const staticRecords = educationSeed.exams.map((exam, index) => {
    const override = bySourceId.get(exam.id);
    const startDate = override ? override.start_date : exam.application.start_date;
    const lastDate = override
      ? override.last_date
      : exam.application.final_end_date || exam.application.initial_end_date;
    const notificationUrl = override ? override.item_url : exam.notification_pdf_url;
    const applyUrl = override ? override.apply_url : exam.apply_url;
    const capUrl = override ? override.cap_url : exam.cap_url;
    const officialWebsiteUrl = override
      ? override.official_website_url
      : exam.official_website_url;
    const description = [
      `Short name: ${exam.short_name}`,
      `Academic year: ${exam.academic_year}`,
      exam.courses?.length ? `Courses: ${exam.courses.join(", ")}` : "",
      `Exam level: ${exam.exam_level}; Type: ${exam.exam_type}`,
      exam.notes || "",
    ].filter(Boolean).join("\n");

    return {
      id: override?.id ?? index + 1,
      category: "education" as const,
      title: exam.name,
      organization: exam.conducting_authority || null,
      description: description || null,
      publish_date: educationSeed.last_verified_date,
      amount: null,
      eligibility: exam.eligibility_summary || null,
      last_date: lastDate,
      item_url: notificationUrl,
      objection_url: null,
      apply_url: applyUrl,
      education_category: exam.category_id,
      start_date: startDate,
      exam_date: exam.examination.start_date,
      is_new: false,
      application_start_display: override
        ? startDate || "See official notice"
        : startDate || exam.application.display_start || null,
      application_end_display: override
        ? lastDate || "See official notice"
        : lastDate || exam.application.display_end || null,
      exam_date_display: exam.examination.display_date || null,
      academic_year: exam.academic_year,
      status_as_of: exam.status_as_of_2026_10_30,
      cap_url: capUrl,
      official_website_url: officialWebsiteUrl,
      source_id: exam.id,
    };
  });

  return [...dynamicRecords, ...staticRecords];
}

type AdmitCardSnapshotItem = AdmitCardLink & { created_at: string };
const admitCardSnapshot = admitCardLinksSnapshot as AdmitCardSnapshotItem[];
const admitCardSnapshotIds = admitCardSnapshot.map((item) => item.id);

/**
 * GitHub stores the current baseline. Supabase hides deleted snapshot links
 * and supplies every post-snapshot link, regardless of the generated ID value.
 */
const cachedAdmitCards = unstable_cache(
  async (): Promise<AdmitCardLink[]> => {
    try {
      await ensurePublicContentTables();
      const pool = getPool();

      const [activeSnapshotResult, newLinksResult] = await Promise.all([
        pool.query(
          `SELECT id FROM admit_card_links WHERE id = ANY($1::bigint[])`,
          [admitCardSnapshotIds]
        ),
        pool.query(
          `SELECT id, title, url
           FROM admit_card_links
           WHERE NOT (id = ANY($1::bigint[]))
           ORDER BY created_at DESC, id DESC`,
          [admitCardSnapshotIds]
        ),
      ]);

      const activeSnapshotIds = new Set(
        activeSnapshotResult.rows.map((row) => Number(row.id))
      );
      const snapshotLinks = admitCardSnapshot
        .filter((item) => activeSnapshotIds.has(item.id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(({ id, title, url }) => ({ id, title, url }));

      const newDatabaseLinks = newLinksResult.rows.map((row) => ({
        id: Number(row.id),
        title: String(row.title),
        url: String(row.url),
      }));

      return [...newDatabaseLinks, ...snapshotLinks];
    } catch (error) {
      console.error("Admit Card database unavailable; serving GitHub snapshot:", error);
      return admitCardSnapshot.map(({ id, title, url }) => ({ id, title, url }));
    }
  },
  ["naukriexpress-admit-card-links-v3"],
  { revalidate: 120, tags: ["admit-cards"] }
);

export function getPublicAdmitCardLinks(): Promise<AdmitCardLink[]> {
  return cachedAdmitCards();
}
