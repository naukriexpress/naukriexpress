"use client";

import { useEffect, useState } from "react";

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

  if (!data) {
    return <span className="font-medium">Latest government &amp; private job updates</span>;
  }

  return (
    <>
      <span>{data.liveJobs} open recruitments tracked</span>
      <span className="opacity-40">•</span>
      <span className="font-medium text-leaf-400">
        {data.closingToday} closing today — apply now
      </span>
    </>
  );
}
