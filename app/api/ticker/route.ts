import { NextResponse } from "next/server";
import { getPool } from "@/lib/pgClient";
import { getSession } from "@/lib/auth";
import { isSameOriginMutation } from "@/lib/security";

export const dynamic = "force-dynamic";

const DEFAULT_TEXT =
  "🔥 Welcome to NaukriExpress - Latest Government Job Updates!";
const ITEMS_PREFIX = "ticker-items:v1:";

function decodeTicker(value: string | undefined) {
  if (!value) return [DEFAULT_TEXT];

  if (value.startsWith(ITEMS_PREFIX)) {
    try {
      const parsed: unknown = JSON.parse(value.slice(ITEMS_PREFIX.length));
      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      ) {
        return parsed.map((item) => item.trim()).filter(Boolean);
      }
    } catch {
      // Keep malformed stored values visible as a regular ticker message.
    }
  }

  // Older versions saved a single plain-text ticker string.
  return [value];
}

function tickerText(items: string[]) {
  return items.join(" • ");
}

export async function GET() {
  try {
    const pool = getPool();
    const result = await pool.query(
      "SELECT setting_value FROM site_settings WHERE setting_key = $1",
      ["running_ticker"]
    );
    const items = decodeTicker(result.rows[0]?.setting_value);

    return NextResponse.json(
      { text: tickerText(items), items },
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
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  try {
    const session = await getSession();

    if (session?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const hasItems = Array.isArray(body.items);
    const items: string[] = hasItems
      ? body.items
          .filter((item: unknown): item is string => typeof item === "string")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : [];
    const legacyText = typeof body.text === "string" ? body.text.trim() : "";
    const combinedText = hasItems ? tickerText(items) : legacyText;

    if (
      (hasItems && body.items.some((item: unknown) => typeof item !== "string")) ||
      (!hasItems && !legacyText) ||
      combinedText.length > 2000 ||
      items.some((item) => item.length > 500)
    ) {
      return NextResponse.json(
        {
          error:
            "Ticker updates must be valid text, each up to 500 characters and 2000 characters total",
        },
        { status: 400 }
      );
    }

    const pool = getPool();
    const storedValue = hasItems
      ? `${ITEMS_PREFIX}${JSON.stringify(items)}`
      : legacyText;

    await pool.query(
      `INSERT INTO site_settings
        (setting_key, setting_value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (setting_key)
       DO UPDATE SET
         setting_value = EXCLUDED.setting_value,
         updated_at = NOW()`,
      ["running_ticker", storedValue]
    );

    const savedItems = hasItems ? items : [legacyText];
    return NextResponse.json({
      success: true,
      text: tickerText(savedItems),
      items: savedItems,
    });
  } catch (error) {
    console.error("Ticker POST error:", error);
    return NextResponse.json(
      { error: "Ticker save failed" },
      { status: 500 }
    );
  }
}
