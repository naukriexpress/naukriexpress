"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { JobPosting } from "@/lib/types";
import { getDaysUntilDate, getIndiaTodayDate } from "@/lib/deadline";

function formatLastDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split("-");
  return year && month && day ? day + "/" + month + "/" + year.slice(-2) : "—";
}

function vacancyCount(job: JobPosting): number {
  if (job.noticeDetailsPending) return 0;
  const rowTotal = job.vacancyBreakdown.reduce(
    (sum, row) => sum + Math.max(0, Number(row.count) || 0), 0
  );
  return Math.max(Math.max(0, Number(job.totalVacancies) || 0), rowTotal);
}

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JobPosting[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 1) {
      setResults([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "/api/jobs?status=published&sort=latest&page=1&pageSize=8&q=" + encodeURIComponent(value),
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json() as { data?: JobPosting[] };
        setResults(Array.isArray(data.data) ? data.data : []);
        setOpen(true);
      } catch (error) {
        if (!(error instanceof Error && error.name === "AbortError")) {
          setResults([]);
          setOpen(false);
        }
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        method="get"
        action="/jobs"
        className="homepage-search-form mx-auto flex w-full items-center gap-2"
        onSubmit={() => setOpen(false)}
      >
        <input
          type="text"
          name="q"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(event.target.value.trim().length > 0);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="Search Jobs, Recruitment, Department or Qualification"
          aria-label="Search jobs"
          autoComplete="off"
          className="homepage-search-input min-w-0 w-full flex-1 rounded-lg border px-4 py-2.5 text-sm shadow-sm"
        />
        <button
          type="submit"
          className="homepage-search-submit shrink-0 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
        >
          Search
        </button>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[420px] overflow-y-auto rounded-xl border border-ink-900/10 bg-white shadow-xl">
          {loading ? (
            <div className="px-4 py-3 text-sm text-ink-700/70">Searching…</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-ink-700/70">No matching recruitment found.</div>
          ) : (
            results.map((job) => {
              const vacancies = vacancyCount(job);
              const daysLeft = getDaysUntilDate(job.dates.lastDate, getIndiaTodayDate());
              const today = daysLeft === 0;
              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-ink-900/10 px-3 py-2.5 last:border-b-0 hover:bg-brand-50 ${today ? "bg-red-50/40" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`highest-vacancy-countdown !grid !h-9 !w-9 !shrink-0 !text-sm ${today ? "text-red-700" : ""}`}
                      data-tone="emerald"
                      data-urgent={today ? "true" : "false"}
                      aria-label={daysLeft === null || daysLeft < 0 ? "Deadline unavailable" : today ? "Last date today" : `${daysLeft} days remaining`}
                    >
                      {daysLeft === null || daysLeft < 0 ? "—" : daysLeft}
                    </span>

                    <div className={`highest-vacancy-job-title min-w-0 flex-1 whitespace-normal break-words text-[13px] font-extrabold leading-snug sm:text-[15px] ${today ? "text-red-700" : "text-ink-900"}>
                      {job.title}
                    </div>

                    <div className="ml-auto flex shrink-0 flex-col items-end justify-center gap-1">
                      <span
                        className={`highest-vacancy-post-badge inline-flex items-center rounded-full px-2 py-1 text-[10px] font-extrabold ${today ? "text-red-700" : ""}`}
                        data-tone="emerald"
                      >
                        {vacancies > 0 ? vacancies.toLocaleString("en-IN") : "Vacancy Awaited"}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold leading-none ${today ? "border-red-300 bg-red-50 text-red-700" : "border-ink-900/10 bg-white text-ink-800"`}
                      >
                        {formatLastDate(job.dates.lastDate)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
