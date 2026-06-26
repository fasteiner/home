// Section navigation:
//  - Left / Right arrow keys move to the previous / next section.
//  - A floating button scrolls to the next section (and hides on the last one).

const sections = Array.from(document.querySelectorAll<HTMLElement>(".resume-section"));
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function currentIndex(): number {
  // The "current" section is the last one whose top has scrolled past ~30% of
  // the viewport height.
  const threshold = window.innerHeight * 0.3;
  let index = 0;
  sections.forEach((section, i) => {
    if (section.getBoundingClientRect().top <= threshold) index = i;
  });
  return index;
}

function goTo(index: number): void {
  const clamped = Math.max(0, Math.min(index, sections.length - 1));
  sections[clamped]?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "SELECT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
}

if (sections.length > 1) {
  // Left / Right arrow keys (ignored while typing or with modifier keys).
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(currentIndex() + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(currentIndex() - 1);
    }
  });

  // Floating "scroll to next section" button.
  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "section-scroll-btn";
  nextButton.setAttribute("aria-label", "Scroll to next section");
  nextButton.innerHTML = '<i class="fas fa-chevron-down" aria-hidden="true"></i>';
  nextButton.addEventListener("click", () => goTo(currentIndex() + 1));
  document.body.appendChild(nextButton);

  const updateButton = () => {
    nextButton.classList.toggle("is-hidden", currentIndex() >= sections.length - 1);
  };
  updateButton();
  window.addEventListener("scroll", updateButton, { passive: true });
  window.addEventListener("resize", updateButton, { passive: true });
}
