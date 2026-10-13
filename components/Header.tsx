```tsx
import Link from "next/link";
import { queryJobs } from "@/lib/db";
import AdmitCardButton from "./AdmitCardButton";

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
  const [{ total: closingToday }, { total: liveJobs }] = await Promise.all([
    queryJobs({ lastDate: "today", pageSize: 1 }),
    queryJobs({ pageSize: 1 }),
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

      <div className="container-page flex items-center justify-between py-3">
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map((l) => {
            if (l.label === "Admit Card") {
              return <AdmitCardButton key={l.label} />;
            }

            return (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-md px-3 py-2 text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
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

        {/* Mobile Menu Toggle */}
        <input
          type="checkbox"
          id="mobile-nav-toggle"
          className="peer sr-only"
        />

        <label
          htmlFor="mobile-nav-toggle"
          className="lg:hidden grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-ink-900/15 cursor-pointer"
          aria-label="Open menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="#0B1E33"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </label>

        {/* Mobile Menu Overlay */}
        <div className="fixed inset-0 z-[100] hidden peer-checked:block lg:hidden">
          <label
            htmlFor="mobile-nav-toggle"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
          />

          <div className="absolute right-0 top-0 flex h-full h-[100dvh] w-[min(88vw,360px)] flex-col overflow-hidden bg-white shadow-2xl">
            {/* Menu Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-ink-900/10 px-5 py-4">
              <span className="font-display text-lg font-bold text-ink-900">
                NaukriExpress Menu
              </span>

              <label
                htmlFor="mobile-nav-toggle"
                className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border border-ink-900/15 text-xl text-ink-900"
                aria-label="Close menu"
              >
                ✕
              </label>
            </div>

            {/* Scrollable Menu Links */}
            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              {NAV_LINKS.map((l) => {
                if (l.label === "Admit Card") {
                  return (
                    <div key={l.label} className="mb-1">
                      <AdmitCardButton />
                    </div>
                  );
                }

                return (
                  <Link
                    key={l.label}
                    href={l.href}
                    onClick={() => {
                      const checkbox = document.getElementById(
                        "mobile-nav-toggle"
                      ) as HTMLInputElement | null;

                      if (checkbox) checkbox.checked = false;
                    }}
                    className="mb-1 block w-full rounded-lg px-4 py-3 text-base font-medium text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-700"
                  >
                    {l.label}
                  </Link>
                );
              })}

              <Link
                href="/jobs"
                onClick={() => {
                  const checkbox = document.getElementById(
                    "mobile-nav-toggle"
                  ) as HTMLInputElement | null;

                  if (checkbox) checkbox.checked = false;
                }}
                className="mt-3 mb-4 block w-full rounded-lg bg-saffron-500 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Find My Eligible Jobs
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
```
