"use client";

import Link from "next/link";
import { applySiteTheme } from "./siteTheme";

export default function EducationNavLink({ variant = "desktop" }: { variant?: "desktop" | "compact" }) {
  const compact = variant === "compact";
  return (
    <Link
      href="/education"
      aria-label="Education"
      title="Education"
      onClick={() => applySiteTheme("dark")}
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-saffron-600 bg-saffron-500 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-saffron-600 ${compact ? "px-2.5 sm:px-3 lg:hidden" : "px-3"}`}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m2.5 9 9.5-5 9.5 5-9.5 5-9.5-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M6 11v5.2c3.2 2.6 8.8 2.6 12 0V11M21.5 9v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={compact ? "hidden sm:inline" : undefined}>Education</span>
    </Link>
  );
}
