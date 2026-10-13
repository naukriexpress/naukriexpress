
import Link from "next/link";
import { queryJobs } from "@/lib/db";
import AdmitCardButton from "./AdmitCardButton";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Latest Jobs" },
  { href: "/jobs?jobType=government", label: "Government Jobs" },
  { href: "/jobs?state=Maharashtra", label: "Maharashtra Jobs" },
  { href: "/jobs?jobType=apprenticeship", label: "Apprenticeships" },
  { href: "/jobs?jobType=scholarship", label: "Scholarships" },
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
    <>
      {/* Mobile Menu Toggle - CSS Only */}
      <input
        type="checkbox"
        id="mobile-nav-toggle"
        className="peer sr-only"
      />

      <header className="sticky top-0 z-40 border-b border-ink-900/10 bg-white/95 backdrop-blur">
        {/* Live Jobs Bar */}
        <div className="bg-ink-900 text-white text-xs sm:text-sm">
          <div className="container-page flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1.5">
            <span className="inline-flex items-center gap-1 font-semibold text-saffron-400">
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron-400"
                aria-hidden="true"
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

        {/* Main Header */}
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
            {NAV_LINKS.map((l) => {
              if (l.label === "Admit Card") {
                return <AdmitCardButton key={l.label} />;
              }

              return (
                <Link
                  key={l.label}
                  href={l.href}
                  className="rounded-md px-3 py-2 text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Jobs Button */}
          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/jobs"
              className="rounded-lg bg-saffron-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-600"
            >
              Find My Eligible Jobs
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <label
            htmlFor="mobile-nav-toggle"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-ink-900/15 bg-white lg:hidden"
            aria-label="Open mobile menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="#0B1E33"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </label>
        </div>
      </header>

      {/* Full Screen Mobile Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[9999] invisible opacity-0 transition-opacity duration-200 peer-checked:pointer-events-auto peer-checked:visible peer-checked:opacity-100 lg:hidden">

        {/* Dark Background */}
        <label
          htmlFor="mobile-nav-toggle"
          className="absolute inset-0 block cursor-pointer bg-black/60"
          aria-label="Close mobile menu"
        />

        {/* Mobile Side Drawer */}
        <div
          className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300"
          style={{ height: "100dvh" }}
        >
          {/* Drawer Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-5">
            <div>
              <h2 className="text-xl font-bold text-ink-900">
                Menu
              </h2>
              <p className="text-xs text-gray-500">
                NaukriExpress
              </p>
            </div>

            <label
              htmlFor="mobile-nav-toggle"
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-gray-200 text-xl text-ink-900"
              aria-label="Close menu"
            >
              ✕
            </label>
          </div>

          {/* Scrollable Navigation */}
          <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-700"
                >
                  <span>{item.label}</span>
                  <span className="text-gray-400">›</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Drawer Footer */}
          <div className="shrink-0 border-t border-gray-200 bg-white p-4">
            <Link
              href="/jobs"
              className="block rounded-xl bg-saffron-500 px-4 py-3 text-center text-sm font-bold text-white hover:bg-saffron-600"
            >
              Find My Eligible Jobs
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
