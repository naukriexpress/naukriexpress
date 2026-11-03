import type { Metadata } from "next";
import Link from "next/link";
import { getAllJobsRaw } from "@/lib/db";
import { JOB_TYPE_LABELS, type JobPosting } from "@/lib/types";
import {
  getEducationDirectory,
  getPublicAdmitCardLinks,
  getPublicSiteUpdates,
  type AdmitCardLink,
  type SiteUpdateCategory,
  type SiteUpdateItem,
} from "@/lib/public-content-cache";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.naukriexpress.space";

export const metadata: Metadata = {
  title: "Complete Sitemap – All Jobs, Admit Cards, Results & Education | NaukriExpress",
  description: "Browse every published and expired recruitment, apprenticeship, admit card, result, syllabus, education entrance exam, answer key and scholarship update on NaukriExpress.",
  alternates: { canonical: SITE_URL + "/sitemap/" },
  robots: { index: true, follow: true },
};

type SitemapEntry = { href: string; title: string; meta?: string };

function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  const raw = String(value).slice(0, 10);
  const date = new Date(raw + "T00:00:00Z");
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function LinkSection({ id, title, description, entries }: {
  id: string; title: string; description: string; entries: SitemapEntry[];
}) {
  return (
    <section id={id} className="human-sitemap-section scroll-mt-28">
      <div className="human-sitemap-section-heading">
        <div><h2>{title}</h2><p>{description}</p></div>
        <span className="human-sitemap-count">{entries.length.toLocaleString("en-IN")}</span>
      </div>
      {entries.length > 0 ? (
        <ul className="human-sitemap-list">
          {entries.map((entry) => (
            <li key={entry.href}>
              <Link href={entry.href}>{entry.title}</Link>
              {entry.meta && <span>{entry.meta}</span>}
            </li>
          ))}
        </ul>
      ) : <p className="human-sitemap-empty">No public entries are available in this section yet.</p>}
    </section>
  );
}

const STATIC_PAGES: SitemapEntry[] = [
  { href: "/", title: "Home" },
  { href: "/jobs", title: "All Government & Private Jobs" },
  { href: "/apprentice", title: "All Apprenticeship Opportunities" },
  { href: "/admit-card", title: "Admit Card / Hall Ticket" },
  { href: "/results", title: "Exam Results" },
  { href: "/syllabus", title: "Syllabus & Exam Pattern" },
  { href: "/education", title: "Education Entrance Directory" },
  { href: "/answer-key", title: "Answer Keys" },
  { href: "/scholarship", title: "Scholarships" },
  { href: "/contact", title: "Contact Us" },
  { href: "/about", title: "About NaukriExpress" },
  { href: "/privacy-policy", title: "Privacy Policy" },
  { href: "/disclaimer", title: "Disclaimer" },
  { href: "/terms", title: "Terms & Conditions" },
];

const CATEGORY_DETAILS: Array<{ category: SiteUpdateCategory; id: string; title: string; description: string }> = [
  { category: "results", id: "results", title: "Results", description: "All result notices and scorecard updates added from the Admin Portal." },
  { category: "syllabus", id: "syllabus", title: "Syllabus", description: "All syllabus, exam pattern and PDF updates." },
  { category: "education", id: "education", title: "Education Entrance Exams", description: "All Maharashtra and All India entrance exam and admission records." },
  { category: "answer-key", id: "answer-key", title: "Answer Keys", description: "All answer key and response-sheet updates." },
  { category: "scholarship", id: "scholarship", title: "Scholarships", description: "All scholarship notifications and student benefit records." },
];

