import { NextResponse } from "next/server";
import { recordSiteVisit } from "@/lib/db";

export const runtime = "nodejs";

export async function POST() {
  try {
    await recordSiteVisit();
    return NextResponse.json(
      { recorded: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Visitor count is not available yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
