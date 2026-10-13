"use client";

import { useEffect, useState } from "react";

type AdmitCardLink = {
  id: number;
  title: string;
  url: string;
};

export default function AdmitCardButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState<AdmitCardLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadLinks() {
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
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/admit-cards", {
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Load failed");
        }

        if (active) {
          setLinks(data.links || []);
          setError("");
        }
      } catch {
        if (active) {
          setError("Admit Card updates abhi load nahi ho rahe.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    setLoading(true);
    void refresh();

    const timer = window.setInterval(() => {
      void refresh();
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      {links.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            void loadLinks();
          }}
          className="fixed bottom-6 right-4 z-40 flex items-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-xl hover:bg-brand-700 active:scale-95 sm:right-6"
        >
          <span>📄 Admit Card Updates</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-extrabold text-brand-700">
            {links.length}
          </span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admit-card-title"
            className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex shrink-0 items-center justify-between border-b pb-3">
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

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain">
              {loading && (
                <p className="text-sm text-gray-500">Loading updates...</p>
              )}

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              {!loading && !error && links.length === 0 && (
                <p className="text-sm text-gray-600">
                  Abhi koi Admit Card update available nahi hai.
                </p>
              )}

              {links.map((item) => (
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
    </>
  );
}
