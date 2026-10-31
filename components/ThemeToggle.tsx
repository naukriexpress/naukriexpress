"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { applySiteTheme } from "./siteTheme";

type Theme = "light" | "dark";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");
  const pathname = usePathname();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolveTheme = (): Theme => {
      if (pathname === "/education") return "dark";
      const savedTheme = window.localStorage.getItem("naukriexpress-theme");
      if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
      return mediaQuery.matches ? "dark" : "light";
    };

    const initialTheme = resolveTheme();
    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);

    const handleSystemThemeChange = () => {
      // Education always opens dark; other pages follow the saved preference or device theme.
      if (pathname === "/education") return;
      // Follow the phone/computer theme until the visitor manually chooses a theme.
      const savedTheme = window.localStorage.getItem("naukriexpress-theme");
      if (savedTheme === "dark" || savedTheme === "light") return;

      const nextTheme: Theme = mediaQuery.matches ? "dark" : "light";
      document.documentElement.dataset.theme = nextTheme;
      setTheme(nextTheme);
    };

    const handleExternalThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (nextTheme === "dark" || nextTheme === "light") setTheme(nextTheme);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("naukriexpress-theme-change", handleExternalThemeChange);
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("naukriexpress-theme-change", handleExternalThemeChange);
    };
  }, [pathname]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applySiteTheme(nextTheme);
    setTheme(nextTheme);
  }

  const nextLabel = theme === "dark" ? "light mode" : "dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={"Switch to " + nextLabel}
      title={"Switch to " + nextLabel}
      data-action={theme === "dark" ? "light" : "dark"}
      className={`theme-toggle-button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-ink-900/15 bg-white px-3 py-2 text-sm font-semibold text-ink-800 transition-colors hover:bg-brand-50 ${compact ? "theme-toggle-button--compact" : ""}`}
    >
      <span className="theme-toggle-icon-shell" aria-hidden="true">
        {theme === "dark" ? (
          <svg className="theme-toggle-icon theme-toggle-icon--sun" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.4" />
            <g stroke="#FACC15" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 2v2.1M12 19.9V22M4.93 4.93l1.5 1.5M17.57 17.57l1.5 1.5M2 12h2.1M19.9 12H22M4.93 19.07l1.5-1.5M17.57 6.43l1.5-1.5" />
            </g>
          </svg>
        ) : (
          <svg className="theme-toggle-icon theme-toggle-icon--moon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8.7" fill="#E7F0FF" stroke="#3B82F6" strokeWidth="1.3" />
            <circle cx="9" cy="8.5" r="1.15" fill="#B9D0F8" />
            <circle cx="15.1" cy="11.2" r="1.6" fill="#B9D0F8" />
            <circle cx="10.3" cy="15.1" r="1.35" fill="#B9D0F8" />
          </svg>
        )}
      </span>
      <span className={compact ? "sr-only" : undefined}>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
