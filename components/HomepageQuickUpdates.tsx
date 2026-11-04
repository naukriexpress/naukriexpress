"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroSearch from "./HeroSearch";

type HomePanelItem = {
  id: string | number;
  title: string;
  href: string;
};

type HomePanelData = {
  admitCards: HomePanelItem[];
  allAdmitCards: HomePanelItem[];
  results: HomePanelItem[];
  syllabus: HomePanelItem[];
  education: HomePanelItem[];
  answerKey: HomePanelItem[];
  scholarship: HomePanelItem[];
};

type GroupKey = keyof HomePanelData;

const GROUPS: Array<{
  key: GroupKey;
  title: string;
  href: string;
  icon: "card" | "result" | "book" | "education" | "answerKey" | "scholarship";
}> = [
  { key: "admitCards", title: "Admit Card", href: "/admit-card", icon: "card" },
  { key: "results", title: "Results", href: "/results", icon: "result" },
  { key: "syllabus", title: "Syllabus", href: "/syllabus", icon: "book" },
  { key: "education", title: "Education", href: "/education", icon: "education" },
  { key: "answerKey", title: "Answer Key", href: "/answer-key", icon: "answerKey" },
  { key: "scholarship", title: "Scholarship", href: "/scholarship", icon: "scholarship" },
];

function GroupIcon({ kind }: { kind: (typeof GROUPS)[number]["icon"] }) {
  const common = {
    className: "h-5 w-5 shrink-0 text-brand-700",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  if (kind === "card") {
    return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>;
  }
  if (kind === "result") {
    return <svg {...common}><path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" /><path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 11v5m-4 5 4-2 4 2-1-5H9l-1 5Z" /></svg>;
  }
  if (kind === "book") {
    return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" /><path d="M4 6h13M8 8h7M8 12h7" /></svg>;
  }
  if (kind === "education") {
    return <svg {...common}><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 12v4c3 2 7 2 10 0v-4M21 9v6" /></svg>;
  }
  if (kind === "answerKey") {
    return <svg {...common}><path d="M8 3h8l4 4v14H4V3h4Z" /><path d="M14 3v5h6M8 12h8M8 16h5" /><path d="m9 8 1.5 1.5L13 7" /></svg>;
  }
  return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M8.5 11 7 21l5-2 5 2-1.5-10" /><path d="m10 8 1.3 1.3L14 6.5" /></svg>;
}

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

export default function HomepageQuickUpdates() {
  const [data, setData] = useState<HomePanelData | null>(null);
  const [failed, setFailed] = useState(false);
  const [admitCardSearch, setAdmitCardSearch] = useState("");

  const normalizedAdmitCardSearch = admitCardSearch.trim().toLocaleLowerCase();
  const admitCardMatches = normalizedAdmitCardSearch
    ? (data?.allAdmitCards ?? data?.admitCards ?? []).filter((item) =>
        item.title.toLocaleLowerCase().includes(normalizedAdmitCardSearch)
      )
    : [];

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/homepage-panels", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Homepage updates could not be loaded");
        return response.json();
      })
      .then((payload: HomePanelData) => {
        setData(payload);
        setFailed(false);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <aside className="min-w-0 space-y-3" aria-label="Search, admit cards, results, syllabus, education, answer key and scholarship updates">
      <div className="homepage-search-spacer mb-1 pt-6">
        <HeroSearch />
      </div>
      {GROUPS.map((group) => {
        const items = data?.[group.key] ?? [];
        const visibleItems = group.key === "admitCards" && normalizedAdmitCardSearch
          ? admitCardMatches
          : items;
        return (
          <section
            key={group.key}
            className="homepage-quick-panel overflow-hidden rounded-xl border shadow-sm"
            aria-labelledby={`home-panel-${group.key}`}
          >
            <div className="homepage-quick-panel-header flex items-center justify-between gap-2 border-b px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <GroupIcon kind={group.icon} />
                <h2 id={`home-panel-${group.key}`} className="homepage-quick-panel-title truncate text-sm font-extrabold sm:text-base">
                  {group.title}
                </h2>
              </div>
              <Link href={group.href} className="homepage-quick-link shrink-0 text-[11px] font-bold hover:underline sm:text-xs">
                View All →
              </Link>
            </div>

            {group.key === "admitCards" && (
              <div className="border-b border-ink-900/10 bg-white px-3 py-2.5">
                <label htmlFor="homepage-admit-card-search" className="sr-only">
                  Search all Admit Cards
                </label>
                <div className="relative">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-700/55"
                  >
                    <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <input
                    id="homepage-admit-card-search"
                    type="search"
                    value={admitCardSearch}
                    onChange={(event) => setAdmitCardSearch(event.target.value)}
                    placeholder="Search Admit Card..."
                    autoComplete="off"
                    className="w-full rounded-lg border border-ink-900/15 bg-white py-2.5 pl-9 pr-3 text-xs text-ink-900 outline-none transition placeholder:text-ink-700/50 focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
            )}

            <div className="homepage-quick-panel-divider divide-y">
              {data === null && !failed ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex h-9 items-center gap-2 px-3" aria-hidden="true">
                    <span className="h-2 w-2 rounded-full bg-brand-200" />
                    <span className="h-3 flex-1 rounded bg-brand-100" />
                  </div>
                ))
              ) : visibleItems.length > 0 ? (
                (group.key === "admitCards" && !normalizedAdmitCardSearch
                  ? visibleItems.slice(0, 4)
                  : visibleItems
                ).map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target={isExternal(item.href) ? "_blank" : undefined}
                    rel={isExternal(item.href) ? "noopener noreferrer" : undefined}
                    className="homepage-quick-row group flex min-w-0 items-start gap-2 px-3 py-2 text-[12px] font-semibold leading-snug transition-colors sm:text-[13px]"
                  >
                    <span className="mt-0.5 shrink-0 font-black text-brand-700" aria-hidden="true">»</span>
                    <span className="min-w-0 flex-1 whitespace-normal break-words">{item.title}</span>
                    <span className="shrink-0 text-base leading-none text-brand-700" aria-hidden="true">›</span>
                  </a>
                ))
              ) : (
                <p className="homepage-quick-empty px-3 py-3 text-xs">
                  {failed
                    ? "Updates could not be loaded."
                    : group.key === "admitCards" && normalizedAdmitCardSearch
                      ? "No matching Admit Card found."
                      : "New updates will appear here."}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </aside>
  );
}
