
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";

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

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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
        className="lg:hidden grid h-10 w-10 place-items-center rounded-lg border border-ink-900/15 bg-white"
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
      </button>

      {mounted && open && createPortal(
        <div
          className="fixed inset-0 z-[9999] lg:hidden"
          role="presentation"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/60"
            aria-label="Close navigation menu"
          />

          <div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl"
            style={{ height: "100dvh" }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-5">
              <div>
                <h2 className="text-xl font-bold text-ink-900">
                  Menu
                </h2>
                <p className="text-xs text-gray-500">
                  NaukriExpress
                </p>
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

            <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((item) => (
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
              <Link
                href="/jobs"
                onClick={() => setOpen(false)}
                className="block rounded-xl bg-saffron-500 px-4 py-3 text-center text-sm font-bold text-white hover:bg-saffron-600"
              >
                Find My Eligible Jobs
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
