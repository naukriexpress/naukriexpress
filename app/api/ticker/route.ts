
import { NextResponse } from "next/server";
import { getPool } from "@/lib/pgClient";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEFAULT_TEXT =
  "🔥 Welcome to NaukriExpress - Latest Government Job Updates!";

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = $1",
      ["running_ticker"]
    );

    return NextResponse.json(
      { text: result.rows[0]?.setting_value ?? DEFAULT_TEXT },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Ticker GET error:", error);
    return NextResponse.json(
      { error: "Ticker load failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text || text.length > 2000) {
      return NextResponse.json(
        { error: "Text must contain 1–2000 characters" },
        { status: 400 }
      );
    }

    const pool = getPool();

    await pool.query(
      `INSERT INTO site_settings
        (setting_key, setting_value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (setting_key)
       DO UPDATE SET
         setting_value = EXCLUDED.setting_value,
         updated_at = NOW()`,
      ["running_ticker", text]
    );

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("Ticker POST error:", error);
    return NextResponse.json(
      { error: "Ticker save failed" },
      { status: 500 }
    );
  }
}
