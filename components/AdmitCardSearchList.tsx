"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type AdmitCardLink = {
  id: number;
  title: string;
  url: string;
};

export default function AdmitCardSearchList({
  links,
  ctaLabel,
}: {
  links: AdmitCardLink[];
  ctaLabel: string;
}) {
  const [query, setQuery] = useState("");

  const filteredLinks = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return links;
    return links.filter((item) => item.title.toLocaleLowerCase().includes(normalized));
  }, [links, query]);

  return (
    <section className="mt-7">
      <label htmlFor="admit-card-page-search" className="sr-only">
        Search admit cards
      </label>
      <div className="relative mb-5">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-700/55"
        >
          <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          id="admit-card-page-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Admit Card, Exam or Department..."
          autoComplete="off"
          className="w-full rounded-xl border border-ink-900/15 bg-white py-3.5 pl-12 pr-4 text-sm text-ink-900 shadow-sm outline-none transition placeholder:text-ink-700/50 focus:border-[#356F66] focus:ring-2 focus:ring-[#356F66]/15"
        />
      </div>

      {filteredLinks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-900/20 bg-white p-6 text-center text-sm text-ink-700">
          {links.length === 0
            ? "Abhi koi Admit Card update publish nahi kiya gaya hai. Kripya baad mein check karein."
            : "Koi matching Admit Card nahi mila. Search ka naam badal kar dekhein."}
        </p>
      ) : (
        <div className="admit-card-page-list divide-y divide-ink-900/10 rounded-xl2 border border-ink-900/10 bg-white">
          {filteredLinks.map((item) => (
            <Link
              key={item.id}
              href={`/updates/admit-card/${item.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-brand-50/50"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink-900">{item.title}</p>
                <p className="text-xs text-ink-700/60">Admit card / hall ticket link</p>
              </div>
              <span className="shrink-0 rounded-lg border border-[#356F66] bg-[#356F66] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2F625B]">
                {ctaLabel}
              </span>
            </Link>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-ink-700/55">
        Showing {filteredLinks.length} of {links.length} Admit Card updates
      </p>
    </section>
  );
}
