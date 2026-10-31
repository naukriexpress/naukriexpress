import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPool } from "@/lib/pgClient";

export const dynamic = "force-dynamic";

const SETTING_KEY = "admin_announcements_v1";
const STORAGE_PREFIX = "nx-admin-announcements:v1:";

type UpdateStatus = "draft" | "published" | "scheduled";

type Announcement = {
  id: string;
  title: string;
  message: string;
  status: UpdateStatus;
  pinned: boolean;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function decodeAnnouncements(value?: string): Announcement[] {
  if (!value?.startsWith(STORAGE_PREFIX)) return [];

  try {
    const parsed: unknown = JSON.parse(value.slice(STORAGE_PREFIX.length));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Announcement =>
      Boolean(
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.message === "string" &&
        ["draft", "published", "scheduled"].includes(item.status)
      )
    );
  } catch {
    return [];
  }
}

async function readAnnouncements(): Promise<Announcement[]> {
  const { rows } = await getPool().query(
    "SELECT setting_value FROM public.site_settings WHERE setting_key = $1 LIMIT 1",
    [SETTING_KEY]
  );
  return decodeAnnouncements(rows[0]?.setting_value);
}

function sortAnnouncements(items: Announcement[]) {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const dateA = new Date(a.publishAt || a.createdAt).getTime();
    const dateB = new Date(b.publishAt || b.createdAt).getTime();
    return dateB - dateA;
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const manage = url.searchParams.get("manage") === "1";

    if (manage && !(await getSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = sortAnnouncements(await readAnnouncements());

    if (manage) {
      return NextResponse.json(
        { items },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    }

    const now = Date.now();
    const visible = items.filter((item) => {
      if (item.status === "published") return true;
      return (
        item.status === "scheduled" &&
        Boolean(item.publishAt) &&
        new Date(item.publishAt as string).getTime() <= now
      );
    });

    return NextResponse.json(
      { items: visible },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Admin updates GET error:", error);
    return NextResponse.json({ error: "Updates could not be loaded" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getSession())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!Array.isArray(body.items) || body.items.length > 100) {
      return NextResponse.json(
        { error: "Send a list of up to 100 announcements." },
        { status: 400 }
      );
    }

    const existing = await readAnnouncements();
    const existingById = new Map(existing.map((item) => [item.id, item]));
    const now = new Date().toISOString();
    const items: Announcement[] = [];

    for (const raw of body.items) {
      if (!raw || typeof raw !== "object") {
        return NextResponse.json({ error: "Invalid announcement item." }, { status: 400 });
      }

      const title = typeof raw.title === "string" ? raw.title.trim() : "";
      const message = typeof raw.message === "string" ? raw.message.trim() : "";
      const status = raw.status as UpdateStatus;

      if (
        !title ||
        title.length > 140 ||
        !message ||
        message.length > 6000 ||
        !["draft", "published", "scheduled"].includes(status)
      ) {
        return NextResponse.json(
          { error: "Title must be 1–140 characters and message 1–6000 characters." },
          { status: 400 }
        );
      }

      const rawPublishAt =
        typeof raw.publishAt === "string" && raw.publishAt.trim()
          ? new Date(raw.publishAt)
          : null;
      if (rawPublishAt && Number.isNaN(rawPublishAt.getTime())) {
        return NextResponse.json(
          { error: "Publish date and time is invalid." },
          { status: 400 }
        );
      }
      const publishAt = rawPublishAt ? rawPublishAt.toISOString() : null;

      if (status === "scheduled" && !publishAt) {
        return NextResponse.json(
          { error: "Scheduled updates need a valid publish date and time." },
          { status: 400 }
        );
      }

      const id =
        typeof raw.id === "string" && raw.id.length <= 80 && raw.id
          ? raw.id
          : randomUUID();
      const previous = existingById.get(id);

      items.push({
        id,
        title,
        message,
        status,
        pinned: raw.pinned === true,
        publishAt,
        createdAt: previous?.createdAt || now,
        updatedAt: now,
      });
    }

    await getPool().query(
      `INSERT INTO public.site_settings (setting_key, setting_value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (setting_key)
       DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`,
      [SETTING_KEY, `${STORAGE_PREFIX}${JSON.stringify(items)}`]
    );

    return NextResponse.json({ success: true, items: sortAnnouncements(items) });
  } catch (error) {
    console.error("Admin updates POST error:", error);
    return NextResponse.json({ error: "Updates could not be saved" }, { status: 500 });
  }
}
