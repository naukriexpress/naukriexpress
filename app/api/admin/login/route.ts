import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyCredentials } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const ok = await verifyCredentials(String(username || ""), String(password || ""));
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  await createSession(String(username));
  return NextResponse.json({ success: true });
}
