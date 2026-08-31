import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "bgi_admin_session";
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_SESSION_SECRET || "dev-only-secret-change-in-production-please"
);

// Demo credentials for local testing. In production, replace with a real
// users table (see schema.sql) and never store plaintext passwords.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
// Default password: "BgiAdmin@123" (hashed below at import time for demo).
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  bcrypt.hashSync("BgiAdmin@123", 10);

export async function verifyCredentials(username: string, password: string) {
  if (username !== ADMIN_USERNAME) return false;
  return bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}

export async function createSession(username: string) {
  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(SECRET);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export function destroySession() {
  cookies().set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { username: string; role: string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
