// Styles (compiled by Vite via Dart Sass — includes Bootstrap + the theme layer)
import "../scss/resume.scss";

// Self-hosted fonts — bundled locally by Vite, so no third-party CDN (Google
// Fonts) is contacted. Latin subset, only the weights the theme uses: Mulish
// 400/800 (+ italics), Saira Extra Condensed 500/700.
import "@fontsource/mulish/latin-400.css";
import "@fontsource/mulish/latin-400-italic.css";
import "@fontsource/mulish/latin-800.css";
import "@fontsource/mulish/latin-800-italic.css";
import "@fontsource/saira-extra-condensed/latin-500.css";
import "@fontsource/saira-extra-condensed/latin-700.css";

// Bootstrap behaviour: only the two plugins the site uses register their
// data-API — Collapse for the mobile navbar, ScrollSpy for the sidebar.
// (Icons are inline SVG rendered at build time, see src/icons.ts.)
import "bootstrap/js/dist/collapse";
import "bootstrap/js/dist/scrollspy";

// Site scripts
import "./theme-switcher";
import "./resume";
import { initScrollReveal } from "./scroll-reveal";
import "./section-nav";
import "./section-hash";
import { consumeLangSwitch } from "./lang-switch";

// Skip the reveal-on-scroll animation when we arrived via the language switch,
// so the translated text appears instantly under the View Transition cross-fade
// instead of fading in again. (./lang-switch wires up the switch links and the
// per-section URL hash.)
initScrollReveal({ animate: !consumeLangSwitch() });

// Remember the current language (from <html lang>) so the root redirect can
// honour the visitor's last choice on their next visit.
const lang = document.documentElement.lang;
if (lang === "en" || lang === "de") {
  try {
    localStorage.setItem("lang", lang);
  } catch {
    // localStorage may be unavailable (private mode) — safe to ignore.
  }
}

// Dev server only: drop the loading overlay (see DEV_LOADER in src/page.ts).
// Reaching this point means the injected stylesheet has been applied.
if (import.meta.env.DEV) {
  document.getElementById("app-loader")?.remove();
  document.documentElement.classList.remove("app-loading");
}
