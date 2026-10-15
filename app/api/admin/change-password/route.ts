import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  destroySession,
  getSession,
  updateAdminPasswordHash,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin || origin !== req.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const session = await getSession();
  const configuredUsername = process.env.ADMIN_USERNAME;
  if (
    !session ||
    session.role !== "admin" ||
    !configuredUsername ||
    session.username !== configuredUsername
  ) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "Please fill in all password fields." }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "New password and confirmation do not match." }, { status: 400 });
  }
  if (newPassword.length < 12) {
    return NextResponse.json({ error: "Use a password with at least 12 characters." }, { status: 400 });
  }
  if (new TextEncoder().encode(newPassword).length > 72) {
    return NextResponse.json({ error: "Password must be no more than 72 bytes." }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: "Choose a new password different from the current one." }, { status: 400 });
  }

  const currentPasswordIsValid = await verifyCredentials(session.username, currentPassword);
  if (!currentPasswordIsValid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await updateAdminPasswordHash(session.username, passwordHash);
    destroySession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Password could not be saved. Please try again later." },
      { status: 500 }
    );
  }
}
