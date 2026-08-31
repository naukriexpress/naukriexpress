import { getPool } from "./pgClient";
import { slugify } from "./db.local";
import type { JobFilters, JobPosting, VacancyRow } from "./types";

// This file mirrors lib/db.local.ts function-for-function, but reads/writes
// PostgreSQL (Supabase) instead of a local JSON file. lib/db.ts picks this
// implementation automatically whenever DATABASE_URL is set.

const RESOLVED_STATUS_SQL = `
  CASE
    WHEN status = 'draft' THEN 'draft'
    WHEN status = 'scheduled' AND publish_at IS NOT NULL AND publish_at > now() THEN 'scheduled'
    WHEN last_date < CURRENT_DATE THEN 'expired'
    ELSE 'published'
  END
`;

function parsePgArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const inner = val.replace(/^\{|\}$/g, "");
    if (!inner) return [];
    return inner.split(",").map((s) => s.trim());
  }
  return [];
}

function mapJobRow(row: any, vacancyRows: VacancyRow[]): JobPosting {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    organization: row.organization,
    department: row.department || undefined,
    advertisementNumber: row.advertisement_number || "",
    logoUrl: row.logo_url || undefined,
    totalVacancies: row.total_vacancies,
    vacancyBreakdown: vacancyRows,
    location: {
      state: row.state,
      district: row.district || undefined,
      allIndia: row.all_india,
    },
    eligibility: {
      genders: parsePgArray(row.genders) as JobPosting["eligibility"]["genders"],
      categories: parsePgArray(row.categories) as JobPosting["eligibility"]["categories"],
      qualifications: parsePgArray(row.qualifications) as JobPosting["eligibility"]["qualifications"],
      minAge: row.min_age ?? undefined,
      maxAge: row.max_age ?? undefined,
      ageRelaxation: row.age_relaxation || undefined,
    },
    jobType: row.job_type,
    salary: row.salary || undefined,
    applicationFee: row.application_fee || undefined,
    dates: {
      startDate: row.start_date ? toIsoDate(row.start_date) : undefined,
      lastDate: toIsoDate(row.last_date),
      examDate: row.exam_date ? toIsoDate(row.exam_date) : undefined,
    },
    links: {
      applyOnline: row.apply_online_url || undefined,
      officialNotification: row.official_notification_url || undefined,
      officialWebsite: row.official_website_url || undefined,
    },
    content: {
      eligibility: row.content_eligibility || undefined,
      vacancyDetails: row.content_vacancy_details || undefined,
      selectionProcess: row.content_selection_process || undefined,
      howToApply: row.content_how_to_apply || undefined,
      importantInstructions: row.content_important_instructions || undefined,
    },
    seo: {
      title: row.seo_title || undefined,
      metaDescription: row.seo_meta_description || undefined,
    },
    featured: row.featured,
    status: row.effective_status || row.status,
    publishAt: row.publish_at ? new Date(row.publish_at).toISOString() : undefined,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    views: row.views,
  };
}

function toIsoDate(d: any): string {
  if (typeof d === "string") return d.slice(0, 10);
  return new Date(d).toISOString().slice(0, 10);
}

async function fetchVacancyRowsForJobs(jobIds: string[]): Promise<Map<string, VacancyRow[]>> {
  const map = new Map<string, VacancyRow[]>();
  if (jobIds.length === 0) return map;
  const pool = getPool();
  const { rows } = await pool.query(
    `select job_id, post, category, count from job_vacancy_rows where job_id = any($1::uuid[]) order by sort_order asc, post asc`,
    [jobIds]
  );
  for (const r of rows) {
    const list = map.get(r.job_id) || [];
    list.push({ post: r.post, category: r.category || "", count: r.count });
    map.set(r.job_id, list);
  }
  return map;
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const pool = getPool();
  let slug = base;
  let i = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { rows } = await pool.query(
      excludeId
        ? `select 1 from jobs where slug = $1 and id != $2`
        : `select 1 from jobs where slug = $1`,
      excludeId ? [slug, excludeId] : [slug]
    );
    if (rows.length === 0) return slug;
    slug = `${base}-${i}`;
    i++;
  }
}

