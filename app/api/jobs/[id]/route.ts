import { NextRequest, NextResponse } from "next/server";
import { deleteJob, getJobById, updateJob } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isSameOriginMutation } from "@/lib/security";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [job, session] = await Promise.all([getJobById(params.id), getSession()]);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Do not disclose drafts or scheduled postings by guessed/known database ID.
  if (
    session?.role !== "admin" &&
    !["published", "expired"].includes(job.status)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: job });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid job payload" }, { status: 400 });
  }

  const updated = await updateJob(params.id, body as Parameters<typeof updateJob>[1]);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOriginMutation(_req)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  const session = await getSession();
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ok = await deleteJob(params.id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
