import { NextResponse } from "next/server";
import { getPool } from "@/lib/pgClient";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function getAdmitCardTable() {
  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admit_card_links (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  return pool;
}

// Sabhi visitors live Admit Card links dekh sakte hain
export async function GET() {
  try {
    const pool = await getAdmitCardTable();

    const result = await pool.query(`
      SELECT id, title, url
      FROM admit_card_links
      ORDER BY created_at DESC
    `);

    return NextResponse.json(
      { links: result.rows },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Admit Card GET error:", error);

    return NextResponse.json(
      { error: "Admit Cards load nahi ho sake" },
      { status: 500 }
    );
  }
}

// Sirf logged-in admin link add kar sakta hai
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
    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const url = typeof body.url === "string" ? body.url.trim() : "";

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Valid URL enter karein" },
        { status: 400 }
      );
    }

    if (
      !title ||
      title.length > 300 ||
      !["https:", "http:"].includes(parsedUrl.protocol)
    ) {
      return NextResponse.json(
        { error: "Title aur valid URL zaroori hain" },
        { status: 400 }
      );
    }

    const pool = await getAdmitCardTable();

    const result = await pool.query(
      `INSERT INTO admit_card_links (title, url)
       VALUES ($1, $2)
       RETURNING id, title, url`,
      [title, parsedUrl.toString()]
    );

    return NextResponse.json(
      { link: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admit Card POST error:", error);

    return NextResponse.json(
      { error: "Link save nahi hua" },
      { status: 500 }
    );
  }
}

// Sirf logged-in admin link delete kar sakta hai
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

    const pool = await getAdmitCardTable();

    const result = await pool.query(
      "DELETE FROM admit_card_links WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Link nahi mila" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admit Card DELETE error:", error);

    return NextResponse.json(
      { error: "Link delete nahi hua" },
      { status: 500 }
    );
  }
}
