import { NextRequest, NextResponse } from "next/server";
import { createJob, queryJobs } from "@/lib/db";
import { getSession } from "@/lib/auth";
import type { Category, JobFilters, JobType, Qualification } from "@/lib/types";

function parseList<T extends string>(sp: URLSearchParams, key: string): T[] {
  return sp.getAll(key) as T[];
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const filters: JobFilters = {
    q: sp.get("q") || undefined,
    gender: (sp.get("gender") as JobFilters["gender"]) || "all",
    categories: parseList<Category>(sp, "categories"),
    qualifications: parseList<Qualification>(sp, "qualifications"),
    jobType: parseList<JobType>(sp, "jobType"),
    state: sp.get("state") || undefined,
    district: sp.get("district") || undefined,
    minAge: sp.get("minAge") ? Number(sp.get("minAge")) : undefined,
    maxAge: sp.get("maxAge") ? Number(sp.get("maxAge")) : undefined,
    lastDate: (sp.get("lastDate") as JobFilters["lastDate"]) || undefined,
    featuredOnly: sp.get("featured") === "true",
    status: (sp.get("status") as JobFilters["status"]) || "published",
    sort: (sp.get("sort") as JobFilters["sort"]) || "latest",
    page: sp.get("page") ? Number(sp.get("page")) : 1,
    pageSize: sp.get("pageSize") ? Number(sp.get("pageSize")) : 12,
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
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  try {
    const job = await createJob(body);
    return NextResponse.json({ data: job }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid job payload" }, { status: 400 });
  }
}
