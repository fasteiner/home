// Downloads: the generated CV PDFs and the vCard are served and linked from
// the page of the matching language.
import { expect, test } from "@playwright/test";

for (const [path, pdf] of [
  ["/en/", "/download/CV_Fabian_Steiner.pdf"],
  ["/de/", "/download/Lebenslauf_Fabian_Steiner.pdf"],
] as const) {
  test(`${path} offers the generated CV ${pdf}`, async ({ page, request }) => {
    await page.goto(path);
    await expect(page.locator(`#documents a[href="${pdf}"]`)).toHaveCount(1);
    const res = await request.get(pdf);
    expect(res.status()).toBe(200);
    const body = await res.body();
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    expect(body.length).toBeGreaterThan(20_000);
  });
}

test("the CV page links its own PDF", async ({ page }) => {
  await page.goto("/de/lebenslauf/");
  await expect(page.locator(".cv-actions a")).toHaveAttribute(
    "href",
    "/download/Lebenslauf_Fabian_Steiner.pdf",
  );
  await expect(page.locator(".cv .cv-entry")).not.toHaveCount(0);
});

test("the contact section offers a vCard with the contact details", async ({ page, request }) => {
  await page.goto("/en/");
  const button = page.locator('#contact a[href="/fabian-steiner.vcf"]');
  await expect(button).toHaveAttribute("download", "");
  const vcard = await (await request.get("/fabian-steiner.vcf")).text();
  expect(vcard).toMatch(/^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
  for (const line of [
    "FN:Ing. Fabian Franz Steiner BSc.",
    "ORG:Ing. Fabian Franz Steiner BSc.",
    "EMAIL;",
    "TEL;",
    "ADR;",
    "URL:",
  ]) {
    expect(vcard).toContain(line);
  }
  expect(vcard.trimEnd()).toMatch(/END:VCARD$/);
});
