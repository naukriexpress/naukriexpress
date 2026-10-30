import { NextResponse } from "next/server";
import { getPool } from "@/lib/pgClient";
import { getSession } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  ensurePublicContentTables,
  getPublicSiteUpdates,
  SITE_UPDATE_CATEGORIES,
  type SiteUpdateCategory,
} from "@/lib/public-content-cache";

export const dynamic = "force-dynamic";

const EDUCATION_CATEGORIES = [
  "ug",
  "pg",
  "mba-management",
  "phd-research",
  "medical-health",
  "engineering-architecture",
  "law",
  "teaching",
  "design-arts",
  "agriculture",
] as const;

function validOptionalUrl(value: unknown) {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function textField(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function dateField(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : undefined;
}

type EducationPayload = {
  title: string;
  educationCategory: string;
  organization: string | null;
  description: string | null;
  eligibility: string | null;
  startDate: string | null;
  lastDate: string | null;
  examDate: string | null;
  itemUrl: string | null;
  applyUrl: string | null;
  capUrl: string | null;
  officialWebsiteUrl: string | null;
  applicationStartDisplay: string | null;
  applicationEndDisplay: string | null;
  examDateDisplay: string | null;
  academicYear: string | null;
  statusAsOf: string | null;
  isNew: boolean;
};

function validEducationPayload(
  body: Record<string, unknown>
): { error: string; value?: never } | { error?: never; value: EducationPayload } {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const educationCategory = textField(body.education_category);
  const startDate = dateField(body.start_date);
  const lastDate = dateField(body.last_date);
  const examDate = dateField(body.exam_date);

  if (!title || title.length > 300) return { error: "Exam ka valid naam zaroori hai" };
  if (!educationCategory || !EDUCATION_CATEGORIES.includes(educationCategory as (typeof EDUCATION_CATEGORIES)[number])) {
    return { error: "Valid education category select karein" };
  }
  if (startDate === undefined || lastDate === undefined || examDate === undefined) {
    return { error: "Dates valid YYYY-MM-DD format mein honi chahiye" };
  }
  if (startDate && lastDate && startDate > lastDate) {
    return { error: "Application end date, start date ke baad honi chahiye" };
  }
  for (const field of ["item_url", "apply_url", "cap_url", "official_website_url"] as const) {
    if (!validOptionalUrl(body[field])) {
      return { error: `${field} mein valid HTTP/HTTPS link daalein` };
    }
  }
  return {
    value: {
      title,
      educationCategory,
      organization: textField(body.organization),
      description: textField(body.description),
      eligibility: textField(body.eligibility),
      startDate,
      lastDate,
      examDate,
      itemUrl: textField(body.item_url),
      applyUrl: textField(body.apply_url),
      capUrl: textField(body.cap_url),
      officialWebsiteUrl: textField(body.official_website_url),
      applicationStartDisplay: textField(body.application_start_display),
      applicationEndDisplay: textField(body.application_end_display),
      examDateDisplay: textField(body.exam_date_display),
      academicYear: textField(body.academic_year),
      statusAsOf: textField(body.status_as_of),
      isNew: body.is_new === true,
    },
  };
}

// Public website par updates dikhane ke liye
export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category");
    if (category && !SITE_UPDATE_CATEGORIES.includes(category as SiteUpdateCategory)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    const updates = await getPublicSiteUpdates(category ? category as SiteUpdateCategory : undefined);
    return NextResponse.json(
      { updates },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (error) {
    console.error("Site updates GET error:", error);
    return NextResponse.json({ error: "Updates load nahi ho sake" }, { status: 500 });
  }
}

// Logged-in admin content add kar sakta hai.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as Record<string, unknown>;
    const category = typeof body.category === "string" ? body.category : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (category === "education") {
      return NextResponse.json(
        { error: "Education exam details GitHub dataset mein fixed hain. Admin se sirf dates aur links edit karein." },
        { status: 403 }
      );
    }

    if (!SITE_UPDATE_CATEGORIES.includes(category as SiteUpdateCategory) || !title || title.length > 300) {
      return NextResponse.json({ error: "Valid category aur title zaroori hain" }, { status: 400 });
    }

    const urlFields = ["item_url", "objection_url", "apply_url", "cap_url", "official_website_url"] as const;
    for (const field of urlFields) {
      if (!validOptionalUrl(body[field])) {
        return NextResponse.json({ error: `${field} mein valid HTTP/HTTPS link daalein` }, { status: 400 });
      }
    }

    const publishDate = dateField(body.publish_date);
    const lastDate = dateField(body.last_date);
    if (publishDate === undefined || lastDate === undefined) {
      return NextResponse.json({ error: "Dates valid YYYY-MM-DD format mein honi chahiye" }, { status: 400 });
    }

    let education = {
      educationCategory: null as string | null,
      startDate: null as string | null,
      examDate: null as string | null,
      isNew: false,
      capUrl: null as string | null,
      officialWebsiteUrl: null as string | null,
      applicationStartDisplay: null as string | null,
      applicationEndDisplay: null as string | null,
      examDateDisplay: null as string | null,
      academicYear: null as string | null,
      statusAsOf: null as string | null,
    };
    if (category === "education") {
      const validation = validEducationPayload(body);
      if (validation.error || !validation.value) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      education = {
        educationCategory: validation.value.educationCategory,
        startDate: validation.value.startDate,
        examDate: validation.value.examDate,
        isNew: validation.value.isNew,
        capUrl: validation.value.capUrl,
        officialWebsiteUrl: validation.value.officialWebsiteUrl,
        applicationStartDisplay: validation.value.applicationStartDisplay,
        applicationEndDisplay: validation.value.applicationEndDisplay,
        examDateDisplay: validation.value.examDateDisplay,
        academicYear: validation.value.academicYear,
        statusAsOf: validation.value.statusAsOf,
      };
    }

    await ensurePublicContentTables();
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO site_updates (
        category, title, organization, description,
        publish_date, amount, eligibility, last_date,
        item_url, objection_url, apply_url,
        education_category, start_date, exam_date, is_new,
        cap_url, official_website_url, application_start_display,
        application_end_display, exam_date_display, academic_year, status_as_of
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22
      ) RETURNING *`,
      [
        category,
        title,
        textField(body.organization),
        textField(body.description),
        publishDate,
        textField(body.amount),
        textField(body.eligibility),
        lastDate,
        textField(body.item_url),
        textField(body.objection_url),
        textField(body.apply_url),
        education.educationCategory,
        category === "education" ? education.startDate : null,
        education.examDate,
        education.isNew,
        education.capUrl,
        education.officialWebsiteUrl,
        education.applicationStartDisplay,
        education.applicationEndDisplay,
        education.examDateDisplay,
        education.academicYear,
        education.statusAsOf,
      ]
    );

    revalidateTag("site-updates");
    for (const revalidate of ["/api/site-updates", "/education", "/scholarship", "/syllabus", "/answer-key", "/results"]) {
      revalidatePath(revalidate);
    }
    return NextResponse.json({ update: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Site updates POST error:", error);
    return NextResponse.json({ error: "Update save nahi hua" }, { status: 500 });
  }
}

// Education record ko sirf logged-in admin edit kar sakta hai.
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !/^\\d+$/.test(id)) {
      return NextResponse.json({ error: "Valid ID zaroori hai" }, { status: 400 });
    }

    const body = await request.json() as Record<string, unknown>;
    const startDate = dateField(body.start_date);
    const lastDate = dateField(body.last_date);
    if (startDate === undefined || lastDate === undefined) {
      return NextResponse.json({ error: "Dates valid YYYY-MM-DD format mein honi chahiye" }, { status: 400 });
    }
    if (startDate && lastDate && startDate > lastDate) {
      return NextResponse.json({ error: "Last date, start date ke baad honi chahiye" }, { status: 400 });
    }

    const urlFields = ["item_url", "apply_url", "cap_url", "official_website_url"] as const;
    for (const field of urlFields) {
      if (!validOptionalUrl(body[field])) {
        return NextResponse.json({ error: `${field} mein valid HTTP/HTTPS link daalein` }, { status: 400 });
      }
    }

    await ensurePublicContentTables();
    const pool = getPool();
    const result = await pool.query(
      `UPDATE site_updates SET
        start_date = $1,
        last_date = $2,
        item_url = $3,
        apply_url = $4,
        cap_url = $5,
        official_website_url = $6
       WHERE id = $7 AND category = 'education'
       RETURNING *`,
      [
        startDate,
        lastDate,
        textField(body.item_url),
        textField(body.apply_url),
        textField(body.cap_url),
        textField(body.official_website_url),
        id,
      ]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Education exam nahi mila" }, { status: 404 });
    }

    revalidateTag("site-updates");
    revalidateTag("education-overrides");
    revalidatePath("/education");
    revalidatePath("/api/site-updates");
    return NextResponse.json({ update: result.rows[0] });
  } catch (error) {
    console.error("Site updates PUT error:", error);
    return NextResponse.json({ error: "Education dates / links update nahi hue" }, { status: 500 });
  }
}

// Sirf logged-in admin update delete kar sakta hai.
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Valid ID zaroori hai" }, { status: 400 });
    }

    await ensurePublicContentTables();
    const pool = getPool();
    const existing = await pool.query("SELECT category FROM site_updates WHERE id = $1", [id]);
    if (existing.rowCount === 0) {
      return NextResponse.json({ error: "Update nahi mila" }, { status: 404 });
    }
    const category = existing.rows[0].category as SiteUpdateCategory;
    if (category === "education") {
      return NextResponse.json(
        { error: "Education exam records GitHub dataset mein fixed hain; admin se delete nahi kiye ja sakte." },
        { status: 403 }
      );
    }
    const result = await pool.query(
      "DELETE FROM site_updates WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Update nahi mila" }, { status: 404 });
    }

    revalidateTag("site-updates");
    revalidatePath(`/${category}`);
    revalidatePath("/api/site-updates");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Site updates DELETE error:", error);
    return NextResponse.json({ error: "Update delete nahi hua" }, { status: 500 });
  }
}
