"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem("naukriexpress-theme", theme);
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("naukriexpress-theme");
    const initialTheme: Theme = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  const nextLabel = theme === "dark" ? "light mode" : "dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={"Switch to " + nextLabel}
      title={"Switch to " + nextLabel}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-ink-900/15 bg-white px-3 py-2 text-sm font-semibold text-ink-800 transition-colors hover:bg-brand-50"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {theme === "dark" ? (
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        ) : (
          <path
            d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8a8.5 8.5 0 1 0 11.4 11.4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
