"use client";

import { useEffect, useState } from "react";
import type { SiteUpdateCategory } from "@/lib/public-content-cache";

type UpdateItem = {
  id: number;
  category: SiteUpdateCategory;
  title: string;
  organization: string | null;
  description: string | null;
  publish_date: string | null;
  amount: string | null;
  eligibility: string | null;
  last_date: string | null;
  item_url: string | null;
  objection_url: string | null;
  apply_url: string | null;
};

type Props = { category: SiteUpdateCategory };

const CATEGORY_PRESENTATION: Record<SiteUpdateCategory, { icon: string; label: string; tone: string; primaryAction: string }> = {
  results: { icon: "🏆", label: "RESULT", tone: "update-card--sky", primaryAction: "Check Result" },
  "answer-key": { icon: "📝", label: "ANSWER KEY", tone: "update-card--violet", primaryAction: "View Answer Key" },
  syllabus: { icon: "📚", label: "SYLLABUS", tone: "update-card--teal", primaryAction: "View Syllabus / PDF" },
  scholarship: { icon: "🎓", label: "SCHOLARSHIP", tone: "update-card--amber", primaryAction: "Official Notification" },
  education: { icon: "🎓", label: "EDUCATION", tone: "update-card--sky", primaryAction: "View Entrance Exam" },
};

function SkeletonCard() {
  return (
    <article className="job-card-skeleton animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div className="h-3 w-24 rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-4/5 rounded bg-slate-100" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-14 rounded-lg bg-slate-100" />
        <div className="h-14 rounded-lg bg-slate-100" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
        <div className="h-10 rounded-lg bg-slate-200" />
        <div className="h-10 rounded-lg bg-slate-100" />
      </div>
    </article>
  );
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function UpdateCard({ item }: { item: UpdateItem }) {
  const presentation = CATEGORY_PRESENTATION[item.category] || CATEGORY_PRESENTATION.results;
  const initials = (item.organization || item.title)
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase();

  return (
    <article className={`update-listing-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${presentation.tone}`}>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="update-card-icon grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-sky-100 bg-sky-50 font-display text-sm font-extrabold text-sky-800">
            {initials || presentation.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className="update-card-kicker mb-1 inline-flex rounded-md border border-sky-100 bg-sky-50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-sky-800">
              {presentation.icon} {presentation.label}
            </span>
            <h2 className="update-card-title break-words text-base font-extrabold leading-snug tracking-tight text-slate-950 sm:text-[17px]">
              {item.item_url ? (
                <a href={item.item_url} target="_blank" rel="noopener noreferrer" className="rounded-sm transition-colors hover:text-sky-700 focus-visible:outline-offset-4">
                  {item.title}
                </a>
              ) : item.title}
            </h2>
            {item.organization && (
              <p className="update-card-organization mt-1 break-words text-sm font-semibold text-sky-800">
                {item.organization}
              </p>
            )}
          </div>
        </div>

        {item.description && (
          <p className="update-card-description mt-4 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
            {item.description}
          </p>
        )}

        <dl className="mt-4 grid flex-1 grid-cols-1 gap-2.5">
          {item.amount && (
            <div className="update-detail update-detail--emerald rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3">
              <dt className="update-detail-label text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                Scholarship Amount / Benefits
              </dt>
              <dd className="update-detail-value mt-1 break-words text-sm font-bold text-slate-950">
                {item.amount}
              </dd>
            </div>
          )}
          {item.eligibility && (
            <div className="update-detail update-detail--violet rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-3">
              <dt className="update-detail-label text-[10px] font-bold uppercase tracking-[0.12em] text-violet-800">
                Eligibility
              </dt>
              <dd className="update-detail-value mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm font-semibold text-slate-950">
                {item.eligibility}
              </dd>
            </div>
          )}
          {(item.publish_date || item.last_date) && (
            <div className="grid grid-cols-2 gap-2">
              {item.publish_date && (
                <div className="update-detail update-detail--sky min-w-0 rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-3">
                  <dt className="update-detail-label text-[10px] font-bold uppercase tracking-[0.12em] text-sky-800">Published</dt>
                  <dd className="update-detail-value mt-1 break-words text-xs font-bold text-slate-950">{formatDate(item.publish_date)}</dd>
                </div>
              )}
              {item.last_date && (
                <div className="update-detail update-detail--rose min-w-0 rounded-xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-3">
                  <dt className="update-detail-label text-[10px] font-bold uppercase tracking-[0.12em] text-rose-800">Last Date</dt>
                  <dd className="update-detail-value mt-1 break-words text-xs font-bold text-rose-700">{formatDate(item.last_date)}</dd>
                </div>
              )}
            </div>
          )}
        </dl>

        <div className="update-card-actions mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {item.item_url && (
            <a href={item.item_url} target="_blank" rel="noopener noreferrer" className="update-action update-action--primary inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-blue-600 bg-white px-3 py-2 text-center text-xs font-extrabold text-blue-700 transition-colors hover:bg-blue-50 sm:text-sm">
              {presentation.primaryAction}
            </a>
          )}
          {item.objection_url && (
            <a href={item.objection_url} target="_blank" rel="noopener noreferrer" className="update-action update-action--secondary inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-xs font-extrabold text-slate-700 transition-colors hover:bg-slate-50 sm:text-sm">
              Submit Objection
            </a>
          )}
          {item.apply_url && (
            <a href={item.apply_url} target="_blank" rel="noopener noreferrer" className="update-action update-action--apply inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-emerald-700 bg-emerald-700 px-3 py-2 text-center text-xs font-extrabold text-white transition-colors hover:bg-emerald-800 sm:text-sm">
              Apply Online
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function PublicUpdatesList({ category }: Props) {
  const [items, setItems] = useState<UpdateItem[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/site-updates?category=${encodeURIComponent(category)}`, {
      cache: "default",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("Updates could not be loaded");
        return response.json();
      })
      .then((result: { updates?: UpdateItem[] }) => {
        if (!Array.isArray(result.updates)) throw new Error("Unexpected updates response");
        setItems(result.updates);
        setError(false);
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError") setError(true);
      });

    return () => controller.abort();
  }, [category, retry]);

  if (items === null && !error) {
    return (
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading updates" aria-busy="true">
        {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
      </section>
    );
  }

  if (error) {
    return (
      <div role="alert" className="mt-8 rounded-2xl border border-ink-900/10 bg-white p-6 text-center shadow-card">
        <p className="font-semibold text-ink-900">Updates are temporarily unavailable.</p>
        <p className="mt-1 text-sm text-ink-700/70">Page open hai; update data dobara load kar sakte hain.</p>
        <button type="button" onClick={() => { setError(false); setItems(null); setRetry((value) => value + 1); }} className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
          Retry
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-ink-900/10 bg-white p-6 shadow-card">
        <p className="font-semibold text-ink-900">Abhi koi update publish nahi kiya gaya hai.</p>
        <p className="mt-1 text-sm text-ink-700/70">Kripya baad mein check karein.</p>
      </div>
    );
  }

  return (
    <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Published updates">
      {items.map((item) => <UpdateCard key={item.id} item={item} />)}
    </section>
  );
}
