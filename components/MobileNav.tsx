"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import AdmitCardButton from "./AdmitCardButton";
import ThemeToggle from "./ThemeToggle";
import HeroSearch from "./HeroSearch";
import EligibilityFinder from "./EligibilityFinder";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Latest Jobs" },
  { href: "/jobs?jobType=government", label: "Government Jobs" },
  { href: "/jobs?state=Maharashtra", label: "Maharashtra Jobs" },
  { href: "/apprentice", label: "Apprentice" },
  { href: "/results", label: "Results" },
  { href: "/answer-key", label: "Answer Key" },
  { href: "/syllabus", label: "Syllabus" },
  { href: "/scholarship", label: "Scholarship" },
  { href: "/contact", label: "Contact Us" },
];

export default function MobileNav({ states }: { states: string[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [availableStates, setAvailableStates] = useState(states);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.toString();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, currentQuery]);

  useEffect(() => {
    if (!open || availableStates.length > 0) return;

    const controller = new AbortController();
    fetch("/api/header-data", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("States unavailable");
        return response.json();
      })
      .then((data: { states?: string[] }) => {
        if (Array.isArray(data.states)) setAvailableStates(data.states);
      })
      .catch(() => {
        // Keep menu usable even if location options cannot be loaded.
      });

    return () => controller.abort();
  }, [open, availableStates.length]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-saffron-500 bg-saffron-500 px-3 text-white shadow-sm transition-colors hover:bg-saffron-600 2xl:hidden"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="hidden text-sm font-semibold sm:inline">Click here</span>
      </button>

      {mounted &&
        open &&
        createPortal(
          <div className="fixed inset-0 z-[9999] 2xl:hidden">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mobile-menu-backdrop absolute inset-0 h-full w-full bg-black/60"
              aria-label="Close navigation menu"
            />
            <div
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className="mobile-menu-panel absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl"
              style={{ height: "100dvh" }}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-5">
                <div>
                  <h2 className="text-xl font-bold text-ink-900">Menu</h2>
                  <p className="text-xs text-gray-500">NaukriExpress</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 text-xl text-ink-900"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <div className="px-4 pt-4 lg:hidden">
                <HeroSearch />
              </div>

              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                <div className="flex flex-col gap-1">
                  {NAV_LINKS.slice(0, 4).map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      <span>{item.label}</span>
                      <span className="text-gray-400">›</span>
                    </Link>
                  ))}
                  <div className="rounded-xl px-4 py-3">
                    <AdmitCardButton />
                  </div>
                  {NAV_LINKS.slice(4).map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      <span>{item.label}</span>
                      <span className="text-gray-400">›</span>
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="shrink-0 border-t border-gray-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="mb-3">
                  <ThemeToggle />
                </div>
                <div className="mt-3">
                  <EligibilityFinder states={availableStates} variant="menu" />
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
