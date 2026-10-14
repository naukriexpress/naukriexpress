import { NextRequest, NextResponse } from "next/server";
import { createJob, queryJobs } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSameOriginMutation } from "@/lib/security";
import type { Category, JobFilters, JobType, Qualification } from "@/lib/types";

function parseList<T extends string>(sp: URLSearchParams, key: string): T[] {
  return sp.getAll(key).slice(0, 30) as T[];
}

function parseBoundedPositiveInt(
  value: string | null,
  fallback: number,
  maximum: number
): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const requestedStatus = sp.get("status");
  const session = await getSession();

  // Drafts and scheduled jobs are for admins only. Published and expired
  // entries are public; an omitted status always defaults to published.
  if (
    requestedStatus &&
    !["published", "expired"].includes(requestedStatus) &&
    session?.role !== "admin"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const filters: JobFilters = {
    q: (sp.get("q") || "").slice(0, 200) || undefined,
    gender: (sp.get("gender") as JobFilters["gender"]) || "all",
    categories: parseList<Category>(sp, "categories"),
    qualifications: parseList<Qualification>(sp, "qualifications"),
    jobType: parseList<JobType>(sp, "jobType"),
    state: sp.get("state") || undefined,
    district: sp.get("district") || undefined,
    minAge: sp.get("minAge") ? parseBoundedPositiveInt(sp.get("minAge"), 0, 120) : undefined,
    maxAge: sp.get("maxAge") ? parseBoundedPositiveInt(sp.get("maxAge"), 0, 120) : undefined,
    lastDate: (sp.get("lastDate") as JobFilters["lastDate"]) || undefined,
    featuredOnly: sp.get("featured") === "true",
    status: (sp.get("status") as JobFilters["status"]) || "published",
    sort: (sp.get("sort") as JobFilters["sort"]) || "latest",
    page: parseBoundedPositiveInt(sp.get("page"), 1, 10000),
    pageSize: parseBoundedPositiveInt(sp.get("pageSize"), 12, 50),
  };

  const { results, total } = await queryJobs(filters);
  return NextResponse.json({
    data: results,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
  });
}

// Admin-only programmatic job creation. Public /admin/jobs/new form is the
// primary way to add jobs; this endpoint exists for scripted / bulk imports.
export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request" }, { status: 400 });
  }
  try {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid job payload" }, { status: 400 });
    }
    const job = await createJob(body as Parameters<typeof createJob>[0]);
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid job payload" }, { status: 400 });
  }
}
