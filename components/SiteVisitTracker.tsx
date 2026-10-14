"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "naukriexpress-visitor-counted";

export default function SiteVisitTracker() {
  const pathname = usePathname();
  const requestStarted = useRef(false);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || requestStarted.current) return;

    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // Continue without session storage; the ref prevents duplicate requests.
    }

    requestStarted.current = true;
    void fetch("/api/visitor-count", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then((response) => {
        if (response.ok) {
          try {
            window.sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            // The visit is already recorded even if storage is unavailable.
          }
          return;
        }
        requestStarted.current = false;
      })
      .catch(() => {
        requestStarted.current = false;
      });
  }, [pathname]);

  return null;
}
