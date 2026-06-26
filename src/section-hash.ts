// Keep the URL hash in sync with the section currently in view, so the address
// bar always reflects (and lets you share) where the visitor is as they scroll.
//
// Rather than run a second scroll observer, we piggyback on Bootstrap's
// scrollspy — which already tracks the active section and highlights its nav
// link. On each activation we rewrite the hash with history.replaceState (not
// pushState), so scrolling updates the address bar without flooding the
// back/forward history.

// The scrollspy element (carries data-bs-spy="scroll").
const spy = document.body;

// Section nav links, in document order. The first one is the top ("about")
// section; while it's active we keep the URL clean instead of showing #about.
const navLinks = Array.from(
  document.querySelectorAll<HTMLAnchorElement>("#sideNav .nav-link[href^='#']"),
);
const topHash = navLinks[0]?.hash ?? "";

if (navLinks.length) {
  spy.addEventListener("activate.bs.scrollspy", (event) => {
    const link = (event as Event & { relatedTarget?: EventTarget | null }).relatedTarget;
    if (!(link instanceof HTMLAnchorElement)) return;

    // Drop the hash at the top section; otherwise reflect the active section.
    const nextHash = link.hash && link.hash !== topHash ? link.hash : "";
    if (nextHash === location.hash) return;

    const url = nextHash || location.pathname + location.search;
    history.replaceState(history.state, "", url);
  });
}