export async function getAllJobsRaw(): Promise<JobPosting[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `select *, ${RESOLVED_STATUS_SQL} as effective_status from jobs order by created_at desc`
  );
  const vacancyMap = await fetchVacancyRowsForJobs(rows.map((r) => r.id));
  return rows.map((r) => mapJobRow(r, vacancyMap.get(r.id) || []));
}

export async function getJobById(id: string): Promise<JobPosting | undefined> {
  const pool = getPool();
  const { rows } = await pool.query(
    `select *, ${RESOLVED_STATUS_SQL} as effective_status from jobs where id = $1`,
    [id]
  );
  if (rows.length === 0) return undefined;
  const vacancyMap = await fetchVacancyRowsForJobs([id]);
  return mapJobRow(rows[0], vacancyMap.get(id) || []);
}

export async function getJobBySlug(slug: string): Promise<JobPosting | undefined> {
  const pool = getPool();
  const { rows } = await pool.query(
    `select *, ${RESOLVED_STATUS_SQL} as effective_status from jobs where slug = $1`,
    [slug]
  );
  if (rows.length === 0) return undefined;
  const vacancyMap = await fetchVacancyRowsForJobs([rows[0].id]);
  return mapJobRow(rows[0], vacancyMap.get(rows[0].id) || []);
}

export async function incrementViews(id: string): Promise<void> {
  const pool = getPool();
  await pool.query(`update jobs set views = views + 1 where id = $1`, [id]);
}

