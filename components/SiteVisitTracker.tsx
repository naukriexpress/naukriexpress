"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "naukriexpress-visitor-counted";

// These informational pages are static GitHub-backed pages and do not need
// the background database visitor-count request.
const STATIC_INFO_PATHS = new Set([
  "/about",
  "/privacy-policy",
  "/disclaimer",
  "/terms",
  "/contact",
]);

export default function SiteVisitTracker() {
  const pathname = usePathname();
  const requestStarted = useRef(false);

  useEffect(() => {
    const normalizedPath = pathname?.replace(/\/+$/, "") || "/";
    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      STATIC_INFO_PATHS.has(normalizedPath) ||
      requestStarted.current
    ) return;

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
