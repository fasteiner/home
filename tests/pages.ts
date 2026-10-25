// The pages under test and small helpers shared by the specs.
import type { Page } from "@playwright/test";

export const SITE_URL = "https://fabian.stei-ner.net";

export interface TestPage {
  path: string;
  lang: "en" | "de";
  key: "home" | "imprint" | "privacy" | "cv" | "notFound";
}

export const PAGES: TestPage[] = [
  { path: "/en/", lang: "en", key: "home" },
  { path: "/de/", lang: "de", key: "home" },
  { path: "/en/imprint/", lang: "en", key: "imprint" },
  { path: "/de/impressum/", lang: "de", key: "imprint" },
  { path: "/en/privacy/", lang: "en", key: "privacy" },
  { path: "/de/datenschutz/", lang: "de", key: "privacy" },
  { path: "/en/cv/", lang: "en", key: "cv" },
  { path: "/de/lebenslauf/", lang: "de", key: "cv" },
  { path: "/404.html", lang: "de", key: "notFound" },
];

export const HOME_PAGES = PAGES.filter((p) => p.key === "home");

// Scroll through the whole page so lazy images load and reveal animations run.
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}

// The navigation sits in a collapsed menu on phones; open it when needed.
export async function openMenuIfCollapsed(page: Page): Promise<void> {
  const toggler = page.locator(".navbar-toggler");
  if (await toggler.isVisible()) {
    if ((await toggler.getAttribute("aria-expanded")) !== "true") await toggler.click();
    await page.locator("#navbarSupportedContent.show").waitFor();
  }
}
