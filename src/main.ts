// Styles (compiled by Vite via Dart Sass — includes Bootstrap + the theme layer)
import "../scss/resume.scss";

// Bootstrap behaviour: registers the data-API for the collapse navbar and the
// scrollspy used by the sidebar navigation.
import "bootstrap";

// Site scripts
import "./theme-switcher";
import "./resume";
import { initScrollReveal } from "./scroll-reveal";
import "./section-nav";
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
