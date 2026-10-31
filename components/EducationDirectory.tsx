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

function EducationDetailRows({ description }: { description: string }) {
  const lines = description.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return (
    <div className="education-detail-list mt-5 space-y-2.5">
      {lines.map((line, index) => {
        const separator = line.indexOf(":");
        const label = separator > 0 && separator < 24 ? line.slice(0, separator).trim() : "Note";
        const value = separator > 0 && separator < 24 ? line.slice(separator + 1).trim() : line;
        return (
          <div key={index} className="education-detail-row flex items-start gap-3">
            <span className="education-detail-icon mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {label.toLowerCase().includes("course") ? (
                  <path d="m3 8 9-5 9 5-9 5-9-5ZM5 12l7 4 7-4M5 16l7 4 7-4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                ) : label.toLowerCase().includes("academic") ? (
                  <><path d="m2 9 10-5 10 5-10 5L2 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M6 11v5c3.4 2.5 8.6 2.5 12 0v-5M22 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
                ) : label.toLowerCase().includes("level") ? (
                  <><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M2.5 20v-1.5A5.5 5.5 0 0 1 8 13h1M16 13a4 4 0 1 0 0-8M14 14h2a5.5 5.5 0 0 1 5.5 5.5V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>
                ) : (
                  <><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></>
                )}
              </svg>
            </span>
            <p className="education-detail-copy min-w-0 flex-1 text-sm leading-6 sm:text-base">
              <span className="education-detail-label">{label}:</span> {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function EducationCardIllustration({ id, category }: { id: number; category: string | null }) {
  return (
    <div className="education-card-art hidden items-center justify-center lg:flex" aria-hidden="true">
      <svg viewBox="0 0 360 280" role="presentation">
        <defs>
          <linearGradient id={"education-purple-book-" + id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9B7BFF"/><stop offset="1" stopColor="#4422C9"/></linearGradient>
          <linearGradient id={"education-orange-book-" + id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFD45A"/><stop offset="1" stopColor="#F06A00"/></linearGradient>
          <linearGradient id={"education-gold-" + id} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#FFF07B"/><stop offset="1" stopColor="#F59E0B"/></linearGradient>
        </defs>
        <circle cx="190" cy="142" r="118" fill="#123D83" opacity=".48"/>
        <path d="M25 236c65-73 174-106 310-54v74H25Z" fill="#173E91" opacity=".38"/>
        <path d="m75 208 35-27h175l32 22-38 29H50Z" fill={"url(#education-purple-book-" + id + ")"} stroke="#8B70FF" strokeWidth="3"/>
        <path d="M110 181v25h207v-3l-32-22Z" fill="#F5F3FF"/>
        <path d="m50 209 44-25h187l-34 31-197 22Z" fill={"url(#education-orange-book-" + id + ")"} stroke="#F9A91A" strokeWidth="2"/>
        <path d="M50 209v19l197 21v-19" fill="#F28A16" stroke="#F9B33E" strokeWidth="2"/>
        <path d="M124 186v18M136 186v18M282 188v15" stroke="#C8B8FF" strokeWidth="3"/>
        {category === "law" ? (
          <g stroke={"url(#education-gold-" + id + ")"} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="7">
            <path d="M188 52v118M143 76h90M188 52V35M168 170h40M176 184h24"/>
            <path d="m143 76-23 42M143 76l23 42M120 118c8 22 39 22 46 0ZM233 76l-23 42M233 76l23 42M210 118c8 22 39 22 46 0Z"/>
            <path d="M120 118h46M210 118h46" strokeWidth="3"/>
          </g>
        ) : (
          <g>
            <path d="m130 82 58-29 58 29-58 29-58-29Z" fill="#FFC64A" stroke="#FFF0A1" strokeWidth="3"/>
            <path d="M153 94v29c23 17 47 17 70 0V94M246 82v50" stroke="#FFC64A" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="246" cy="138" r="6" fill="#FFC64A"/>
          </g>
        )}
        <path d="m78 37 4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9Z" fill="#F59E0B"/>
        <circle cx="290" cy="51" r="4" fill="#24B8FF"/>
      </svg>
    </div>
  );
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
          <div className="grid grid-cols-1 gap-6">
            {filteredItems.map((item) => {
              const status = getStatus(item);
              const categoryLabel = CATEGORIES.find((category) => category.slug === item.education_category)?.label;
              const dates = [
                { key: "start", label: "Start Date", value: formatDate(item.start_date, item.application_start_display) },
                { key: "last", label: "Last Date", value: formatDate(item.last_date, item.application_end_display) },
                { key: "exam", label: "Exam Date", value: formatDate(item.exam_date, item.exam_date_display) },
              ] as const;
              return (
                <article key={item.id} className="education-exam-card education-exam-card--colorful education-exam-card--reference relative overflow-hidden rounded-[22px] border p-4 shadow-card sm:p-6 lg:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="education-exam-category inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold">
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 20h18M5 20V9h14v11M8 9V5h8v4M2 9h20M9 13v3M15 13v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {categoryLabel || "Entrance Exam"}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.is_new && <span className="education-new-badge rounded-full px-3 py-2 text-xs font-extrabold">NEW ADDED</span>}
                      <span data-status={status.label} className={"education-status-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold " + status.style}>
                        {status.label === "Registration Closed" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="m5.6 5.6 12.8 12.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                        )}
                        {status.label}
                      </span>
                      {item.academic_year && <span className="education-year-badge inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M7 3v4M17 3v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>{item.academic_year}</span>}
                    </div>
                  </div>

                  <div className="education-card-main mt-5 grid items-center gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(190px,.8fr)] lg:gap-6">
                    <div className="min-w-0">
                      <h3 className="education-exam-title font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{item.title}</h3>
                      {item.organization && <p className="education-exam-organization mt-2 text-sm font-medium sm:text-base">{item.organization}</p>}
                      {item.description && <EducationDetailRows description={item.description}/>}
                    </div>
                    <EducationCardIllustration id={item.id} category={item.education_category}/>
                  </div>

                  <div className="education-date-panel education-date-panel--reference mt-5 grid grid-cols-1 gap-2 rounded-2xl p-2 sm:grid-cols-3 sm:gap-0">
                    {dates.map((date, index) => (
                      <div key={date.key} className={"education-date-item education-date-item--" + date.key + " flex items-center gap-3 px-3 py-3 sm:px-4 " + (index > 0 ? "sm:border-l" : "")}>
                        <span className="education-date-icon grid h-12 w-12 shrink-0 place-items-center rounded-xl">
                          <svg width="25" height="25" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8"/><path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>
                        </span>
                        <span className="min-w-0"><span className="education-date-label block text-xs font-extrabold uppercase tracking-wide">{date.label}</span><span className="education-date-value mt-1 block text-base font-extrabold">{date.value}</span></span>
                      </div>
                    ))}
                  </div>

                  {item.eligibility && (
                    <div className="education-eligibility-panel education-eligibility-panel--reference mt-3 flex items-center gap-3 rounded-2xl px-4 py-3 sm:px-5">
                      <span className="education-eligibility-icon grid h-11 w-11 shrink-0 place-items-center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.9"/><circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.9"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M14 15a5 5 0 0 1 7.5 4.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg></span>
                      <span className="education-eligibility-divider hidden h-10 w-px sm:block"/>
                      <span className="min-w-0"><span className="education-eligibility-label block text-xs font-extrabold uppercase tracking-wide">Eligibility</span><span className="education-eligibility-copy mt-1 block text-sm leading-6 sm:text-base">{item.eligibility}</span></span>
                    </div>
                  )}

                  <div className="education-actions education-actions--reference mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {item.item_url && <a href={item.item_url} target="_blank" rel="noopener noreferrer" className="education-notification-link inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold text-white transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M14 3v5h5M8 14h8M8 17h8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>Notification / PDF <span aria-hidden="true">›</span></a>}
                    {item.apply_url && <a href={item.apply_url} target="_blank" rel="noopener noreferrer" className="education-apply-link inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold text-white transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14 4h6v6M20 4 10 14M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a2 2 0 0 1 1-1h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>Apply Online <span aria-hidden="true">›</span></a>}
                    {item.cap_url && <a href={item.cap_url} target="_blank" rel="noopener noreferrer" className="education-cap-link inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold text-white transition-all"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m2 9 10-5 10 5-10 5L2 9ZM6 11v5c3.4 2.5 8.6 2.5 12 0v-5M22 9v6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>CAP / Admission <span aria-hidden="true">›</span></a>}
                    {item.official_website_url && <a href={item.official_website_url} target="_blank" rel="noopener noreferrer" className="education-official-link inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold text-white transition-all"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" stroke="currentColor" strokeWidth="1.7"/></svg>Official Website <span aria-hidden="true">›</span></a>}
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
