// Accessibility: axe-core finds no WCAG 2.2 AA or best-practice violations on
// any page, in light and dark mode, on desktop and mobile.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { PAGES } from "./pages";

for (const { path } of PAGES) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`${path} has no accessibility violations (${colorScheme})`, async ({ page }) => {
      // Reduced motion: content is checked fully visible, not mid-fade.
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      // Check the collapsed "earlier positions" too.
      await page
        .locator("details")
        .evaluateAll((all) => all.forEach((d) => ((d as HTMLDetailsElement).open = true)));

      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .analyze();
      const summary = violations.map(
        (v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      );
      expect(summary).toEqual([]);
    });
  }
}
