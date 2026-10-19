
"use client";

import { useEffect, useState } from "react";

const DEFAULT_TEXT =
  "🔥 Welcome to NaukriExpress - Latest Government Job Updates!";

export default function RunningTicker() {
  const [text, setText] = useState(DEFAULT_TEXT);

  useEffect(() => {
    let active = true;

    async function loadTicker() {
      try {
        const response = await fetch("/api/ticker", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (active && typeof data.text === "string") {
          setText(data.text);
        }
      } catch (error) {
        console.error("Unable to load ticker:", error);
      }
    }

    loadTicker();

    // Update ticker every 30 seconds.
    const interval = setInterval(loadTicker, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (!text) return null;

  return (
    <div className="site-update-ticker flex items-center overflow-hidden px-4 py-2 text-sm font-medium shadow-sm">
      <span className="site-update-label mr-3 shrink-0 rounded-md border bg-white px-2 py-0.5 text-xs font-bold uppercase">
        Latest Update
      </span>

      <div className="w-full overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee pl-5 font-medium">
          {text}
        </div>
      </div>
    </div>
  );
}
