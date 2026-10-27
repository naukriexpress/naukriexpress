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
          <span className="admit-card-plane-orbit" aria-hidden="true">
            <span className="admit-card-plane-trail" />
            <svg className="admit-card-plane" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16z" />
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