export default async function HumanSitemapPage() {
  const [jobsResult, updatesResult, educationResult, admitCardsResult] = await Promise.allSettled([
    getAllJobsRaw(), getPublicSiteUpdates(), getEducationDirectory(), getPublicAdmitCardLinks(),
  ]);

  const jobs: JobPosting[] = jobsResult.status === "fulfilled" ? jobsResult.value : [];
  const allUpdates: SiteUpdateItem[] = updatesResult.status === "fulfilled" ? updatesResult.value : [];
  const education: SiteUpdateItem[] = educationResult.status === "fulfilled" ? educationResult.value : [];
  const admitCards: AdmitCardLink[] = admitCardsResult.status === "fulfilled" ? admitCardsResult.value : [];

  // Keep public detail pages after deadlines; drafts and scheduled posts stay private.
  const publicJobs = jobs
    .filter((job) => (job.status === "published" || job.status === "expired") && typeof job.slug === "string" && job.slug.trim().length > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const seenSlugs = new Set<string>();
  const uniqueJobs = publicJobs.filter((job) => {
    const slug = job.slug.trim();
    if (seenSlugs.has(slug)) return false;
    seenSlugs.add(slug);
    return true;
  });

  const jobEntries = uniqueJobs.filter((job) => job.jobType !== "apprenticeship").map((job): SitemapEntry => ({
    href: "/jobs/" + job.slug,
    title: job.title,
    meta: [
      JOB_TYPE_LABELS[job.jobType],
      job.totalVacancies > 0 ? job.totalVacancies.toLocaleString("en-IN") + " Posts" : "",
      job.dates.lastDate ? "Last date: " + formatDate(job.dates.lastDate) : "",
      job.status === "expired" ? "Deadline passed" : "",
    ].filter(Boolean).join(" · "),
  }));

  const apprenticeEntries = uniqueJobs.filter((job) => job.jobType === "apprenticeship").map((job): SitemapEntry => ({
    href: "/jobs/" + job.slug,
    title: job.title,
    meta: [
      "Apprenticeship",
      job.totalVacancies > 0 ? job.totalVacancies.toLocaleString("en-IN") + " Posts" : "",
      job.dates.lastDate ? "Last date: " + formatDate(job.dates.lastDate) : "",
      job.status === "expired" ? "Deadline passed" : "",
    ].filter(Boolean).join(" · "),
  }));

  const updateEntries = (category: SiteUpdateCategory): SitemapEntry[] => {
    const records = category === "education" ? education : allUpdates.filter((item) => item.category === category);
    const seenIds = new Set<number>();
    return records.filter((item) => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    }).map((item) => ({
      href: "/updates/" + category + "/" + item.id,
      title: item.title,
      meta: [item.organization || "", item.last_date ? "Last date: " + formatDate(item.last_date) : "", item.academic_year || ""].filter(Boolean).join(" · "),
    }));
  };

  const admitEntries = admitCards.map((item): SitemapEntry => ({
    href: "/updates/admit-card/" + item.id, title: item.title, meta: "Admit Card / Hall Ticket",
  }));
  const categories = CATEGORY_DETAILS.map((category) => ({ ...category, entries: updateEntries(category.category) }));
  const counts = {
    jobs: jobEntries.length,
    apprentices: apprenticeEntries.length,
    admitCards: admitEntries.length,
    updates: categories.reduce((sum, category) => sum + category.entries.length, 0),
    pages: STATIC_PAGES.length,
  };
  const loadFailed = [jobsResult, updatesResult, educationResult, admitCardsResult].some((result) => result.status === "rejected");

  return (
    <main className="container-page human-sitemap-page py-7 sm:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-700/70">
        <Link href="/" className="hover:text-brand-700">Home</Link><span className="mx-2">›</span><span>Sitemap</span>
      </nav>
      <header className="human-sitemap-hero mb-6 rounded-2xl border p-5 shadow-sm sm:p-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em]">NAUKRIEXPRESS · COMPLETE WEBSITE DIRECTORY</p>
        <h1 className="mt-2 font-display text-2xl font-black tracking-tight sm:text-3xl">Sitemap – All Posts & Updates</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6">Browse every public recruitment and update page in one place. Select any title to open its full NaukriExpress detail page.</p>
        <div className="human-sitemap-summary mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div><strong>{counts.jobs.toLocaleString("en-IN")}</strong><span>Jobs</span></div>
          <div><strong>{counts.apprentices.toLocaleString("en-IN")}</strong><span>Apprentices</span></div>
          <div><strong>{counts.admitCards.toLocaleString("en-IN")}</strong><span>Admit Cards</span></div>
          <div><strong>{counts.updates.toLocaleString("en-IN")}</strong><span>Other Updates</span></div>
          <div><strong>{counts.pages.toLocaleString("en-IN")}</strong><span>Pages</span></div>
        </div>
        {loadFailed && <p className="human-sitemap-warning mt-4" role="status">Some live data sources could not be reached. Available sections are still shown; reload later to see any temporarily unavailable records.</p>}
      </header>

      <nav aria-label="Sitemap sections" className="human-sitemap-jump-links mb-6 rounded-xl border p-3">
        {[
          ["jobs", "Jobs"], ["apprentices", "Apprentices"], ["admit-cards", "Admit Cards"],
          ["results", "Results"], ["syllabus", "Syllabus"], ["education", "Education"],
          ["answer-key", "Answer Key"], ["scholarship", "Scholarship"], ["pages", "Website Pages"],
        ].map(([id, label]) => <a key={id} href={"#" + id}>{label}</a>)}
      </nav>

      <div className="human-sitemap-groups">
        <LinkSection id="jobs" title="Posts – Jobs & Recruitments" description="All published and expired job pages, including current and upcoming recruitment listings." entries={jobEntries} />
        <LinkSection id="apprentices" title="Apprenticeship Posts" description="All published and expired apprenticeship detail pages." entries={apprenticeEntries} />
        <LinkSection id="admit-cards" title="Admit Cards & Hall Tickets" description="All Admit Card records added through the Admin Portal." entries={admitEntries} />
        {categories.map((category) => <LinkSection key={category.id} id={category.id} title={category.title} description={category.description} entries={category.entries} />)}
        <LinkSection id="pages" title="Website Pages" description="Main sections, policy pages and important website destinations." entries={STATIC_PAGES} />
      </div>

      <footer className="human-sitemap-footer mt-7 rounded-xl border p-4 text-sm">
        <p>Search-engine XML sitemap: <Link href="/sitemap_index.xml" className="font-bold underline">Open Sitemap Index</Link></p>
        <p className="mt-1">Individual detail pages are listed here and in the XML sitemap files. Sitemap submission helps discovery but does not guarantee indexing.</p>
      </footer>
    </main>
  );
}
