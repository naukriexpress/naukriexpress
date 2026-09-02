import { Pool } from "pg";

// In serverless environments (Vercel), each function invocation could create
// a new pool if we're not careful, quickly exhausting Supabase's connection
// limit. Caching the pool on `globalThis` (like the common Prisma pattern)
// ensures we reuse the same pool across hot invocations in the same
// container.
declare global {
  // eslint-disable-next-line no-var
  var __naukriexpressPgPool: Pool | undefined;
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it in your environment variables (Vercel/local .env.local) to use the Postgres/Supabase backend."
    );
  }

  if (!global.__naukriexpressPgPool) {
    global.__naukriexpressPgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Supabase's pooled connection endpoint requires SSL; this setting
      // works for both the pooled (pgbouncer) and direct connection strings.
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return global.__naukriexpressPgPool;
}
