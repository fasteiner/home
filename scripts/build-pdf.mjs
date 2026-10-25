// Prints the CV pages of the built site to PDF, next to the other downloads:
//   dist/download/CV_Fabian_Steiner.pdf        from /en/cv/
//   dist/download/Lebenslauf_Fabian_Steiner.pdf from /de/lebenslauf/
//
// Run after `npm run build` (the CI workflow does both), so every deploy ships a
// CV that matches src/data/resume.json.
import { chromium } from "@playwright/test";
import { preview } from "vite";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const data = JSON.parse(readFileSync(new URL("src/data/resume.json", root), "utf8"));

// Keep in sync with PAGES.cv in src/render.ts (the tests check the links match).
const CV_PAGES = { en: "/en/cv/", de: "/de/lebenslauf/" };

const server = await preview({ preview: { port: 4180 }, logLevel: "warn" });
const base = server.resolvedUrls.local[0].replace(/\/$/, "");
const browser = await chromium.launch();

try {
  const page = await browser.newPage();
  for (const [lang, path] of Object.entries(CV_PAGES)) {
    await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const out = fileURLToPath(new URL(`dist/${data.cv.pdf[lang]}`, root));
    await page.pdf({
      path: out,
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="width:100%;font-size:8px;color:#5c636a;text-align:center;font-family:sans-serif">
        <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    });
    console.log(`${out} (${Math.round(statSync(out).size / 1024)} KB)`);
  }
} finally {
  await browser.close();
  await server.close();
}
