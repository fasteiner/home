// Icons: Font Awesome icon data rendered at build time into a per-page SVG
// sprite (src/icons.ts) or at runtime (src/icon-svg.ts). These checks guard
// Font Awesome upgrades: the packages come from one release, every icon name
// resolves, every icon draws, and each keeps its intended size whatever the
// width of the new glyph.
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { icon, renderSprite, resetIcons } from "../src/icons";
import { HOME_PAGES, PAGES, scrollThrough } from "./pages";

const PACKAGES = ["free-solid-svg-icons", "free-regular-svg-icons", "free-brands-svg-icons"];

test("the Font Awesome icon packages come from the same release", () => {
  // The packages share their icon types, so a single bumped package breaks the
  // type check; name the mismatch here instead.
  const versions = Object.fromEntries(
    ["fontawesome-common-types", ...PACKAGES].map((name) => {
      const pkg = `node_modules/@fortawesome/${name}/package.json`;
      return [name, JSON.parse(readFileSync(pkg, "utf8")).version];
    }),
  );
  expect(new Set(Object.values(versions)), JSON.stringify(versions)).toHaveProperty("size", 1);
});

test("icon names and aliases resolve in every style, unknown names fail", () => {
  resetIcons();
  expect(icon("fas fa-location-dot")).toContain('href="#i-solid-location-dot"');
  expect(icon("fa fa-map-marker-alt")).toContain('href="#i-solid-location-dot"'); // alias
  expect(icon("fa-regular fa-calendar-check")).toContain('href="#i-regular-calendar-check"');
  expect(icon("fab fa-github fa-fw ms-2")).toMatch(
    /^<svg class="icon fa-fw ms-2" viewBox="0 0 \d+ 512"/,
  );
  expect(() => icon("fas fa-no-such-icon")).toThrow(
    'Unknown Font Awesome solid icon "no-such-icon"',
  );
  expect(() => icon("fab fa-check")).toThrow('Unknown Font Awesome brands icon "check"');

  const symbols = renderSprite().match(
    /<symbol id="[^"]+" viewBox="0 0 \d+ \d+"><path [^>]*d="M[^"]+"/g,
  );
  expect(symbols).toHaveLength(3);
});

for (const { path } of PAGES) {
  test(`${path} draws every icon from the page's sprite`, async ({ page }) => {
    await page.goto(path);
    await scrollThrough(page);
    const problems = await page.evaluate(() => {
      const found: string[] = [];
      const symbols = new Map(
        [...document.querySelectorAll(".icon-sprite symbol")].map((s) => [`#${s.id}`, s]),
      );
      const used = new Set<string>();
      for (const svg of document.querySelectorAll("svg.icon")) {
        const ref = svg.querySelector("use")?.getAttribute("href");
        // Sprite icons point at a symbol; icons created at runtime carry their path.
        const source = ref ? symbols.get(ref) : svg;
        const name = ref ?? svg.outerHTML.slice(0, 80);
        if (ref) used.add(ref);
        if (!source?.querySelector("path")?.getAttribute("d"))
          found.push(`${name}: nothing to draw`);
        else if (ref && svg.getAttribute("viewBox") !== source.getAttribute("viewBox")) {
          found.push(
            `${name}: viewBox ${svg.getAttribute("viewBox")}, symbol ${source.getAttribute("viewBox")}`,
          );
        }
      }
      for (const id of symbols.keys())
        if (!used.has(id)) found.push(`${id}: in the sprite but unused`);
      return found;
    });
    expect(problems).toEqual([]);
  });
}

for (const { path } of HOME_PAGES) {
  test(`${path} sizes every icon to its font size`, async ({ page }) => {
    await page.goto(path);
    await scrollThrough(page);
    // An icon is 1em high; it is as wide as its glyph, or as its slot in a
    // fixed-width column (fa-fw) or list (fa-li).
    const wrong = await page.locator("svg.icon").evaluateAll((icons) =>
      icons
        .filter((svg) => svg.getClientRects().length > 0)
        .flatMap((svg) => {
          const box = svg.getBoundingClientRect();
          const em = parseFloat(getComputedStyle(svg).fontSize);
          const [, , w, h] = svg.getAttribute("viewBox")!.split(" ").map(Number);
          const width = svg.classList.contains("fa-li")
            ? 2 * em
            : svg.classList.contains("fa-fw")
              ? 1.25 * em
              : (em * w) / h;
          if (Math.abs(box.height - em) <= 0.5 && Math.abs(box.width - width) <= 0.5) return [];
          const name = svg.querySelector("use")?.getAttribute("href") ?? "inline icon";
          return [
            `${name} (${svg.getAttribute("class")}): ${box.width}×${box.height}, expected ${width}×${em}`,
          ];
        }),
    );
    expect(wrong).toEqual([]);
  });
}
