import { createSitemapResponse } from "@/lib/sitemap-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return createSitemapResponse("post", 1);
}
