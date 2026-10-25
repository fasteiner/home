// Navigation & keyboard usability: sidebar / mobile menu, language and theme
// switch, skip link, visible focus, arrow keys, the experience disclosure and
// the language redirect of the root page.
import { expect, test } from "@playwright/test";
import { openMenuIfCollapsed } from "./pages";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("a navigation link brings its section into view and updates the URL", async ({ page }) => {
  await page.goto("/en/");
  await openMenuIfCollapsed(page);
  await page.locator("#sideNav .nav-link", { hasText: "Experience" }).click();
  await expect(page.locator("#experience h2")).toBeInViewport();
  await expect(page).toHaveURL(/\/en\/#experience$/);
  // On phones the menu closes again after choosing a section.
  await expect(page.locator("#navbarSupportedContent")).not.toHaveClass(/\bshow\b/);
});

test("the mobile menu opens and closes with the toggler", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The sidebar is always open on desktop");
  await page.goto("/de/");
  const toggler = page.locator(".navbar-toggler");
  await expect(toggler).toHaveAttribute("aria-label", "Navigation umschalten");
  await toggler.click();
  await expect(toggler).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#sideNav .nav-link").first()).toBeVisible();
  await toggler.click();
  await expect(toggler).toHaveAttribute("aria-expanded", "false");
});

test("the language switch keeps the current section", async ({ page }) => {
  await page.goto("/en/#projects");
  await expect(page.locator("#projects h2")).toBeInViewport();
  await openMenuIfCollapsed(page);
  await page.locator('.lang-option[hreflang="de"]').click();
  await expect(page).toHaveURL(/\/de\/#projects$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator("#projects h2")).toBeInViewport();
});

test("the language switch maps legal pages to their translation", async ({ page }) => {
  await page.goto("/de/impressum/");
  await openMenuIfCollapsed(page);
  await page.locator('.lang-option[hreflang="en"]').click();
  await expect(page).toHaveURL(/\/en\/imprint\/$/);
});

test("the theme choice applies at once and survives a reload", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/");
  await openMenuIfCollapsed(page);
  await page.locator("#theme-select").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
  await openMenuIfCollapsed(page);
  await expect(page.locator("#theme-select")).toHaveValue("dark");
});

test("the skip link is the first tab stop and moves focus to the content", async ({ page }) => {
  await page.goto("/en/");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("every keyboard focus stop is visibly marked", async ({ page, isMobile }) => {
  test.skip(isMobile, "Keyboard navigation is a desktop concern");
  await page.goto("/en/");
  const unmarked: string[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
      return { marked: outline || style.boxShadow !== "none", name: el.outerHTML.slice(0, 90) };
    });
    if (focus && !focus.marked) unmarked.push(focus.name);
  }
  expect(unmarked).toEqual([]);
});

test("arrow keys move between sections", async ({ page, isMobile }) => {
  test.skip(isMobile, "Phones have no arrow keys");
  await page.goto("/en/");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#services h2")).toBeInViewport();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#experience h2")).toBeInViewport();
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator("#services h2")).toBeInViewport();
});

test("the earlier positions open and close with the keyboard", async ({ page }) => {
  await page.goto("/de/");
  const details = page.locator("details.earlier-positions");
  const summary = details.locator("summary");
  await expect(summary).toHaveText(/Frühere Stationen \(\d+\)/);
  await expect(details.locator(".resume-item").first()).toBeHidden();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect(details.locator(".resume-item").first()).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(details).not.toHaveAttribute("open", "");
});

for (const [locale, target] of [
  ["de-AT", "/de/"],
  ["en-US", "/en/"],
] as const) {
  test(`the root page sends ${locale} visitors to ${target}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ locale, baseURL });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    await context.close();
  });
}
