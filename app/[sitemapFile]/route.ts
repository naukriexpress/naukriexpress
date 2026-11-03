import { NextResponse } from "next/server";
import {
  createSitemapResponse,
  type SitemapFilePrefix,
} from "@/lib/sitemap-data";

export const dynamic = "force-dynamic";

const VALID_PREFIXES = new Set<SitemapFilePrefix>([
  "post", "apprentice", "admit-card", "result",
  "answer-key", "syllabus", "education", "scholarship",
]);

export async function GET(
  _request: Request,
  { params }: { params: { sitemapFile: string } }
) {
  const match = /^(post|apprentice|admit-card|result|answer-key|syllabus|education|scholarship)-sitemap(\\d+)\\.xml$/.exec(params.sitemapFile);
  if (!match) return new NextResponse("Not found", { status: 404 });

  const prefix = match[1] as SitemapFilePrefix;
  const page = Number(match[2]);
  if (!VALID_PREFIXES.has(prefix) || !Number.isSafeInteger(page) || page < 2) {
    return new NextResponse("Not found", { status: 404 });
  }

  return createSitemapResponse(prefix, page);
}
