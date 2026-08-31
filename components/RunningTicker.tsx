"use client";

import { useState, useEffect } from "react";

export default function RunningTicker() {
  const [text, setText] = useState("");

  useEffect(() => {
    const current = localStorage.getItem("siteTickerText") || "🔥 Welcome to NaukriExpress - Latest Government Job Updates!";
    setText(current);
  }, []);

  if (!text) return null;

  return (
    <div className="bg-amber-600 text-white py-2 px-4 text-sm font-medium shadow-inner flex items-center overflow-hidden">
      <span className="bg-white text-amber-700 px-2 py-0.5 rounded text-xs font-bold mr-3 uppercase shrink-0">
        Latest Update
      </span>
      <div className="overflow-hidden whitespace-nowrap w-full">
        <div className="inline-block animate-marquee font-medium pl-5">
          {text}
        </div>
      </div>
    </div>
  );
}