import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "bgi_admin_session";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const DEV_SECRET = "dev-only-secret-change-in-production-please";
const DEV_PASSWORD_HASH = IS_PRODUCTION ? "" : bcrypt.hashSync("BgiAdmin@123", 10);

function hasStrongProductionSecret(value: string | undefined): value is string {
  return Boolean(
    value &&
      value.length >= 32 &&
      !/(change-this|replace-with|dev-only|example-secret)/i.test(value)
  );
}

function getSessionSecret(): Uint8Array | null {
  const configured = process.env.ADMIN_SESSION_SECRET;

  // Never use a predictable or documented placeholder signing key in production.
  if (IS_PRODUCTION && !hasStrongProductionSecret(configured)) {
    return null;
  }

  return new TextEncoder().encode(configured || DEV_SECRET);
}

export function isAdminAuthConfigured(): boolean {
  if (!IS_PRODUCTION) return true;

  const username = process.env.ADMIN_USERNAME?.trim();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  return Boolean(
    username &&
      username !== "change-this-admin-username" &&
      passwordHash &&
      /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(passwordHash) &&
      hasStrongProductionSecret(process.env.ADMIN_SESSION_SECRET)
  );
}

export async function verifyCredentials(username: string, password: string) {
  const expectedUsername =
    process.env.ADMIN_USERNAME || (IS_PRODUCTION ? "" : "admin");
  const passwordHash =
    process.env.ADMIN_PASSWORD_HASH || (IS_PRODUCTION ? "" : DEV_PASSWORD_HASH);

  if (
    !expectedUsername ||
    !passwordHash ||
    !username ||
    !password ||
    username !== expectedUsername ||
    password.length > 1024
  ) {
    return false;
  }

  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    // A malformed configured hash must fail closed.
    return false;
  }
}

export async function createSession(username: string) {
  const secret = getSessionSecret();
  if (!secret || !isAdminAuthConfigured()) {
    throw new Error(
      "Admin authentication is not configured securely. Set ADMIN_USERNAME, ADMIN_PASSWORD_HASH, and a 32+ character ADMIN_SESSION_SECRET."
    );
  }

  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export function destroySession() {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession() {
  const secret = getSessionSecret();
  if (!secret || !isAdminAuthConfigured()) return null;

  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (payload.role !== "admin" || typeof payload.username !== "string") {
      return null;
    }

    return payload as { username: string; role: "admin" };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
