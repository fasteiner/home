import { defineConfig, type IndexHtmlTransformContext } from "vite";
import { fileURLToPath } from "node:url";
import {
  renderNav,
  renderContent,
  renderImprint,
  renderPrivacy,
  renderFooter,
  resolve,
  type Lang,
  type PageKey,
} from "./src/render";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

// Prerender the content from resume.json into the /en/ and /de/ pages, plus the
// legal pages (/en/imprint, /de/impressum, /en/privacy, /de/datenschutz).
function prerenderResume() {
  return {
    name: "prerender-resume",
    transformIndexHtml: {
      order: "pre" as const,
      handler(html: string, ctx: IndexHtmlTransformContext) {
        const match = ctx.path.match(/\/(en|de)\//);
        if (!match) return html; // root redirect page — nothing to inject
        const lang = match[1] as Lang;
        const page: PageKey = /\/(imprint|impressum)\//.test(ctx.path)
          ? "imprint"
          : /\/(privacy|datenschutz)\//.test(ctx.path)
            ? "privacy"
            : "home";
        const content =
          page === "imprint"
            ? renderImprint(lang)
            : page === "privacy"
              ? renderPrivacy(lang)
              : renderContent(lang);
        // resolve() expands the {{TOKEN}} placeholders (booking link, e-mails,
        // phone) once over the finished HTML.
        return resolve(
          html
            .replace("<!--@NAV-->", renderNav(lang, page))
            .replace("<!--@CONTENT-->", `${content}\n${renderFooter(lang, page)}`),
        );
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  appType: "mpa",
  plugins: [prerenderResume()],
  server: {
    port: 5173,
  },
  // Pre-bundle Bootstrap (and Popper) at server start so the dev server doesn't
  // discover them mid-load and trigger a re-optimize + page reload.
  optimizeDeps: {
    include: ["bootstrap", "@popperjs/core"],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path("./index.html"),
        en: path("./en/index.html"),
        de: path("./de/index.html"),
        imprintEn: path("./en/imprint/index.html"),
        imprintDe: path("./de/impressum/index.html"),
        privacyEn: path("./en/privacy/index.html"),
        privacyDe: path("./de/datenschutz/index.html"),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 still uses legacy @import / global color functions.
        quietDeps: true,
        silenceDeprecations: ["import", "global-builtin", "color-functions"],
      },
    },
  },
});
