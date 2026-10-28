"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const linksScrollRef = useRef<HTMLDivElement>(null);

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

    // Smooth wheel scrolling for the long Admit Card list; reduced-motion
    // visitors keep their usual browser scrolling behavior.
    const scrollArea = linksScrollRef.current;
    let targetScrollTop = scrollArea?.scrollTop ?? 0;
    let animationFrame: number | null = null;

    function handleWheel(event: WheelEvent) {
      if (!scrollArea || event.ctrlKey || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const maxScrollTop = scrollArea.scrollHeight - scrollArea.clientHeight;
      if (maxScrollTop <= 0 || event.deltaY === 0) return;

      const multiplier =
        event.deltaMode === 1 ? 16 :
        event.deltaMode === 2 ? scrollArea.clientHeight :
        1;
      const delta = event.deltaY * multiplier;

      if (animationFrame === null) {
        targetScrollTop = scrollArea.scrollTop;
      }
      const nextTarget = Math.max(0, Math.min(maxScrollTop, targetScrollTop + delta));
      if (nextTarget === targetScrollTop) return;

      event.preventDefault();
      targetScrollTop = nextTarget;

      if (animationFrame === null) {
        const animateScroll = () => {
          const difference = targetScrollTop - scrollArea.scrollTop;
          if (Math.abs(difference) < 0.6) {
            scrollArea.scrollTop = targetScrollTop;
            animationFrame = null;
            return;
          }
          scrollArea.scrollTop += difference * 0.24;
          animationFrame = window.requestAnimationFrame(animateScroll);
        };
        animationFrame = window.requestAnimationFrame(animateScroll);
      }
    }

    window.addEventListener("keydown", handleEscape);
    scrollArea?.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
      scrollArea?.removeEventListener("wheel", handleWheel);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
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
            <svg className="admit-card-squirrel" viewBox="0 0 100 70" role="presentation">
              <g className="admit-card-squirrel-body">
                <g className="admit-card-squirrel-tail">
                  <path d="M34 43 C17 51 6 43 10 28 C13 13 27 7 38 16 C45 22 42 31 34 36 C30 38 26 34 29 30 C32 27 31 23 27 23 C21 23 19 30 22 35 C24 40 29 41 35 37 Z" fill="#C96A25" stroke="#7D3B18" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M28 36 C36 31 37 25 32 22 C33 28 29 30 25 31 C25 33 26 35 28 36 Z" fill="#F8D7A3"/>
                  <path d="M17 28 C19 20 25 16 31 18" fill="none" stroke="#E99A4B" strokeWidth="2" strokeLinecap="round"/>
                </g>
                <g className="admit-card-squirrel-back-leg-a">
                  <path d="M39 42 C35 46 32 50 30 54 C29 57 35 59 40 55 L46 49 L46 44 Z" fill="#B95B20" stroke="#7D3B18" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M30 54 C29 58 34 59 39 56" fill="none" stroke="#F5D2A0" strokeWidth="1.3" strokeLinecap="round"/>
                </g>
                <g className="admit-card-squirrel-back-leg-b">
                  <path d="M48 43 C45 47 46 51 42 55 C39 58 44 61 49 58 L55 51 L54 44 Z" fill="#D77A2B" stroke="#7D3B18" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M42 55 C41 59 45 60 49 58" fill="none" stroke="#F5D2A0" strokeWidth="1.3" strokeLinecap="round"/>
                </g>
                <path d="M30 36 C36 29 49 28 60 34 C67 37 70 42 68 48 C59 52 45 51 35 47 C31 45 28 41 30 36 Z" fill="#D9782B" stroke="#7D3B18" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M43 38 C49 34 58 37 61 43 C57 48 49 48 44 44 Z" fill="#FFE7C2"/>
                <path d="M61 27 C61 17 68 12 77 16 C85 19 87 28 82 35 C78 41 69 42 64 36 Z" fill="#D9782B" stroke="#7D3B18" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M64 19 L63 9 C69 10 73 14 73 18 Z" fill="#D9782B" stroke="#7D3B18" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M66 16 L66 12 C69 13 70 15 70 17 Z" fill="#F6B6A1"/>
                <path d="M77 19 C83 19 87 25 84 30 C82 35 76 36 71 33 C68 30 70 23 77 19 Z" fill="#FFF0D6"/>
                <ellipse cx="80" cy="29" rx="6.5" ry="4.5" fill="#FFF5E6"/>
                <circle cx="77" cy="23" r="3.7" fill="#FFFFFF"/>
                <circle cx="78" cy="23.5" r="2.1" fill="#24170F"/>
                <circle cx="78.6" cy="22.7" r=".7" fill="#FFFFFF"/>
                <ellipse cx="86" cy="29" rx="2" ry="1.6" fill="#40241A"/>
                <path d="M73 18 Q77 14 81 17" fill="none" stroke="#7D3B18" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M73 34 Q77 38 81 34" fill="none" stroke="#7D3B18" strokeWidth="1.2" strokeLinecap="round"/>
                <g className="admit-card-squirrel-front-leg-a">
                  <path d="M57 39 C55 43 51 47 52 51 C54 54 58 51 61 47 L65 42 Z" fill="#D9782B" stroke="#7D3B18" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M52 51 Q55 53 59 49" fill="none" stroke="#FFE0B5" strokeWidth="1.3" strokeLinecap="round"/>
                </g>
                <g className="admit-card-squirrel-front-leg-b">
                  <path d="M63 40 C62 44 65 47 65 50 C65 54 70 54 72 50 L69 43 Z" fill="#C96A25" stroke="#7D3B18" strokeWidth="1.4" strokeLinejoin="round"/>
                  <path d="M65 50 Q68 53 71 50" fill="none" stroke="#FFE0B5" strokeWidth="1.3" strokeLinecap="round"/>
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

            <div ref={linksScrollRef} className="admit-card-links-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain">
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
