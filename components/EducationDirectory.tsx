"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const CATEGORIES = [
  { slug: "ug", label: "UG Entrance Exams" },
  { slug: "pg", label: "PG Entrance Exams" },
  { slug: "mba-management", label: "MBA / Management" },
  { slug: "phd-research", label: "PhD / Research" },
  { slug: "medical-health", label: "Medical / Health" },
  { slug: "engineering-architecture", label: "Engineering / Architecture" },
  { slug: "law", label: "Law Entrance Exams" },
  { slug: "teaching", label: "Teaching / Education" },
  { slug: "design-arts", label: "Design & Arts" },
  { slug: "agriculture", label: "Agriculture & Allied Admissions" },
] as const;

type EducationItem = {
  id: number;
  title: string;
  organization: string | null;
  description: string | null;
  eligibility: string | null;
  education_category: string | null;
  start_date: string | null;
  last_date: string | null;
  exam_date: string | null;
  item_url: string | null;
  apply_url: string | null;
  cap_url: string | null;
  official_website_url: string | null;
  application_start_display: string | null;
  application_end_display: string | null;
  exam_date_display: string | null;
  academic_year: string | null;
  status_as_of: string | null;
  is_new: boolean;
};

function dateOnly(value: string | null | undefined) {
  return value ? String(value).slice(0, 10) : "";
}

function todayIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function formatDate(value: string | null | undefined, display?: string | null) {
  const date = dateOnly(value);
  if (!date) return display || "To be announced";
  const parsed = new Date(`${date}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function getStatus(item: EducationItem) {
  const today = todayIndia();
  const start = dateOnly(item.start_date);
  const end = dateOnly(item.last_date);
  if (end && end < today) return { label: "Registration Closed", style: "bg-ink-900/5 text-ink-700" };
  if (start && start > today) return { label: "Upcoming", style: "bg-brand-50 text-brand-700" };
  if (end && end >= today && (!start || start <= today)) return { label: "Registration Open", style: "bg-leaf-50 text-leaf-700" };

  const statusMap: Record<string, { label: string; style: string }> = {
    registration_open: { label: "Registration Open", style: "bg-leaf-50 text-leaf-700" },
    exam_upcoming: { label: "Exam Upcoming", style: "bg-brand-50 text-brand-700" },
    date_awaited: { label: "Dates Awaited", style: "bg-saffron-50 text-saffron-700" },
    closed: { label: "Registration Closed", style: "bg-ink-900/5 text-ink-700" },
    year_round: { label: "Year Round", style: "bg-leaf-50 text-leaf-700" },
    university_schedule_required: { label: "University Schedule Required", style: "bg-saffron-50 text-saffron-700" },
    university_admission_notice_published: { label: "Admission Notice Published", style: "bg-brand-50 text-brand-700" },
    department_wise_notice: { label: "Department-wise Notice", style: "bg-saffron-50 text-saffron-700" },
    see_board_notification: { label: "See Board Notification", style: "bg-saffron-50 text-saffron-700" },
    see_official_admission_schedule: { label: "Admission Schedule Awaited", style: "bg-saffron-50 text-saffron-700" },
    notice_published_dates_to_confirm: { label: "Notice Published – Dates to Confirm", style: "bg-saffron-50 text-saffron-700" },
    cap_admission_route: { label: "CAP Admission Route", style: "bg-brand-50 text-brand-700" },
  };
  if (item.status_as_of && statusMap[item.status_as_of]) return statusMap[item.status_as_of];
  if (!start && !end) return { label: "Dates Awaited", style: "bg-saffron-50 text-saffron-700" };
  return { label: "Check Official Notice", style: "bg-saffron-50 text-saffron-700" };
}

export default function EducationDirectory({
  items,
  activeCategory,
  categoryCounts,
}: {
  items: EducationItem[];
  activeCategory: string;
  categoryCounts: Record<string, number>;
}) {
  const [search, setSearch] = useState("");
  const currentCategory = CATEGORIES.find((category) => category.slug === activeCategory);
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!query) return true;
      return [
        item.title,
        item.organization || "",
        item.description || "",
        item.eligibility || "",
      ].join(" ").toLowerCase().includes(query);
    });
  }, [items, search]);

  const openCount = items.filter((item) => getStatus(item).label === "Registration Open").length;
  const upcomingCount = items.filter((item) => getStatus(item).label === "Upcoming").length;

  return (
    <section className="container-page py-7 sm:py-10">
      <div className="education-directory-shell overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 shadow-card">
        <div className="education-directory-hero px-5 py-8 sm:px-10 sm:py-10">
          <div className="education-directory-heading mx-auto flex max-w-3xl items-center justify-center gap-3 sm:gap-4">
            <span className="education-directory-logo grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-saffron-100 text-brand-700 sm:h-12 sm:w-12">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M6 11v5.2c3.2 2.6 8.8 2.6 12 0V11M21.5 9v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h1 className="education-directory-title text-left font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
              Education Entrance Directory
            </h1>
          </div>
          <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-2">
            <div className="education-stat-card rounded-xl border border-white bg-white/90 px-2 py-3 shadow-sm">
              <p className="education-stat-number education-stat-number--total font-display text-xl font-extrabold text-brand-700">{items.length}</p>
              <p className="education-stat-label text-[11px] font-semibold text-ink-700/60">Listed Exams</p>
            </div>
            <div className="education-stat-card rounded-xl border border-white bg-white/90 px-2 py-3 shadow-sm">
              <p className="education-stat-number education-stat-number--open font-display text-xl font-extrabold text-leaf-600">{openCount}</p>
              <p className="education-stat-label text-[11px] font-semibold text-ink-700/60">Registration Open</p>
            </div>
            <div className="education-stat-card rounded-xl border border-white bg-white/90 px-2 py-3 shadow-sm">
              <p className="education-stat-number education-stat-number--upcoming font-display text-xl font-extrabold text-saffron-600">{upcomingCount}</p>
              <p className="education-stat-label text-[11px] font-semibold text-ink-700/60">Upcoming</p>
            </div>
          </div>
        </div>

        <div className="education-category-panel border-t border-brand-100 bg-white/80 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="education-section-title font-display text-lg font-bold text-ink-900">Explore by Category</h2>
                
              </div>
              {activeCategory !== "all" && (
                <Link href="/education" className="text-xs font-semibold text-brand-700 hover:underline">View all categories</Link>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((category) => {
                const selected = activeCategory === category.slug;
                return (
                  <Link
                    key={category.slug}
                    href={selected ? "/education" : `/education?category=${category.slug}`}
                    aria-current={selected ? "page" : undefined}
                    className={`education-category-card group flex min-h-12 items-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${selected ? "border-brand-400 bg-brand-50 text-brand-800 ring-1 ring-brand-200" : "border-ink-900/10 bg-white text-ink-800"}`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${selected ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700"}`} aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                        <path d="M4 6v14.5A2.5 2.5 0 0 1 6.5 18H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">{category.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${selected ? "bg-white text-brand-700" : "bg-paper text-ink-700/60"}`}>{categoryCounts[category.slug] || 0}</span>
                    <span className="text-ink-700/40 transition group-hover:translate-x-0.5 group-hover:text-brand-700" aria-hidden="true">›</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="education-exam-list mt-7" id="entrance-exams">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Entrance Exam Updates</p>
            <h2 className="education-section-title mt-1 font-display text-xl font-extrabold text-ink-900">
              {currentCategory ? currentCategory.label : "All Entrance Exams"}
            </h2>
          </div>
          <span className="education-results-count rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-sm">{filteredItems.length} exams</span>
        </div>

        <label className="education-search-box mb-4 flex items-center gap-2 rounded-xl border border-ink-900/15 bg-white px-3 py-2.5 shadow-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-ink-700/50">
            <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
            <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search exam name, university or course..." className="min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-700/40" />
        </label>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-900/20 bg-white px-5 py-10 text-center shadow-sm">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" stroke="currentColor" strokeWidth="1.7" />
                <path d="M4 6v14.5A2.5 2.5 0 0 1 6.5 18H20" stroke="currentColor" strokeWidth="1.7" />
              </svg>
            </div>
            <h3 className="mt-3 font-bold text-ink-900">{search ? "No matching exams" : "No exams added in this category yet"}</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-700/60">
              {search ? "Search ko change karke dobara try karein." : "Entrance exam records admin panel ke Manage Education section se add kiye ja sakte hain."}
            </p>
            {activeCategory !== "all" && <Link href="/education" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">All categories dekhein</Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredItems.map((item) => {
              const status = getStatus(item);
              const categoryLabel = CATEGORIES.find((category) => category.slug === item.education_category)?.label;
              return (
                <article key={item.id} className="education-exam-card rounded-2xl border border-ink-900/10 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="education-exam-category rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700">{categoryLabel || "Entrance Exam"}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.is_new && <span className="rounded-full bg-saffron-50 px-2.5 py-1 text-[11px] font-bold text-saffron-700">NEW ADDED</span>}
                      <span className={`education-status-badge rounded-full px-2.5 py-1 text-[11px] font-bold ${status.style}`}>{status.label}</span>
                      {item.academic_year && <span className="education-year-badge rounded-full bg-ink-900/5 px-2.5 py-1 text-[11px] font-bold text-ink-700">{item.academic_year}</span>}
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-lg font-extrabold leading-snug text-ink-900">{item.title}</h3>
                  {item.organization && <p className="mt-1 text-xs font-medium text-ink-700/60">{item.organization}</p>}
                  {item.description && <p className="education-exam-description mt-3 whitespace-pre-line text-sm leading-6 text-ink-700">{item.description}</p>}

                  <div className="education-date-panel mt-4 grid grid-cols-2 gap-2 rounded-xl bg-paper p-3 sm:grid-cols-3">
                    <div>
                      <p className="education-date-label text-[10px] font-bold uppercase tracking-wide text-ink-700/50">Start Date</p>
                      <p className="mt-1 text-xs font-semibold text-ink-900">{formatDate(item.start_date, item.application_start_display)}</p>
                    </div>
                    <div>
                      <p className="education-date-label text-[10px] font-bold uppercase tracking-wide text-ink-700/50">Last Date</p>
                      <p className="mt-1 text-xs font-semibold text-ink-900">{formatDate(item.last_date, item.application_end_display)}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="education-date-label text-[10px] font-bold uppercase tracking-wide text-ink-700/50">Exam Date</p>
                      <p className="mt-1 text-xs font-semibold text-ink-900">{formatDate(item.exam_date, item.exam_date_display)}</p>
                    </div>
                  </div>

                  {item.eligibility && (
                    <div className="mt-3">
                      <p className="education-eligibility-label text-[10px] font-bold uppercase tracking-wide text-ink-700/50">Eligibility</p>
                      <p className="education-eligibility-copy mt-1 text-sm leading-5 text-ink-800">{item.eligibility}</p>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.item_url && (
                      <a href={item.item_url} target="_blank" rel="noopener noreferrer" className="education-notification-link inline-flex items-center gap-1.5 rounded-lg border border-brand-600 px-3 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-50">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 3v5h5M8 14h8M8 17h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
                        Notification / PDF
                      </a>
                    )}
                    {item.apply_url && (
                      <a href={item.apply_url} target="_blank" rel="noopener noreferrer" className="education-apply-link inline-flex items-center gap-1.5 rounded-lg bg-leaf-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-leaf-700">
                        Apply Online <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {item.cap_url && (
                      <a href={item.cap_url} target="_blank" rel="noopener noreferrer" className="education-cap-link inline-flex items-center gap-1.5 rounded-lg border border-saffron-400 bg-saffron-50 px-3 py-2 text-xs font-bold text-saffron-700 transition hover:bg-saffron-100">
                        CAP / Admission <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {item.official_website_url && (
                      <a href={item.official_website_url} target="_blank" rel="noopener noreferrer" className="education-official-link inline-flex items-center gap-1.5 rounded-lg border border-ink-900/15 px-3 py-2 text-xs font-bold text-ink-700 transition hover:bg-paper">
                        Official Website <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
