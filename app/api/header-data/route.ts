import { NextResponse } from "next/server";
import { getHeaderData } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getHeaderData();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "private, max-age=30, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Header data GET error:", error);
    return NextResponse.json(
      { closingToday: 0, liveJobs: 0, states: [] },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
