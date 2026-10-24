import { NextResponse } from "next/server";
import { getPool } from "@/lib/pgClient";
import { getSession } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { ensurePublicContentTables, getPublicSiteUpdates, SITE_UPDATE_CATEGORIES, type SiteUpdateCategory } from "@/lib/public-content-cache";

export const dynamic = "force-dynamic";

function validOptionalUrl(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

// Public website par updates dikhane ke liye
export async function GET(request: Request) {
  try {
    const category = new URL(request.url).searchParams.get("category");
    if (category && !SITE_UPDATE_CATEGORIES.includes(category as SiteUpdateCategory)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    const updates = await getPublicSiteUpdates(category ? category as SiteUpdateCategory : undefined);
    return NextResponse.json({ updates }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Site updates GET error:", error);
    return NextResponse.json({ error: "Updates load nahi ho sake" }, { status: 500 });
  }
}

// Sirf logged-in admin update add kar sakta hai
export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const category =
      typeof body.category === "string" ? body.category : "";
    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    if (
      !SITE_UPDATE_CATEGORIES.includes(category as SiteUpdateCategory) ||
      !title ||
      title.length > 300
    ) {
      return NextResponse.json(
        { error: "Valid category aur title zaroori hain" },
        { status: 400 }
      );
    }

    const urlFields = [
      "item_url",
      "objection_url",
      "apply_url",
    ] as const;

    for (const field of urlFields) {
      if (!validOptionalUrl(body[field])) {
        return NextResponse.json(
          { error: `${field} mein valid HTTP/HTTPS link daalein` },
          { status: 400 }
        );
      }
    }

    const textField = (value: unknown) =>
      typeof value === "string" && value.trim()
        ? value.trim()
        : null;

    await ensurePublicContentTables();
    const pool = getPool();

    const result = await pool.query(
      `INSERT INTO site_updates (
        category, title, organization, description,
        publish_date, amount, eligibility, last_date,
        item_url, objection_url, apply_url
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING *`,
      [
        category,
        title,
        textField(body.organization),
        textField(body.description),
        textField(body.publish_date),
        textField(body.amount),
        textField(body.eligibility),
        textField(body.last_date),
        textField(body.item_url),
        textField(body.objection_url),
        textField(body.apply_url),
      ]
    );

    revalidateTag("site-updates");
    for (const path of ["/api/site-updates", "/scholarship", "/syllabus", "/answer-key", "/results"]) {
      revalidatePath(path);
    }

    return NextResponse.json(
      { update: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Site updates POST error:", error);
    return NextResponse.json(
      { error: "Update save nahi hua" },
      { status: 500 }
    );
  }
}

// Sirf logged-in admin update delete kar sakta hai
export async function DELETE(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const id = new URL(request.url).searchParams.get("id");

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        { error: "Valid ID zaroori hai" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Update nahi mila" },
        { status: 404 }
      );
    }

    revalidateTag("site-updates");
    revalidatePath(`/${category}`);
    revalidatePath("/api/site-updates");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Site updates DELETE error:", error);
    return NextResponse.json(
      { error: "Update delete nahi hua" },
      { status: 500 }
    );
  }
}
