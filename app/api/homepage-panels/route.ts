import { NextResponse } from "next/server";
import {
  getEducationDirectory,
  getPublicAdmitCardLinks,
  getPublicSiteUpdates,
} from "@/lib/public-content-cache";

export const dynamic = "force-dynamic";

function toItem(id: string | number, title: string, href: string) {
  return { id, title, href };
}

function newestFirst<T extends { publish_date?: string | null }>(items: T[]) {
  return [...items].sort((a, b) =>
    String(b.publish_date || "").localeCompare(String(a.publish_date || ""))
  );
}

export async function GET() {
  try {
    const [admitCards, results, syllabus, education, answerKey, scholarship] = await Promise.all([
      getPublicAdmitCardLinks(),
      getPublicSiteUpdates("results"),
      getPublicSiteUpdates("syllabus"),
      getEducationDirectory(),
      getPublicSiteUpdates("answer-key"),
      getPublicSiteUpdates("scholarship"),
    ]);

    const todayParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const upcomingEducation = [...education]
      .filter((item) => !item.last_date || item.last_date >= todayParts)
      .sort((a, b) =>
        String(a.last_date || "9999-12-31").localeCompare(String(b.last_date || "9999-12-31"))
      );

    const payload = {
      // Return up to seven rows per homepage panel. The complete Admit Card list
      // remains available for the sidebar search field.
      admitCards: admitCards.slice(0, 7).map((item) =>
        toItem(item.id, item.title, `/updates/admit-card/${item.id}`)
      ),
      allAdmitCards: admitCards.map((item) =>
        toItem(item.id, item.title, `/updates/admit-card/${item.id}`)
      ),
      results: newestFirst(results).slice(0, 7).map((item) =>
        toItem(item.id, item.title, `/updates/results/${item.id}`)
      ),
      syllabus: newestFirst(syllabus).slice(0, 7).map((item) =>
        toItem(item.id, item.title, `/updates/syllabus/${item.id}`)
      ),
      education: upcomingEducation.slice(0, 7).map((item) =>
        toItem(
          item.id,
          item.title,
          `/updates/education/${item.id}`
        )
      ),
      answerKey: newestFirst(answerKey).slice(0, 7).map((item) =>
        toItem(item.id, item.title, `/updates/answer-key/${item.id}`)
      ),
      scholarship: newestFirst(scholarship).slice(0, 7).map((item) =>
        toItem(item.id, item.title, `/updates/scholarship/${item.id}`)
      ),
    };

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Homepage panels GET error:", error);
    return NextResponse.json({ error: "Homepage updates could not be loaded" }, { status: 500 });
  }
}
