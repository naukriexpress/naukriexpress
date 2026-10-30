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
  "ug-entrance-exams",
  "pg-entrance-exams",
  "mba-management",
  "phd-research",
  "medical-health",
  "engineering-architecture",
  "law-entrance-exams",
  "teaching-education",
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

function validEducationPayload(body: Record<string, unknown>) {
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
  for (const field of ["item_url", "apply_url"] as const) {
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

    if (!SITE_UPDATE_CATEGORIES.includes(category as SiteUpdateCategory) || !title || title.length > 300) {
      return NextResponse.json({ error: "Valid category aur title zaroori hain" }, { status: 400 });
    }

    const urlFields = ["item_url", "objection_url", "apply_url"] as const;
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
      };
    }

    await ensurePublicContentTables();
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO site_updates (
        category, title, organization, description,
        publish_date, amount, eligibility, last_date,
        item_url, objection_url, apply_url,
        education_category, start_date, exam_date, is_new
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *`,
      [
        category,
        title,
        textField(body.organization),
        textField(body.description),
        publishDate,
        textField(body.amount),
        textField(body.eligibility),
        category === "education" ? education.startDate && lastDate ? lastDate : education.startDate ? lastDate : lastDate : lastDate,
        textField(body.item_url),
        textField(body.objection_url),
        textField(body.apply_url),
        education.educationCategory,
        category === "education" ? education.startDate : null,
        education.examDate,
        education.isNew,
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
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ error: "Valid ID zaroori hai" }, { status: 400 });
    }

    const body = await request.json() as Record<string, unknown>;
    const validation = validEducationPayload(body);
    if (validation.error || !validation.value) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await ensurePublicContentTables();
    const pool = getPool();
    const existing = await pool.query(
      "SELECT id FROM site_updates WHERE id = $1 AND category = 'education'",
      [id]
    );
    if (existing.rowCount === 0) {
      return NextResponse.json({ error: "Education exam nahi mila" }, { status: 404 });
    }

    const item = validation.value;
    const result = await pool.query(
      `UPDATE site_updates SET
        title = $1, education_category = $2, organization = $3,
        description = $4, eligibility = $5, start_date = $6,
        last_date = $7, exam_date = $8, item_url = $9,
        apply_url = $10, is_new = $11
       WHERE id = $12 AND category = 'education'
       RETURNING *`,
      [
        item.title, item.educationCategory, item.organization, item.description,
        item.eligibility, item.startDate, item.lastDate, item.examDate,
        item.itemUrl, item.applyUrl, item.isNew, id,
      ]
    );

    revalidateTag("site-updates");
    revalidatePath("/education");
    revalidatePath("/api/site-updates");
    return NextResponse.json({ update: result.rows[0] });
  } catch (error) {
    console.error("Site updates PUT error:", error);
    return NextResponse.json({ error: "Education exam update nahi hua" }, { status: 500 });
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
