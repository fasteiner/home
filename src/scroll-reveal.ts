// Reveal-on-scroll: fade content in as it enters the viewport.
// Progressive enhancement — without JS (or with reduced-motion) everything
// stays fully visible, because the `.reveal` class is only added here.

const SELECTOR = [
  ".resume-section > .my-auto > h2",
  ".resume-item",
  ".card",
  ".portfolio-item",
  ".dev-icons",
  ".fa-ul",
  ".list-group",
].join(",");

// Set up the reveal animation. When `animate` is false (e.g. arriving via a
// language switch) we leave everything visible so the translated content is
// already there under the View Transition cross-fade — no second fade-in.
export function initScrollReveal({ animate }: { animate: boolean }): void {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!animate || reduceMotion || !("IntersectionObserver" in window)) return;

  const elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  elements.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  elements.forEach((el) => observer.observe(el));
}
