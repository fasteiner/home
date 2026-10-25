import { defineConfig, type IndexHtmlTransformContext, type Plugin } from "vite";
import { fileURLToPath } from "node:url";
import { ROUTES, generatedFiles, renderPage, routeForPath } from "./src/page";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

// Prerender every page from resume.json: the HTML entry files only mark the
// routes, the whole document comes from renderPage() in src/page.ts. Also
// emits (and, in dev, serves) the sitemap and the vCard.
function prerender(): Plugin {
  return {
    name: "prerender",
    transformIndexHtml: {
      order: "pre",
      handler(_html: string, ctx: IndexHtmlTransformContext) {
        const route = routeForPath(ctx.path);
        if (!route) throw new Error(`No route for ${ctx.path}`);
        return renderPage(route, { dev: Boolean(ctx.server) });
      },
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = generatedFiles()[(req.url ?? "").slice(1)];
        if (!file) return next();
        res.setHeader("Content-Type", `${file.type}; charset=utf-8`);
        res.end(file.body);
      });
    },
    generateBundle() {
      for (const [fileName, file] of Object.entries(generatedFiles())) {
        this.emitFile({ type: "asset", fileName, source: file.body });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  appType: "mpa",
  plugins: [prerender()],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  // Pre-bundle the Bootstrap plugins at server start so the dev server doesn't
  // discover them mid-load and trigger a re-optimize + page reload.
  optimizeDeps: {
    include: ["bootstrap/js/dist/collapse", "bootstrap/js/dist/scrollspy"],
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: Object.fromEntries(ROUTES.map((r) => [r.file, path(`./${r.file}`)])),
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
