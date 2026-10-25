// Integrity: pages load cleanly, never contact a third party, show every image
// and icon, and every internal link or download resolves.
import { expect, test } from "@playwright/test";
import { PAGES, scrollThrough } from "./pages";

const ALL_PATHS = [...PAGES.map((p) => p.path), "/", "/projects/sgreening/"];

for (const path of ALL_PATHS) {
  test(`${path} loads without errors or third-party requests`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL!).origin;
    const problems: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") problems.push(`console: ${msg.text()}`);
    });
    page.on("pageerror", (error) => problems.push(`page error: ${error.message}`));
    page.on("requestfailed", (req) => problems.push(`failed: ${req.url()}`));
    page.on("response", (res) => {
      if (res.status() >= 400) problems.push(`${res.status()}: ${res.url()}`);
    });
    page.on("request", (req) => {
      const url = new URL(req.url());
      if (/^https?:$/.test(url.protocol) && url.origin !== origin) {
        problems.push(`third-party request: ${req.url()}`);
      }
    });

    await page.goto(path, { waitUntil: "networkidle" });
    await scrollThrough(page);
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });
}

for (const { path } of PAGES) {
  test(`${path} shows every image and icon`, async ({ page }) => {
    await page.goto(path);
    await scrollThrough(page);
    await page.waitForLoadState("networkidle");

    const images = await page.locator("main img, #sideNav img").evaluateAll((imgs) =>
      (imgs as HTMLImageElement[])
        // Hidden images (the sidebar photo on phones) are lazy and never load.
        .filter((img) => img.getClientRects().length > 0)
        .map((img) => ({
          src: img.getAttribute("src"),
          loaded: img.complete && img.naturalWidth > 0,
          sized: img.hasAttribute("width") && img.hasAttribute("height"),
        })),
    );
    expect(images.filter((i) => !i.loaded || !i.sized)).toEqual([]);

    // Every inline icon points at a symbol of the page's sprite that has a path.
    const brokenIcons = await page.locator("svg.icon").evaluateAll((icons) =>
      icons
        .map((icon) => {
          const ref = icon.querySelector("use")?.getAttribute("href");
          const path = ref ? document.querySelector(`${ref} path`) : icon.querySelector("path");
          return path?.getAttribute("d") ? null : (ref ?? icon.outerHTML.slice(0, 80));
        })
        .filter(Boolean),
    );
    expect(brokenIcons).toEqual([]);
  });
}

test("every internal link and download resolves", async ({ page, request, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const targets = new Set<string>();
  const missingAnchors: string[] = [];

  for (const { path } of PAGES) {
    await page.goto(path);
    const links = await page
      .locator("a[href]")
      .evaluateAll((as) => (as as HTMLAnchorElement[]).map((a) => a.href));
    for (const href of links) {
      const url = new URL(href);
      if (url.origin !== origin) continue;
      if (url.hash && url.pathname === new URL(page.url()).pathname) {
        // In-page anchor: the target element must exist.
        const id = decodeURIComponent(url.hash.slice(1));
        if (id && (await page.locator(`[id="${id}"]`).count()) === 0) {
          missingAnchors.push(`${path} → ${url.hash}`);
        }
        continue;
      }
      targets.add(url.pathname);
    }
  }

  const broken: string[] = [];
  for (const target of targets) {
    const res = await request.get(target);
    if (res.status() !== 200) broken.push(`${res.status()} ${target}`);
  }
  expect(missingAnchors).toEqual([]);
  expect(broken).toEqual([]);
});
