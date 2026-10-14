import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  isAdminAuthConfigured,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(contentLength) && contentLength > 8192) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  // Block cross-origin login attempts when a browser supplies the Origin header.
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin login is not configured. Contact the site administrator." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid login request" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  if (
    typeof data.username !== "string" ||
    typeof data.password !== "string" ||
    data.username.length > 100 ||
    data.password.length > 1024
  ) {
    return NextResponse.json({ error: "Invalid login request" }, { status: 400 });
  }

  const ok = await verifyCredentials(data.username, data.password);
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  try {
    await createSession(data.username);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin session creation failed:", error);
    return NextResponse.json(
      { error: "Admin login is temporarily unavailable." },
      { status: 503 }
    );
  }
}
