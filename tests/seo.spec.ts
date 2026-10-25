// SEO & link previews: titles, descriptions, canonical / hreflang links, Open
// Graph tags, structured data, sitemap, robots.txt, manifest and the 404 page.
import { expect, test } from "@playwright/test";
import { HOME_PAGES, PAGES, SITE_URL } from "./pages";

const local = (url: string) => url.replace(SITE_URL, "");
const INDEXED = PAGES.filter((p) => p.key !== "notFound");

test("every page has its own title", async ({ page }) => {
  const titles = new Set<string>();
  for (const { path } of PAGES) {
    await page.goto(path);
    titles.add(await page.title());
  }
  expect(titles.size).toBe(PAGES.length);
});

for (const { path, lang } of INDEXED) {
  test(`${path} has meta, canonical, hreflang and Open Graph tags`, async ({ page }) => {
    await page.goto(path);
    const meta = (selector: string) => page.locator(selector).first().getAttribute("content");

    expect(await page.title()).toMatch(/Fabian Steiner/);
    expect((await meta('meta[name="description"]'))!.length).toBeGreaterThan(50);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", SITE_URL + path);
    for (const hreflang of ["en", "de", "x-default"]) {
      const href = await page
        .locator(`link[rel="alternate"][hreflang="${hreflang}"]`)
        .getAttribute("href");
      expect(href).toMatch(new RegExp(`^${SITE_URL}/`));
    }

    expect(await meta('meta[property="og:title"]')).toBe(await page.title());
    expect(await meta('meta[property="og:url"]')).toBe(SITE_URL + path);
    expect(await meta('meta[property="og:locale"]')).toBe(lang === "de" ? "de_AT" : "en_US");
    expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(await meta('meta[name="theme-color"]')).toBeTruthy();
    const image = await meta('meta[property="og:image"]');
    const res = await page.request.get(local(image!));
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
  });
}

for (const { path } of HOME_PAGES) {
  test(`${path} carries Person and ProfessionalService structured data`, async ({ page }) => {
    await page.goto(path);
    const json = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(json!);
    const types = data["@graph"].map((node: { "@type": string }) => node["@type"]);
    expect(types).toEqual(["Person", "ProfessionalService"]);
    const person = data["@graph"][0];
    expect(person.name).toBe("Fabian Franz Steiner");
    expect(person.sameAs).toContain("https://github.com/fasteiner");
  });
}

test("the sitemap lists every page and each one resolves", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => local(m[1]));
  expect(locs.sort()).toEqual(INDEXED.map((p) => p.path).sort());
  for (const loc of locs) expect((await request.get(loc)).status()).toBe(200);
});

test("robots.txt points to the sitemap", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
});

test("the web manifest and its icons are served", async ({ request }) => {
  const manifest = await (await request.get("/site.webmanifest")).json();
  for (const icon of manifest.icons) expect((await request.get(icon.src)).status()).toBe(200);
  expect((await request.get("/img/apple-touch-icon.png")).status()).toBe(200);
});

test("the 404 page is bilingual, not indexed and links home", async ({ page }) => {
  await page.goto("/404.html");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  await expect(page.locator('.not-found-block[lang="de"] h2')).toHaveText("Seite nicht gefunden");
  await expect(page.locator('.not-found-block[lang="en"] h2')).toHaveText("Page not found");
  await expect(page.locator('a[href="/de/"]')).toBeVisible();
  await expect(page.locator('a[href="/en/"]')).toBeVisible();
});
