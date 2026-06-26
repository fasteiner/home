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

// Drop the loading overlay (see the inline styles in the page <head>). Reaching
// this point means the bundled stylesheet has been applied, so the page is now
// fully styled; we only briefly wait for web fonts so the first visible frame is
// already laid out in the final typeface, then fade the spinner out.
function revealApp(): void {
  const root = document.documentElement;
  const loader = document.getElementById("app-loader");
  root.classList.add("app-ready");
  if (!loader) {
    root.classList.remove("app-loading");
    return;
  }
  const remove = (): void => {
    loader.remove();
    root.classList.remove("app-loading", "app-ready");
  };
  loader.addEventListener("transitionend", remove, { once: true });
  // Fallback for when the fade is skipped (reduced motion) or transitionend is missed.
  window.setTimeout(remove, 700);
}

const fontsReady: Promise<unknown> =
  "fonts" in document
    ? Promise.race([
        document.fonts.ready,
        new Promise<void>((resolve) => window.setTimeout(resolve, 1500)),
      ])
    : Promise.resolve();

void fontsReady.then(() => requestAnimationFrame(revealApp));
