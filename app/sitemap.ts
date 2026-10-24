export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import { getAllJobsRaw } from "@/lib/db";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";

const SITE_URL = "https://www.naukriexpress.space";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/apprentice`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/scholarship`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/admit-card`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/results`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/answer-key`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/syllabus`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const today = getIndiaTodayDate();
  const allJobs = await getAllJobsRaw();
  const jobPages: MetadataRoute.Sitemap = allJobs
    .filter((job) => {
      if (job.status !== "published") return false;

      if (job.noticeDetailsPending) return false;

      const daysUntilDeadline = getDaysUntilDate(job.dates.lastDate, today);
      return daysUntilDeadline !== null && daysUntilDeadline >= 0;
    })
    .map((job) => ({
      url: `${SITE_URL}/jobs/${job.slug}`,
      lastModified: job.updatedAt,
      changeFrequency: "daily",
      priority: job.featured ? 0.9 : 0.7,
    }));

  return [...staticPages, ...jobPages];
}
