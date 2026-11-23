// Downloads: the generated CV PDFs and the vCard are served and linked from
// the page of the matching language; references are offered on request only.
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

// References and degree certificates are offered on request only (#47); the
// Xurrent certificates stay published.
const WITHDRAWN = [
  "/download/BakkurkundeEng_BIC_6_SS2023.pdf",
  "/download/Ingenieurzertifikat.pdf",
  "/download/Dienstzeugnis_CP-Consult.pdf",
  "/download/Praktikumsbestätigung_Österreichisches_Bundesheer.pdf",
  "/download/Praktikumszeugnis_FCP_2016.pdf",
  "/download/Praktikumszeugnis_FCP_2017.pdf",
  "/download/Praktikumszeugnis_FCP_2018.pdf",
  "/download/Praktikumszeugnis_TTTech_2015.pdf",
];
const XURRENT_CERTIFICATES = [
  "/download/Certificate%20Xurrent%20Automation%20Rules%20(for%20Absorb).pdf",
  "/download/Certificate%20Xurrent%20Administrator%20Level%202-A.pdf",
];

for (const [path, note, link] of [
  ["/en/", "available on request", "Get in touch"],
  ["/de/", "erhalten Sie auf Anfrage", "Kontakt aufnehmen"],
] as const) {
  test(`${path} offers references on request instead of as downloads`, async ({ page }) => {
    await page.goto(path);
    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((as) => (as as HTMLAnchorElement[]).map((a) => decodeURI(a.pathname)));
    for (const file of WITHDRAWN) expect(hrefs, file).not.toContain(file);
    await expect(page.locator('a[href*="zeugnis" i]')).toHaveCount(0);

    const hint = page.locator("#documents .documents-on-request");
    await expect(hint).toContainText(note);
    const contact = hint.getByRole("link", { name: link });
    await expect(contact).toHaveAttribute("href", "#contact");
    await expect(page.locator("#contact")).toHaveCount(1);
  });

  test(`${path} still links both Xurrent certificates`, async ({ page, request }) => {
    await page.goto(path);
    for (const cert of XURRENT_CERTIFICATES) {
      await expect(page.locator(`#documents a[href="${cert}"]`)).toHaveCount(1);
      await expect(page.locator(`#awards a[href="${cert}"]`)).toHaveCount(1);
      const res = await request.get(cert);
      expect(res.status()).toBe(200);
      expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-");
    }
  });
}

test("the withdrawn references are no longer served", async ({ request }) => {
  for (const file of WITHDRAWN) {
    expect((await request.get(encodeURI(file))).status(), file).toBe(404);
  }
});

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
