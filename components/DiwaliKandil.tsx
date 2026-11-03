"use client";

import { useEffect, useState } from "react";

const START_DATE = "2026-11-06";
const END_DATE = "2026-11-11";

function indiaDateString(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return year + "-" + month + "-" + day;
}

export default function DiwaliKandil() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const today = indiaDateString();
      setVisible(today >= START_DATE && today <= END_DATE);
    };
    updateVisibility();
    const refresh = window.setInterval(updateVisibility, 30 * 60 * 1000);
    return () => window.clearInterval(refresh);
  }, []);

  if (!visible) return null;

  return (
    <span className="diwali-kandil" aria-hidden="true">
      <svg viewBox="0 0 24 32" fill="none">
        <path d="M12 1.5v4" stroke="#A66A31" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M8 5.5h8" stroke="#A66A31" strokeWidth="1.4" strokeLinecap="round" />
        <path d="m7 7 5-1.5L17 7l-1 3H8L7 7Z" fill="#D9A54C" stroke="#A66A31" strokeWidth="1" />
        <path d="M7 10h10l2 9-7 8-7-8 2-9Z" fill="#E76F35" stroke="#A84E2B" strokeWidth="1.1" />
        <path d="M9 12h6l1.2 6-4.2 5-4.2-5L9 12Z" fill="#FFD36C" />
        <path d="M12 13.5c-1.8 2-1.8 3.8 0 5.2 1.8-1.4 1.8-3.2 0-5.2Z" fill="#FFF7C7" />
        <path d="m4.7 18.5 2-1M17.3 17.5l2 1" stroke="#D9A54C" strokeWidth="1" strokeLinecap="round" />
        <path d="M12 27v2.5" stroke="#A66A31" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M9 30h6" stroke="#A66A31" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}
