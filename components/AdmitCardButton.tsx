"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type AdmitCardLink = {
  id: number;
  title: string;
  url: string;
};

export default function AdmitCardButton() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<AdmitCardLink[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredLinks = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return links;
    return links.filter((item) => item.title.toLocaleLowerCase().includes(query));
  }, [links, searchQuery]);

  async function loadLinks(showLoading = false) {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch("/api/admit-cards", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Admit Cards load nahi hue");
      }

      setLinks(data.links || []);
      setError("");
    } catch {
      setError("Admit Card updates abhi load nahi ho rahe.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    // Load once on mount; refresh quietly when the popup opens.
    // Avoid polling the API every 30 seconds from every visitor.
    void loadLinks(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <>
      {links.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setSearchQuery("");
            void loadLinks(false);
          }}
          className="admit-card-floating-button fixed bottom-6 right-4 z-[9998] flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-xl hover:bg-brand-700 active:scale-95 sm:right-6"
        >
          <span className="relative z-10">📄 Admit Card Updates</span>
          <span className="relative z-10 rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-brand-700">
            {links.length}
          </span>
          <span className="admit-card-squirrel-runner" aria-hidden="true">
            <svg className="admit-card-squirrel" viewBox="0 0 100 70" role="presentation" focusable="false">
              <defs>
                <linearGradient id="admit-squirrel-fur" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#F1A34B" />
                  <stop offset="0.58" stopColor="#D8792B" />
                  <stop offset="1" stopColor="#B8541D" />
                </linearGradient>
                <linearGradient id="admit-squirrel-tail-fur" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#F8B65C" />
                  <stop offset="0.55" stopColor="#D9782B" />
                  <stop offset="1" stopColor="#A94B1C" />
                </linearGradient>
              </defs>
              <g className="admit-card-squirrel-body">
                <g className="admit-card-squirrel-tail">
                  <path d="M35 45 C22 53 9 45 8 34 C6 21 15 10 27 11 C38 12 44 21 41 30 C39 37 34 40 28 38 C34 34 33 27 28 24 C22 21 16 27 18 34 C20 41 27 44 35 39 Z" fill="url(#admit-squirrel-tail-fur)" stroke="#7C3B19" strokeWidth="1.7" strokeLinejoin="round"/>
                  <path d="M27 39 C35 34 37 27 31 21 C33 29 27 31 23 32 C23 35 24 37 27 39 Z" fill="#FFE3B5"/>
                  <path d="M13 30 C15 21 22 16 30 18" fill="none" stroke="#FFD18A" strokeWidth="2.1" strokeLinecap="round"/>
                  <path d="M13 36 C15 42 21 45 27 43" fill="none" stroke="#B85B24" strokeWidth="1.3" strokeLinecap="round"/>
                </g>

                <g className="admit-card-squirrel-back-leg-a">
                  <path d="M39 43 C36 47 33 51 29 55 C26 59 31 62 37 59 L48 52 L47 45 Z" fill="#C96824" stroke="#7C3B19" strokeWidth="1.6" strokeLinejoin="round"/>
                  <path d="M29 56 C28 59 33 61 38 58" fill="none" stroke="#FFE0B4" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M31 59 L29 61 M35 59 L34 61" stroke="#7C3B19" strokeWidth="1.1" strokeLinecap="round"/>
                </g>
                <g className="admit-card-squirrel-back-leg-b">
                  <path d="M49 44 C46 48 46 52 42 56 C39 60 45 62 51 59 L59 52 L56 45 Z" fill="#E28A36" stroke="#7C3B19" strokeWidth="1.6" strokeLinejoin="round"/>
                  <path d="M42 56 C41 60 46 61 51 58" fill="none" stroke="#FFE0B4" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M45 60 L43 62 M49 59 L48 61" stroke="#7C3B19" strokeWidth="1.1" strokeLinecap="round"/>
                </g>

                <path d="M31 35 C36 29 47 27 58 31 C66 34 72 40 71 46 C69 51 61 54 50 53 C39 52 31 47 29 42 C29 39 29 37 31 35 Z" fill="url(#admit-squirrel-fur)" stroke="#7C3B19" strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="M42 37 C47 34 54 35 60 39 C64 42 64 46 60 48 C54 50 47 47 43 44 C41 42 40 39 42 37 Z" fill="#FFE8C7"/>
                <path d="M44 36 C49 33 55 34 60 37" fill="none" stroke="#F8C477" strokeWidth="1.5" strokeLinecap="round"/>

                <g className="admit-card-squirrel-front-leg-a">
                  <path d="M55 39 C53 43 49 47 50 51 C51 54 56 53 60 48 L64 42 Z" fill="#E18A35" stroke="#7C3B19" strokeWidth="1.6" strokeLinejoin="round"/>
                  <path d="M50 51 C52 54 56 52 59 49" fill="none" stroke="#FFE8C7" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M52 53 L51 55 M56 51 L55 53" stroke="#7C3B19" strokeWidth="1.1" strokeLinecap="round"/>
                </g>
                <g className="admit-card-squirrel-front-leg-b">
                  <path d="M63 40 C61 44 64 47 63 51 C63 55 69 55 72 50 L69 42 Z" fill="#C96824" stroke="#7C3B19" strokeWidth="1.6" strokeLinejoin="round"/>
                  <path d="M64 51 C66 54 70 53 72 50" fill="none" stroke="#FFE8C7" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M66 53 L65 55 M70 52 L70 54" stroke="#7C3B19" strokeWidth="1.1" strokeLinecap="round"/>
                </g>

                <g className="admit-card-squirrel-head">
                  <path d="M61 26 C59 18 64 11 72 10 C80 9 86 15 88 22 C90 28 86 34 80 36 L71 35 C66 34 62 31 61 26 Z" fill="url(#admit-squirrel-fur)" stroke="#7C3B19" strokeWidth="1.7" strokeLinejoin="round"/>
                  <path d="M64 17 L61 7 C67 8 72 11 73 17 Z" fill="#D9782B" stroke="#7C3B19" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M65 15 L64 10 C67 11 69 13 69 16 Z" fill="#F5B19C"/>
                  <path d="M74 14 L77 7 C82 10 84 14 82 19 Z" fill="#C96824" stroke="#7C3B19" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M77 13 L79 10 C81 12 81 14 80 16 Z" fill="#F5B19C"/>

                  <path d="M73 21 C78 17 84 19 87 24 C89 28 85 33 80 33 C76 33 72 29 71 26 Z" fill="#FFF0D8"/>
                  <ellipse cx="80" cy="28" rx="7.2" ry="5.1" fill="#FFF4E3"/>
                  <circle cx="77.5" cy="21.5" r="4" fill="#FFFFFF"/>
                  <circle cx="78.2" cy="22" r="2.35" fill="#24170F"/>
                  <circle cx="78.9" cy="21.1" r="0.85" fill="#FFFFFF"/>
                  <ellipse cx="87" cy="27.5" rx="2.2" ry="1.7" fill="#40241A"/>
                  <path d="M78 31 Q82 34 85 30" fill="none" stroke="#7C3B19" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M85 23 L91 21 M86 26 L93 26 M85 29 L91 31" fill="none" stroke="#E9C39A" strokeWidth="0.9" strokeLinecap="round"/>
                  <path d="M73 17 Q77 13 82 16" fill="none" stroke="#7C3B19" strokeWidth="1.5" strokeLinecap="round"/>
                </g>
              </g>
            </svg>
          </span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admit-card-title"
            className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex shrink-0 items-center justify-between border-b pb-3">
              <h2
                id="admit-card-title"
                className="text-lg font-bold text-gray-900"
              >
                Latest Admit Cards
              </h2>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Admit Cards"
                className="rounded-lg px-3 py-1 text-xl font-bold text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <label htmlFor="admit-card-search" className="sr-only">
              Search Admit Cards
            </label>
            <div className="relative mb-3 shrink-0">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                🔎
              </span>
              <input
                id="admit-card-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search admit cards..."
                autoComplete="off"
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain">
              {loading && (
                <p className="text-sm text-gray-500">
                  Loading updates...
                </p>
              )}

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {!loading && !error && links.length === 0 && (
                <p className="text-sm text-gray-600">
                  Abhi koi Admit Card update available nahi hai.
                </p>
              )}

              {!loading && !error && links.length > 0 && filteredLinks.length === 0 && (
                <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-600">
                  No Admit Cards Found. Try another title.
                </p>
              )}

              {filteredLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="block break-words rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm font-semibold text-gray-900 hover:bg-amber-100 sm:text-base"
                >
                  👉 {item.title}
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full shrink-0 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-800 hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
