// Regenerates the social preview image and the home-screen icons:
//   public/img/og-image.png          1200×630 Open Graph / LinkedIn preview
//   public/img/apple-touch-icon.png  180×180, from public/img/favicon.svg
//   public/img/icon-192.png, icon-512.png  web manifest icons
//
// Run after changing the name, tagline, photo or favicon:  npm run images
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const file = (path) => fileURLToPath(new URL(path, root));
const data = JSON.parse(readFileSync(file("src/data/resume.json"), "utf8"));
// Fonts and photo as data URLs: the card is rendered from an about:blank page.
const font = (path) =>
  `data:font/woff2;base64,${readFileSync(file(`node_modules/@fontsource/${path}`)).toString("base64")}`;
const photo = `data:image/webp;base64,${readFileSync(file("public/img/fabian_steiner.webp")).toString("base64")}`;
const favicon = readFileSync(file("public/img/favicon.svg"), "utf8");
const { pre, highlight, post } = data.meta.name;

const ogCard = `<!DOCTYPE html>
<style>
  @font-face { font-family: Saira; font-weight: 700; src: url(${font("saira-extra-condensed/files/saira-extra-condensed-latin-700-normal.woff2")}); }
  @font-face { font-family: Mulish; font-weight: 400; src: url(${font("mulish/files/mulish-latin-400-normal.woff2")}); }
  @font-face { font-family: Mulish; font-weight: 800; src: url(${font("mulish/files/mulish-latin-800-normal.woff2")}); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; display: flex; font-family: Mulish; color: #212529; background: #fff; }
  .side { flex: 0 0 400px; display: flex; align-items: center; justify-content: center; background: #b05634; }
  .side img { width: 280px; height: 280px; border-radius: 50%; border: 14px solid rgba(255,255,255,.25); }
  .main { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 0 64px; }
  h1 { font-family: Saira; font-size: 96px; line-height: .95; text-transform: uppercase; }
  h1 span { color: #b05634; }
  p { margin-top: 28px; font-size: 28px; line-height: 1.35; color: #495057; }
  .url { margin-top: 40px; font-size: 24px; font-weight: 800; letter-spacing: .04em; color: #b05634; }
</style>
<div class="side"><img src="${photo}"></div>
<div class="main">
  <h1>${pre}<br><span>${highlight}</span> ${post}</h1>
  <p>${data.meta.tagline.en.replace(" · ", "<br>")}</p>
  <div class="url">fabian.stei-ner.net</div>
</div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(ogCard, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: file("public/img/og-image.png") });

for (const [name, size] of [
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await page.setViewportSize({ width: size, height: size });
  // Square, unrounded artwork: the platforms apply their own icon mask.
  await page.setContent(
    `<style>*{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${favicon.replace('rx="12"', 'rx="0"')}`,
  );
  await page.screenshot({ path: file(`public/img/${name}`) });
}
await browser.close();
console.log("Images written to public/img/");
