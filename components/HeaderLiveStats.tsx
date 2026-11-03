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
      <span>{data ? `${data.liveJobs} open recruitments tracked` : "Open recruitments loading…"}</span>
      <span className="opacity-40">•</span>
      <span className="font-medium text-sky-300">
        {data ? `${data.closingToday} closing today — apply now` : "Closing today updates"}
      </span>
      <span className="opacity-40">•</span>
      <Link href="/sitemap_index.xml" className="font-semibold text-white underline-offset-2 transition-colors hover:text-sky-200 hover:underline" aria-label="Open NaukriExpress XML sitemap">
        Sitemap
      </Link>
    </>
  );
}