export async function queryJobs(
  filters: JobFilters
): Promise<{ results: JobPosting[]; total: number }> {
  const pool = getPool();
  const conditions: string[] = [];
  const values: any[] = [];

  function addCondition(sql: string, ...vals: any[]) {
    // Replace positional markers (?) with actual $n indices as we push values.
    let s = sql;
    for (const v of vals) {
      values.push(v);
      s = s.replace("?", `$${values.length}`);
    }
    conditions.push(s);
  }

  const wantedStatus = filters.status ?? "published";
  if (wantedStatus !== "all") {
    addCondition(`${RESOLVED_STATUS_SQL} = ?`, wantedStatus);
  }

  if (filters.featuredOnly) {
    conditions.push(`featured = true`);
  }

  if (filters.q && filters.q.trim()) {
    addCondition(
      `(title || ' ' || organization || ' ' || coalesce(department,'') || ' ' || coalesce(advertisement_number,'')) ILIKE ?`,
      `%${filters.q.trim()}%`
    );
  }

  if (filters.gender && filters.gender !== "all") {
    if (filters.gender === "male") addCondition(`'male' = ANY(genders)`);
    else if (filters.gender === "female") addCondition(`'female' = ANY(genders)`);
    else if (filters.gender === "both")
      addCondition(`genders @> ARRAY['male','female']::gender_t[]`);
  }

  if (filters.categories && filters.categories.length > 0) {
    addCondition(`categories @> ?::category_t[]`, filters.categories);
  }

  if (filters.qualifications && filters.qualifications.length > 0) {
    addCondition(`qualifications && ?::qualification_t[]`, filters.qualifications);
  }

  if (filters.jobType && filters.jobType.length > 0) {
    addCondition(`job_type = ANY(?::job_type_t[])`, filters.jobType);
  }

  if (filters.state && filters.state !== "all") {
    addCondition(`(all_india = true OR state = ?)`, filters.state);
  }

  if (filters.district) {
    addCondition(`district = ?`, filters.district);
  }

  if (filters.minAge !== undefined) {
    addCondition(`(max_age IS NULL OR max_age >= ?)`, filters.minAge);
  }
  if (filters.maxAge !== undefined) {
    addCondition(`(min_age IS NULL OR min_age <= ?)`, filters.maxAge);
  }

  if (filters.lastDate === "today") {
    conditions.push(`last_date = CURRENT_DATE`);
  } else if (filters.lastDate === "week") {
    conditions.push(`last_date >= CURRENT_DATE AND last_date <= CURRENT_DATE + interval '7 days'`);
  } else if (filters.lastDate === "month") {
    conditions.push(`last_date >= CURRENT_DATE AND last_date <= CURRENT_DATE + interval '1 month'`);
  } else if (filters.lastDate === "upcoming") {
    conditions.push(`last_date > CURRENT_DATE + interval '1 month'`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const sort = filters.sort ?? "latest";
  const orderBy =
    sort === "closing_soon"
      ? "last_date ASC"
      : sort === "most_viewed"
      ? "views DESC"
      : "created_at DESC";

  const countResult = await pool.query(
    `select count(*)::int as total from jobs ${whereClause}`,
    values
  );
  const total = countResult.rows[0]?.total ?? 0;

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const offset = (page - 1) * pageSize;

  const dataValues = [...values, pageSize, offset];
  const { rows } = await pool.query(
    `select *, ${RESOLVED_STATUS_SQL} as effective_status from jobs ${whereClause}
     order by ${orderBy} limit $${dataValues.length - 1} offset $${dataValues.length}`,
    dataValues
  );

  const vacancyMap = await fetchVacancyRowsForJobs(rows.map((r) => r.id));
  const results = rows.map((r) => mapJobRow(r, vacancyMap.get(r.id) || []));

  return { results, total };
}

export async function getStats() {
  const pool = getPool();

  const { rows: statusCounts } = await pool.query(
    `select ${RESOLVED_STATUS_SQL} as effective_status, count(*)::int as c from jobs group by 1`
  );
  const byStatus: Record<string, number> = {};
  for (const r of statusCounts) byStatus[r.effective_status] = r.c;

  const totalPublished = byStatus["published"] || 0;
  const active = totalPublished;
  const expired = byStatus["expired"] || 0;
  const draft = (byStatus["draft"] || 0) + (byStatus["scheduled"] || 0);

  const { rows: mostViewedRows } = await pool.query(
    `select *, ${RESOLVED_STATUS_SQL} as effective_status from jobs order by views desc limit 5`
  );
  const mostViewedMap = await fetchVacancyRowsForJobs(mostViewedRows.map((r) => r.id));
  const mostViewed = mostViewedRows.map((r) => mapJobRow(r, mostViewedMap.get(r.id) || []));

  const { rows: endingSoonRows } = await pool.query(
    `select *, ${RESOLVED_STATUS_SQL} as effective_status from jobs
     where ${RESOLVED_STATUS_SQL} = 'published'
     order by last_date asc limit 5`
  );
  const endingSoonMap = await fetchVacancyRowsForJobs(endingSoonRows.map((r) => r.id));
  const endingSoon = endingSoonRows.map((r) => mapJobRow(r, endingSoonMap.get(r.id) || []));

  const { rows: totals } = await pool.query(
    `select coalesce(sum(views),0)::int as total_views, count(*)::int as total_jobs from jobs`
  );
  const totalVisitors = (totals[0]?.total_views || 0) + 18342;
  const totalJobs = totals[0]?.total_jobs || 0;

  return { totalPublished, active, expired, draft, mostViewed, endingSoon, totalVisitors, totalJobs };
}

export async function createJob(
  input: Omit<JobPosting, "id" | "slug" | "createdAt" | "updatedAt" | "views">
): Promise<JobPosting> {
  const pool = getPool();
  const baseSlug = slugify(`${input.title}-${input.organization}`);
  const slug = await ensureUniqueSlug(baseSlug);

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
      featured, status, publish_at
    ) values (
      $1,$2,$3,$4,$5,$6,
      $7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,
      $17,$18,$19,
      $20,$21,$22,
      $23,$24,$25,
      $26,$27,$28,
      $29,$30,
      $31,$32,
      $33,$34,$35
    ) returning *, ${RESOLVED_STATUS_SQL} as effective_status`,
    [
      slug, input.title, input.organization, input.department || null, input.advertisementNumber || null, input.logoUrl || null,
      input.totalVacancies, input.location.state, input.location.district || null, input.location.allIndia,
      input.eligibility.genders, input.eligibility.categories, input.eligibility.qualifications,
      input.eligibility.minAge ?? null, input.eligibility.maxAge ?? null, input.eligibility.ageRelaxation || null,
      input.jobType, input.salary || null, input.applicationFee || null,
      input.dates.startDate || null, input.dates.lastDate, input.dates.examDate || null,
      input.links.applyOnline || null, input.links.officialNotification || null, input.links.officialWebsite || null,
      input.content.eligibility || null, input.content.vacancyDetails || null, input.content.selectionProcess || null,
      input.content.howToApply || null, input.content.importantInstructions || null,
      input.seo.title || null, input.seo.metaDescription || null,
      input.featured, input.status, input.publishAt || null,
    ]
  );

  const job = rows[0];
  await insertVacancyRows(job.id, input.vacancyBreakdown);
  const vacancyMap = await fetchVacancyRowsForJobs([job.id]);
  return mapJobRow(job, vacancyMap.get(job.id) || []);
}

async function insertVacancyRows(jobId: string, rows: VacancyRow[]) {
  const pool = getPool();
  await pool.query(`delete from job_vacancy_rows where job_id = $1`, [jobId]);
  let i = 0;
  for (const row of rows) {
    if (!row.post?.trim()) continue;
    await pool.query(
      `insert into job_vacancy_rows (job_id, post, category, count, sort_order) values ($1,$2,$3,$4,$5)`,
      [jobId, row.post, row.category || "", row.count || 0, i]
    );
    i++;
  }
}

export async function updateJob(
  id: string,
  input: Partial<JobPosting>
): Promise<JobPosting | undefined> {
  const pool = getPool();
  const existing = await getJobById(id);
  if (!existing) return undefined;

  const merged: JobPosting = {
    ...existing,
    ...input,
    location: { ...existing.location, ...input.location },
    eligibility: { ...existing.eligibility, ...input.eligibility },
    dates: { ...existing.dates, ...input.dates },
    links: { ...existing.links, ...input.links },
    content: { ...existing.content, ...input.content },
    seo: { ...existing.seo, ...input.seo },
  };

  let slug = existing.slug;
  if (input.title && input.title !== existing.title) {
    const base = slugify(`${input.title}-${merged.organization}`);
    slug = await ensureUniqueSlug(base, id);
  }

  const { rows } = await pool.query(
    `update jobs set
      slug=$1, title=$2, organization=$3, department=$4, advertisement_number=$5, logo_url=$6,
      total_vacancies=$7, state=$8, district=$9, all_india=$10,
      genders=$11, categories=$12, qualifications=$13, min_age=$14, max_age=$15, age_relaxation=$16,
      job_type=$17, salary=$18, application_fee=$19,
      start_date=$20, last_date=$21, exam_date=$22,
      apply_online_url=$23, official_notification_url=$24, official_website_url=$25,
      content_eligibility=$26, content_vacancy_details=$27, content_selection_process=$28,
      content_how_to_apply=$29, content_important_instructions=$30,
      seo_title=$31, seo_meta_description=$32,
      featured=$33, status=$34, publish_at=$35
    where id = $36
    returning *, ${RESOLVED_STATUS_SQL} as effective_status`,
    [
      slug, merged.title, merged.organization, merged.department || null, merged.advertisementNumber || null, merged.logoUrl || null,
      merged.totalVacancies, merged.location.state, merged.location.district || null, merged.location.allIndia,
      merged.eligibility.genders, merged.eligibility.categories, merged.eligibility.qualifications,
      merged.eligibility.minAge ?? null, merged.eligibility.maxAge ?? null, merged.eligibility.ageRelaxation || null,
      merged.jobType, merged.salary || null, merged.applicationFee || null,
      merged.dates.startDate || null, merged.dates.lastDate, merged.dates.examDate || null,
      merged.links.applyOnline || null, merged.links.officialNotification || null, merged.links.officialWebsite || null,
      merged.content.eligibility || null, merged.content.vacancyDetails || null, merged.content.selectionProcess || null,
      merged.content.howToApply || null, merged.content.importantInstructions || null,
      merged.seo.title || null, merged.seo.metaDescription || null,
      merged.featured, merged.status, merged.publishAt || null,
      id,
    ]
  );

  if (rows.length === 0) return undefined;

  if (input.vacancyBreakdown) {
    await insertVacancyRows(id, input.vacancyBreakdown);
  }

  const vacancyMap = await fetchVacancyRowsForJobs([id]);
  return mapJobRow(rows[0], vacancyMap.get(id) || merged.vacancyBreakdown);
}

export async function deleteJob(id: string): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query(`delete from jobs where id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getDistinctStates(): Promise<string[]> {
  const pool = getPool();
  const { rows } = await pool.query(
    `select distinct state from jobs where all_india = false order by state asc`
  );
  return rows.map((r) => r.state);
}
