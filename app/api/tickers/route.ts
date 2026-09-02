import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Never let Vercel/Next cache this route — the running ticker must always
// reflect the latest value saved from the Admin Panel, on every device.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (process.env.DATABASE_URL) {
      const dbPg = await import("@/lib/db.pg");
      if (typeof (dbPg as any).getAllTickers === "function") {
        const data = await (dbPg as any).getAllTickers();
        return NextResponse.json({ data }, { status: 200 });
      }
    }
    return NextResponse.json({ data: [] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tickers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (process.env.DATABASE_URL) {
      const dbPg = await import("@/lib/db.pg");
      if (typeof (dbPg as any).createTicker === "function") {
        const data = await (dbPg as any).createTicker(body);
        return NextResponse.json({ data }, { status: 201 });
      }
    }
    return NextResponse.json({ data: body }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid ticker payload" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const dbPg = await import("@/lib/db.pg");
      if (typeof (dbPg as any).deleteTicker === "function") {
        await (dbPg as any).deleteTicker(id);
        return NextResponse.json({ success: true }, { status: 200 });
      }
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete ticker" }, { status: 500 });
  }
}