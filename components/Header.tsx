import Link from "next/link";
import { queryJobs } from "@/lib/db";
import AdmitCardButton from "./AdmitCardButton";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Latest Jobs" },
  { href: "/jobs?jobType=government", label: "Government Jobs" },
  { href: "/jobs?state=Maharashtra", label: "Maharashtra Jobs" },
  { href: "/apprenticeships", label: "Apprenticeships" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/admit-card", label: "Admit Card" },
  { href: "/results", label: "Results" },
  { href: "/answer-key", label: "Answer Key" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/contact", label: "Contact Us" },
];

export default async function Header() {
  const [{ total: closingToday }, { total: liveJobs }] = await Promise.all([
    queryJobs({ lastDate: "today", jobType: ["government", "private", "contract", "apprenticeship", "internship"], pageSize: 1 }),
    queryJobs({ jobType: ["government", "private", "contract", "apprenticeship", "internship"], pageSize: 1 }),
  ]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-ink-900/10">
      <div className="bg-ink-900 text-white text-xs sm:text-sm">
        <div className="container-page flex items-center gap-2 py-1.5 overflow-x-auto whitespace-nowrap">
          <span className="inline-flex items-center gap-1 font-semibold text-saffron-400">
            <span className="h-1.5 w-1.5 rounded-full bg-saffron-400 animate-pulse" aria-hidden />
            LIVE
          </span>
          <span>{liveJobs} open recruitments tracked</span>
          <span className="opacity-40">•</span>
          <span className="text-leaf-400 font-medium">
            {closingToday} closing today — apply now
          </span>
        </div>
      </div>

      <div className="container-page flex flex-wrap items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
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

        {/* Desktop Nav */}
        <nav className="order-3 hidden w-full lg:flex flex-wrap items-center justify-center gap-0.5 border-t border-ink-900/10 mt-2 pt-1 text-xs font-medium">
          {NAV_LINKS.map((l) => {
            if (l.label === "Admit Card") {
              return <AdmitCardButton key={l.label} />;
            }
            return (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-md px-2 py-2 whitespace-nowrap text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/jobs"
            className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-saffron-600 transition-colors"
          >
            Find My Eligible Jobs
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <input type="checkbox" id="mobile-nav-toggle" className="peer hidden" />
        <label
          htmlFor="mobile-nav-toggle"
          className="lg:hidden grid h-10 w-10 place-items-center rounded-lg border border-ink-900/15 cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2.5 5h15M2.5 10h15M2.5 15h15" stroke="#0B1E33" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </label>
        <div className="fixed inset-0 z-50 hidden peer-checked:block lg:hidden">
          <label htmlFor="mobile-nav-toggle" className="absolute inset-0 bg-ink-900/40" />
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-bold text-ink-900">Menu</span>
              <label htmlFor="mobile-nav-toggle" className="grid h-9 w-9 place-items-center rounded-lg border border-ink-900/15 cursor-pointer">
                ✕
              </label>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => {
                if (l.label === "Admit Card") {
                  return <AdmitCardButton key={l.label} />;
                }

                return (
                  <Link
                    key={l.label}
                    href={l.href}
                    className="rounded-md px-3 py-2.5 text-ink-800 font-medium hover:bg-ink-100"
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/jobs"
              className="mt-4 block rounded-lg bg-saffron-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Find My Eligible Jobs
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
