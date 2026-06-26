// Make the EN/DE language switch feel seamless.
//
// The two languages are separate prerendered pages (/en/ and /de/), so the
// switch is a real navigation. Two things make it smooth:
//
//   1. Cross-document View Transitions (enabled in _scroll.scss) cross-fade the
//      old and new page instead of flashing a white reload.
//   2. The switch links carry the current section as a URL hash (e.g.
//      /de/#projects), so the visitor lands on the same section.
//
// IMPORTANT: the section hash is applied to the href only on click — never at
// load time. The toggle lives inside the scrollspy nav (#sideNav); if its href
// held an in-page fragment (#projects) at startup, Bootstrap scrollspy would
// adopt it as a scroll target and hijack its `active` class, breaking the
// prerendered language highlight. Setting it at click time keeps the toggle out
// of scrollspy entirely.
//
// A one-shot sessionStorage flag also tells the destination page to skip the
// reveal-on-scroll animation, so the translated text is simply *there* once the
// fade finishes instead of fading in a second time. See consumeLangSwitch().

const LANG_SWITCH_FLAG = "lang-switch";

const langLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".lang-option"));

if (langLinks.length) {
  // Remember each link's bare destination ("/en/" or "/de/").
  for (const link of langLinks) {
    link.dataset.langBase = link.getAttribute("href") ?? "";
  }

  const sections = () => Array.from(document.querySelectorAll<HTMLElement>(".resume-section"));

  // The "current" section is the last one whose top has scrolled above ~30% of
  // the viewport — the same rule the sidebar scrollspy uses to highlight a link.
  function currentSectionId(): string | null {
    const threshold = window.innerHeight * 0.3;
    let id: string | null = null;
    for (const section of sections()) {
      if (section.getBoundingClientRect().top <= threshold) id = section.id;
    }
    return id;
  }

  for (const link of langLinks) {
    link.addEventListener("click", () => {
      // Carry the current section across so the visitor lands on the same place.
      // The browser navigates using this freshly-set href (modifier/middle clicks
      // keep working); the destination page re-renders with a bare href.
      const base = link.dataset.langBase ?? "";
      const id = currentSectionId();
      link.setAttribute("href", id ? `${base}#${id}` : base);

      // Flag the next load as a language switch (so it can skip the reveal
      // animation). Clicking the already-active language is just an in-page jump.
      if (link.classList.contains("active")) return;
      try {
        sessionStorage.setItem(LANG_SWITCH_FLAG, "1");
      } catch {
        // sessionStorage unavailable (private mode) — falls back to a plain reload.
      }
    });
  }
}

// True if this page load was reached via the language switch (one-shot read).
// Used by main.ts to skip the reveal-on-scroll animation so the freshly
// translated text appears instantly under the View Transition cross-fade.
export function consumeLangSwitch(): boolean {
  try {
    if (sessionStorage.getItem(LANG_SWITCH_FLAG) === "1") {
      sessionStorage.removeItem(LANG_SWITCH_FLAG);
      return true;
    }
  } catch {
    // Ignore — treat as a normal load.
  }
  return false;
}
