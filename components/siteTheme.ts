export type SiteTheme = "light" | "dark";

export function applySiteTheme(theme: SiteTheme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem("naukriexpress-theme", theme);
  window.dispatchEvent(new CustomEvent<SiteTheme>("naukriexpress-theme-change", { detail: theme }));
}
