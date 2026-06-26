// Theme switcher: toggles between light, dark and system using Bootstrap 5.3's
// native colour modes (`data-bs-theme` on the <html> element).

type ThemePreference = "system" | "light" | "dark";

const THEME_KEY = "theme-preference";
const root = document.documentElement;
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref === "light" || pref === "dark") return pref;
  return darkQuery.matches ? "dark" : "light";
}

function applyTheme(pref: ThemePreference): void {
  root.setAttribute("data-bs-theme", resolveTheme(pref));
}

function getStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function setPreference(pref: ThemePreference): void {
  localStorage.setItem(THEME_KEY, pref);
  applyTheme(pref);
}

// Apply immediately (an inline boot script in index.html already set the initial
// attribute to avoid a flash of the wrong theme; this keeps things in sync).
applyTheme(getStoredPreference());

// Follow OS-level changes while "system" is selected.
darkQuery.addEventListener("change", () => {
  if (getStoredPreference() === "system") applyTheme("system");
});

// Wire up the <select> control.
function initControl(): void {
  const select = document.getElementById("theme-select") as HTMLSelectElement | null;
  if (!select) return;
  select.value = getStoredPreference();
  select.addEventListener("change", () => setPreference(select.value as ThemePreference));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initControl);
} else {
  initControl();
}
