import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { Pool } from "pg";
import { getPool } from "@/lib/pgClient";
import {
  createSession,
  isAdminAuthConfigured,
  verifyCredentials,
} from "@/lib/auth";

const MAX_FAILED_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MINUTES = 15;
let loginRateLimitPool: Promise<Pool> | null = null;
let loginRequestCount = 0;

async function getLoginRateLimitPool(): Promise<Pool> {
  if (!loginRateLimitPool) {
    loginRateLimitPool = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
          ip_hash TEXT PRIMARY KEY,
          window_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          failure_count INTEGER NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
          blocked_until TIMESTAMPTZ,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
      await pool.query("ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY");
      await pool.query("REVOKE ALL PRIVILEGES ON TABLE public.admin_login_attempts FROM anon, authenticated");
      return pool;
    })().catch((error) => {
      loginRateLimitPool = null;
      throw error;
    });
  }
  return loginRateLimitPool!;
}

function getRateLimitKey(req: NextRequest): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Admin session secret is missing");

  // Vercel provides x-real-ip; the final forwarded entry is a fallback.
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    forwarded?.split(",").at(-1)?.trim() ||
    "unknown";

  // Store only a keyed hash, not the raw IP address.
  return createHmac("sha256", secret).update(ip).digest("hex");
}

async function loadRateLimitState(ipHash: string) {
  const pool = await getLoginRateLimitPool();
  const result = await pool.query(
    `
      INSERT INTO public.admin_login_attempts AS attempt
        (ip_hash, window_started_at, failure_count, blocked_until, updated_at)
      VALUES ($1, NOW(), 0, NULL, NOW())
      ON CONFLICT (ip_hash) DO UPDATE SET
        window_started_at = CASE
          WHEN attempt.window_started_at < NOW() - INTERVAL '15 minutes'
            AND (attempt.blocked_until IS NULL OR attempt.blocked_until <= NOW())
          THEN NOW()
          ELSE attempt.window_started_at
        END,
        failure_count = CASE
          WHEN attempt.window_started_at < NOW() - INTERVAL '15 minutes'
            AND (attempt.blocked_until IS NULL OR attempt.blocked_until <= NOW())
          THEN 0
          ELSE attempt.failure_count
        END,
        blocked_until = CASE
          WHEN attempt.window_started_at < NOW() - INTERVAL '15 minutes'
            AND (attempt.blocked_until IS NULL OR attempt.blocked_until <= NOW())
          THEN NULL
          ELSE attempt.blocked_until
        END,
        updated_at = NOW()
      RETURNING failure_count, blocked_until
    `,
    [ipHash]
  );

  loginRequestCount += 1;
  if (loginRequestCount % 100 === 0) {
    await pool.query(
      "DELETE FROM public.admin_login_attempts WHERE updated_at < NOW() - INTERVAL '2 days'"
    );
  }

  const row = result.rows[0];
  const blockedUntil = row?.blocked_until
    ? new Date(row.blocked_until).getTime()
    : 0;

  return {
    pool,
    blocked: blockedUntil > Date.now(),
  };
}

async function recordFailedAttempt(pool: Pool, ipHash: string) {
  await pool.query(
    `
      UPDATE public.admin_login_attempts
      SET
        failure_count = CASE
          WHEN window_started_at < NOW() - INTERVAL '15 minutes' THEN 1
          ELSE failure_count + 1
        END,
        window_started_at = CASE
          WHEN window_started_at < NOW() - INTERVAL '15 minutes' THEN NOW()
          ELSE window_started_at
        END,
        blocked_until = CASE
          WHEN window_started_at < NOW() - INTERVAL '15 minutes' THEN NULL
          WHEN failure_count + 1 >= $2 THEN NOW() + INTERVAL '15 minutes'
          ELSE blocked_until
        END,
        updated_at = NOW()
      WHERE ip_hash = $1
    `,
    [ipHash, MAX_FAILED_ATTEMPTS]
  );
}

async function clearFailedAttempts(pool: Pool, ipHash: string) {
  await pool.query(
    `
      UPDATE public.admin_login_attempts
      SET window_started_at = NOW(), failure_count = 0, blocked_until = NULL, updated_at = NOW()
      WHERE ip_hash = $1
    `,
    [ipHash]
  );
}

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

  let rateLimitKey = "";
  let pool: Pool | null = null;

  // Production uses a database-backed limiter that is shared across serverless instances.
  // Local development keeps working with the demo JSON store and no database.
  if (process.env.NODE_ENV === "production") {
    try {
      rateLimitKey = getRateLimitKey(req);
      const limitState = await loadRateLimitState(rateLimitKey);
      pool = limitState.pool;
      if (limitState.blocked) {
        return NextResponse.json(
          { error: "Too many login attempts. Try again in 15 minutes." },
          { status: 429, headers: { "Retry-After": String(ATTEMPT_WINDOW_MINUTES * 60) } }
        );
      }
    } catch (error) {
      // Fail closed rather than leave production admin login without rate limiting.
      console.error("Admin login rate limiter unavailable:", error);
      return NextResponse.json(
        { error: "Admin login is temporarily unavailable." },
        { status: 503 }
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    if (pool && rateLimitKey) await recordFailedAttempt(pool, rateLimitKey);
    return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    await recordFailedAttempt(pool, rateLimitKey);
    return NextResponse.json({ error: "Invalid login request" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  if (
    typeof data.username !== "string" ||
    typeof data.password !== "string" ||
    data.username.length > 100 ||
    data.password.length > 1024
  ) {
    await recordFailedAttempt(pool, rateLimitKey);
    return NextResponse.json({ error: "Invalid login request" }, { status: 400 });
  }

  const ok = await verifyCredentials(data.username, data.password);
  if (!ok) {
    await recordFailedAttempt(pool, rateLimitKey);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  try {
    await createSession(data.username);
    if (pool && rateLimitKey) await clearFailedAttempts(pool, rateLimitKey);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin session creation failed:", error);
    return NextResponse.json(
      { error: "Admin login is temporarily unavailable." },
      { status: 503 }
    );
  }
}
