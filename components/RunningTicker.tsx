"use client";

import { useState, useEffect } from "react";

interface TickerItem {
  id: string;
  text: string;
  link?: string;
  active: boolean;
  sortOrder: number;
}

// Fetches active tickers from the database (via /api/tickers) on every page
// load. This is intentionally NOT read from localStorage/sessionStorage —
// that was the previous bug: a ticker saved from the Admin Panel on one
// device would only ever be visible on that same browser, since it never
// reached the server. Now every device loads the same live data from
// Postgres, so an update from Admin Panel shows up everywhere on refresh.
export default function RunningTicker() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadTickers() {
      try {
        const res = await fetch("/api/tickers", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const list: TickerItem[] = json.data || [];
        if (!cancelled) {
          setTickers(list.filter((t) => t.active));
        }
      } catch (err) {
        // Fail silently — the ticker is a non-critical banner, the rest of
        // the site should keep working even if this fetch fails.
        console.error("Failed to load ticker", err);
      }
    }

    loadTickers();
  }, []);

  if (tickers.length === 0) return null;

  const combinedText = tickers.map((t) => t.text).join("   •   ");

  return (
    <div className="bg-amber-600 text-white py-2 px-4 text-sm font-medium shadow-inner flex items-center overflow-hidden">
      <span className="bg-white text-amber-700 px-2 py-0.5 rounded text-xs font-bold mr-3 uppercase shrink-0">
        Latest Update
      </span>
      <div className="overflow-hidden whitespace-nowrap w-full">
        <div className="inline-block animate-marquee font-medium pl-5">
          {combinedText}
        </div>
      </div>
    </div>
  );
}
