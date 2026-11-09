"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type HeaderData = {
  closingToday: number;
  liveJobs: number;
  states: string[];
};

export default function HeaderLiveStats() {
  const [data, setData] = useState<HeaderData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/header-data", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Header stats unavailable");
        return response.json();
      })
      .then((result: HeaderData) => {
        if (
          Number.isFinite(result.liveJobs) &&
          Number.isFinite(result.closingToday)
        ) {
          setData(result);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") {
          // Keep the compact header visible if live statistics cannot load.
        }
      });

    return () => controller.abort();
  }, []);

  const live = data?.liveJobs ?? 38;
  const closing = data?.closingToday ?? 2;

  // One single stats row is reused in the desktop and mobile positions.
  // The descriptive duplicate ticker is intentionally removed.
  return (
    <div className="site-header-live-desktop-inner" aria-label="Live recruitment status">
      <span className="site-header-live-pill">
        <span className="site-header-live-dot" aria-hidden="true" />
        LIVE&nbsp; {live}
      </span>
      <span className="site-header-live-divider" aria-hidden="true">•</span>
      <span className="site-header-closing-pill">Closing&nbsp; {closing}</span>
      <span className="site-header-live-divider" aria-hidden="true">•</span>
      <Link
        href="/sitemap/"
        className="site-header-sitemap-link"
        aria-label="Open complete NaukriExpress HTML sitemap"
      >
        Sitemap
      </Link>
    </div>
  );
}
