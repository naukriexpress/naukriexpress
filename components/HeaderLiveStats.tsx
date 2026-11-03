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
          // Keep the static header shell visible if statistics cannot load.
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      <span className="site-header-live-open">{data ? `${data.liveJobs} open recruitments tracked` : "Open recruitments loading…"}</span>
      <span className="site-header-live-separator">•</span>
      <span className="site-header-closing-today">
        {data ? `${data.closingToday} closing today — apply now` : "Closing today updates"}
      </span>
      <span className="site-header-live-separator">•</span>
      <Link href="/sitemap/" className="site-header-sitemap-link" aria-label="Open complete NaukriExpress HTML sitemap">
        Sitemap
      </Link>
    </>
  );
}
