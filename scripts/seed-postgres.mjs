// Pushes the sample jobs from data/jobs.json into Postgres/Supabase.
// Run this AFTER you've run schema.sql on your database and set
// DATABASE_URL in your environment (e.g. `DATABASE_URL=... npm run seed:pg`).
// This step is optional - real jobs added via /admin/jobs/new work
// immediately once DATABASE_URL is set, with or without this sample data.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Example usage:");
  console.error("  DATABASE_URL=postgresql://... npm run seed:pg");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  const jobs = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "data", "jobs.json"), "utf-8")
  );

  for (const j of jobs) {
    const baseSlug = j.slug || slugify(`${j.title}-${j.organization}`);

    const { rows } = await pool.query(
      `insert into jobs (
        slug, title, organization, department, advertisement_number, logo_url,
        total_vacancies, state, district, all_india,
        genders, categories, qualifications, min_age, max_age, age_relaxation,
        job_type, salary, application_fee,
        start_date, last_date, exam_date,
        apply_online_url, official_notification_url, official_website_url,
        content_eligibility, content_vacancy_details, content_selection_process,
        content_how_to_apply, content_important_instructions,
        seo_title, seo_meta_description,
        featured, status, views
      ) values (
        $1,$2,$3,$4,$5,$6, $7,$8,$9,$10, $11,$12,$13,$14,$15,$16,
        $17,$18,$19, $20,$21,$22, $23,$24,$25, $26,$27,$28,$29,$30,
        $31,$32, $33,$34,$35
      )
      on conflict (slug) do nothing
      returning id`,
      [
        baseSlug, j.title, j.organization, j.department || null, j.advertisementNumber || null, j.logoUrl || null,
        j.totalVacancies, j.location.state, j.location.district || null, j.location.allIndia,
        j.eligibility.genders, j.eligibility.categories, j.eligibility.qualifications,
        j.eligibility.minAge ?? null, j.eligibility.maxAge ?? null, j.eligibility.ageRelaxation || null,
        j.jobType, j.salary || null, j.applicationFee || null,
        j.dates.startDate || null, j.dates.lastDate, j.dates.examDate || null,
        j.links.applyOnline || null, j.links.officialNotification || null, j.links.officialWebsite || null,
        j.content.eligibility || null, j.content.vacancyDetails || null, j.content.selectionProcess || null,
        j.content.howToApply || null, j.content.importantInstructions || null,
        j.seo.title || null, j.seo.metaDescription || null,
        j.featured, j.status, j.views || 0,
      ]
    );

    if (rows.length === 0) {
      console.log(`Skipped (already exists): ${j.title}`);
      continue;
    }

    const jobId = rows[0].id;
    let i = 0;
    for (const row of j.vacancyBreakdown || []) {
      await pool.query(
        `insert into job_vacancy_rows (job_id, post, category, count, sort_order) values ($1,$2,$3,$4,$5)`,
        [jobId, row.post, row.category || "", row.count || 0, i]
      );
      i++;
    }
    console.log(`Inserted: ${j.title}`);
  }

  await pool.end();
  console.log("Done seeding Postgres.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
