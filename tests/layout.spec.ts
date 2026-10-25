// Layout & performance: no sideways scrolling, the call to action on the first
// screen, side padding in the mobile navbar, a stable layout while the web
// fonts load, and a page-weight budget.
import { expect, test } from "@playwright/test";
import { HOME_PAGES, PAGES, openMenuIfCollapsed } from "./pages";

for (const { path } of PAGES) {
  test(`${path} does not scroll sideways`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

for (const { path } of HOME_PAGES) {
  test(`${path} shows name, tagline and call to action on the first screen`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("#about h1")).toBeInViewport({ ratio: 1 });
    await expect(page.locator("#about .hero-tagline")).toBeInViewport({ ratio: 1 });
    await expect(page.locator("#about .btn-primary")).toBeInViewport({ ratio: 1 });
  });
}

test("the mobile navbar keeps its distance from the screen edges", async ({ page, isMobile }) => {
  test.skip(!isMobile, "On desktop the navigation is the sidebar");
  await page.goto("/de/");
  await openMenuIfCollapsed(page);
  const width = page.viewportSize()!.width;
  const boxes = await page
    .locator(
      "#sideNav .navbar-brand, #sideNav .navbar-toggler, #sideNav .nav-link, #theme-select, .lang-switch",
    )
    .evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { el: el.className, left: r.left, right: r.right };
      }),
    );
  const touching = boxes.filter((b) => b.left < 12 || b.right > width - 12);
  expect(touching).toEqual([]);
});

test("phones do not download the sidebar photo", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The photo is shown in the desktop sidebar");
  const photos: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("fabian_steiner")) photos.push(req.url());
  });
  await page.goto("/en/", { waitUntil: "networkidle" });
  expect(photos).toEqual([]);
});

for (const { path } of HOME_PAGES) {
  test(`${path} barely shifts while the web fonts load`, async ({ page }) => {
    // Hold the fonts back so the page first renders with the fallback fonts.
    await page.route("**/*.woff2", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const shift = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          // Layout-shift entries (not in the DOM typings yet).
          type LayoutShift = { value: number; hadRecentInput: boolean };
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as unknown as LayoutShift[]) {
              if (!entry.hadRecentInput) total += entry.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(total), 500);
        }),
    );
    expect(shift).toBeLessThan(0.1);
  });
}

test("the home page stays within its weight budget", async ({ page, isMobile }) => {
  test.skip(isMobile, "Measured once, on desktop");
  await page.goto("/en/", { waitUntil: "networkidle" });
  const kilobytes = await page.evaluate(() => {
    const entries = [
      ...performance.getEntriesByType("navigation"),
      ...performance.getEntriesByType("resource"),
    ] as PerformanceResourceTiming[];
    return Math.round(entries.reduce((sum, e) => sum + e.encodedBodySize, 0) / 1024);
  });
  // Initial load (HTML, CSS, JS, fonts, above-the-fold images) as transferred,
  // i.e. compressed by the server. About 125 KB today; was 750 KB before #21.
  expect(kilobytes).toBeLessThan(200);
});
