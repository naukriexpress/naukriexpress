import type { MetadataRoute } from "next";

const SITE_URL = "https://www.naukriexpress.space";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL + "/", changeFrequency: "daily", priority: 1 },
    { url: SITE_URL + "/jobs", changeFrequency: "daily", priority: 0.9 },
    { url: SITE_URL + "/sitemap/", changeFrequency: "daily", priority: 0.7 },
    { url: SITE_URL + "/apprentice", changeFrequency: "daily", priority: 0.8 },
    { url: SITE_URL + "/admit-card", changeFrequency: "daily", priority: 0.8 },
    { url: SITE_URL + "/results", changeFrequency: "daily", priority: 0.8 },
    { url: SITE_URL + "/answer-key", changeFrequency: "daily", priority: 0.8 },
    { url: SITE_URL + "/syllabus", changeFrequency: "weekly", priority: 0.7 },
    { url: SITE_URL + "/education", changeFrequency: "daily", priority: 0.8 },
    { url: SITE_URL + "/scholarship", changeFrequency: "weekly", priority: 0.7 },
    { url: SITE_URL + "/contact", changeFrequency: "yearly", priority: 0.3 },
    { url: SITE_URL + "/about", changeFrequency: "yearly", priority: 0.3 },
    { url: SITE_URL + "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
    { url: SITE_URL + "/disclaimer", changeFrequency: "yearly", priority: 0.2 },
    { url: SITE_URL + "/terms", changeFrequency: "yearly", priority: 0.2 },
  ];
}
