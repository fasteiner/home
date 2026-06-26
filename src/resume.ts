import { Collapse } from "bootstrap";

// Smooth scroll for in-page anchor links marked with `.js-scroll-trigger`.
const scrollLinks = document.querySelectorAll<HTMLAnchorElement>(
  'a.js-scroll-trigger[href*="#"]:not([href="#"])',
);

scrollLinks.forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const samePage =
      location.pathname.replace(/^\//, "") === anchor.pathname.replace(/^\//, "") &&
      location.hostname === anchor.hostname;
    if (!samePage) return;

    const target =
      document.querySelector<HTMLElement>(anchor.hash) ??
      document.querySelector<HTMLElement>(`[name=${anchor.hash.slice(1)}]`);

    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Collapse the mobile navbar once a navigation link is clicked.
const triggers = document.querySelectorAll<HTMLElement>(".js-scroll-trigger");

triggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const navbarCollapse = document.querySelector<HTMLElement>(".navbar-collapse");
    if (navbarCollapse?.classList.contains("show")) {
      Collapse.getInstance(navbarCollapse)?.hide();
    }
  });
});
