import { Suspense } from "react";
import Link from "next/link";
import AdmitCardButton from "./AdmitCardButton";
import HeroSearch from "./HeroSearch";
import HeaderLiveStats from "./HeaderLiveStats";
import MobileNav from "./MobileNav";
import ThemeToggle from "./ThemeToggle";
import EducationNavLink from "./EducationNavLink";
import AnnouncementChatWidget from "./AnnouncementChatWidget";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Latest Jobs" },
  { href: "/jobs?jobType=government", label: "Government Jobs" },
  { href: "/jobs?state=Maharashtra", label: "Maharashtra Jobs" },
  { href: "/apprentice", label: "Apprentice" },
  { href: "/admit-card", label: "Admit Card" },
  { href: "/results", label: "Results" },
  { href: "/answer-key", label: "Answer Key" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/scholarship", label: "Scholarship" },
  { href: "/contact", label: "Contact Us" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/10 bg-white/95 backdrop-blur">
      <div className="bg-ink-900 text-xs text-white sm:text-sm">
        <div className="container-page flex items-center gap-2 overflow-x-auto whitespace-nowrap py-1.5">
          <span className="inline-flex items-center gap-1 font-semibold text-saffron-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-saffron-400" aria-hidden="true" />
            LIVE
          </span>
          <HeaderLiveStats />
        </div>
      </div>

      <div className="container-page flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex min-w-0 shrink items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl2 bg-brand-700 font-display text-lg font-bold text-white">BGi</span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="font-display text-lg font-bold text-ink-900">NaukriExpress</span>
            <span className="text-[11px] font-medium tracking-wide text-brand-600">सरकारी नोकरी अपडेट • India</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 lg:block lg:max-w-lg lg:px-3">
          <HeroSearch />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle compact />
          </div>
          <AnnouncementChatWidget />
          <div className="hidden items-center gap-2 lg:flex">
            <EducationNavLink variant="desktop" />
            <Link
              href="/jobs"
              className="hidden rounded-lg bg-saffron-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-saffron-600 2xl:inline-flex"
            >
              Find My Eligible Jobs
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 2xl:hidden">
            <EducationNavLink variant="compact" />
            <Suspense fallback={<div className="h-10 w-10 rounded-lg border border-ink-900/15 bg-white" aria-hidden="true" />}>
              <MobileNav states={[]} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="container-page pb-3 lg:hidden">
        <HeroSearch />
      </div>

      <div className="hidden border-t border-ink-900/10 2xl:block">
        <nav aria-label="Main navigation" className="container-page flex items-center justify-center gap-1 text-sm font-medium">
          {NAV_LINKS.map((item) =>
            item.label === "Admit Card" ? (
              <AdmitCardButton key={item.label} />
            ) : (
              <Link key={item.label} href={item.href} className="rounded-md px-3 py-2 text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700">
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
