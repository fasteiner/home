import { defineConfig, type IndexHtmlTransformContext } from "vite";
import { fileURLToPath } from "node:url";
import { renderNav, renderContent, type Lang } from "./src/render";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

// Prerender the resume content from resume.json into the /en/ and /de/ pages.
function prerenderResume() {
  return {
    name: "prerender-resume",
    transformIndexHtml: {
      order: "pre" as const,
      handler(html: string, ctx: IndexHtmlTransformContext) {
        const match = ctx.path.match(/\/(en|de)\//);
        if (!match) return html; // root redirect page — nothing to inject
        const lang = match[1] as Lang;
        return html
          .replace("<!--@NAV-->", renderNav(lang))
          .replace("<!--@CONTENT-->", renderContent(lang));
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
