export type SiteTheme = "light" | "dark";

function notifyThemeChange(theme: SiteTheme) {
  window.dispatchEvent(new CustomEvent<SiteTheme>("naukriexpress-theme-change", { detail: theme }));
}

export function applySiteTheme(theme: SiteTheme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem("naukriexpress-theme", theme);
  notifyThemeChange(theme);
}

/** Force dark appearance for Education without overwriting the user's site-wide preference. */
export function applyEducationDarkMode() {
  document.documentElement.dataset.theme = "dark";
  notifyThemeChange("dark");
}
