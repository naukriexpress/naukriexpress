import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "bgi_admin_session";

function getSecret() {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!configured || configured.length < 32) {
      throw new Error("ADMIN_SESSION_SECRET must be set to a random value of at least 32 characters in production.");
    }
    return new TextEncoder().encode(configured);
  }

  // Development only: production never accepts this fallback.
  return new TextEncoder().encode(configured || "local-development-secret-not-for-production");
}

export async function verifyCredentials(username: string, password: string) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  // Fail closed. Never ship a default username or password.
  if (!adminUsername || !passwordHash || !username || !password) return false;
  if (username !== adminUsername) return false;

  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    return false;
  }
}

export async function createSession(username: string) {
  if (process.env.NODE_ENV === "production" && (!process.env.ADMIN_USERNAME || username !== process.env.ADMIN_USERNAME)) {
    throw new Error("Admin session cannot be created for an unconfigured user.");
  }

  const secret = getSecret();
  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export function destroySession() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    if (payload.role !== "admin" || typeof payload.username !== "string") return null;
    return payload as { username: string; role: string };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
