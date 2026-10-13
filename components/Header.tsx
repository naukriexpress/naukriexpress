
import Link from "next/link";
import { queryJobs } from "@/lib/db";
import AdmitCardButton from "./AdmitCardButton";
import MobileNav from "./MobileNav";
import { Suspense } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Latest Jobs" },
  { href: "/jobs?jobType=government", label: "Government Jobs" },
  { href: "/jobs?state=Maharashtra", label: "Maharashtra Jobs" },
  { href: "/admit-card", label: "Admit Card" },
  { href: "/results", label: "Results" },
  { href: "/answer-key", label: "Answer Key" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/contact", label: "Contact Us" },
];

export default async function Header() {
  const [{ total: closingToday }, { total: liveJobs }] =
    await Promise.all([
      queryJobs({ lastDate: "today", pageSize: 1 }),
      queryJobs({ pageSize: 1 }),
    ]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/10 bg-white/95 backdrop-blur">
      <div className="bg-ink-900 text-white text-xs sm:text-sm">
        <div className="container-page flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1.5">
          <span className="inline-flex items-center gap-1 font-semibold text-saffron-400">
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron-400"
              aria-hidden
            />
            LIVE
          </span>

          <span>{liveJobs} open recruitments tracked</span>

          <span className="opacity-40">•</span>

          <span className="font-medium text-leaf-400">
            {closingToday} closing today — apply now
          </span>
        </div>
      </div>

      <div className="container-page flex items-center justify-between py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl2 bg-brand-700 font-display text-lg font-bold text-white">
            BGi
          </span>

          <span className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold text-ink-900">
              NaukriExpress
            </span>

            <span className="text-[11px] font-medium tracking-wide text-brand-600">
              सरकारी नोकरी अपडेट • India
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
          {NAV_LINKS.map((item) => {
            if (item.label === "Admit Card") {
              return (
                <AdmitCardButton key={item.label} />
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-md px-3 py-2 text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/jobs"
            className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-600"
          >
            Find My Eligible Jobs
          </Link>
        </div>

        {/* Mobile Popup Navigation */}
        <Suspense fallback={
          <div className="h-10 w-10 lg:hidden" />
        }>
          <MobileNav />
        </Suspense>
      </div>
    </header>
  );
}
