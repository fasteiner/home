import { defineConfig, type IndexHtmlTransformContext, type Plugin } from "vite";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ROUTES, generatedFiles, prepare, renderPage, routeForPath } from "./src/page";

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

// Prerender every page from resume.json: the HTML entry files only mark the
// routes, the whole document comes from renderPage() in src/page.ts. Also
// emits (and, in dev, serves) the sitemap, the vCard and the project badges,
// whose figures prepare() fetches first.
function prerender(): Plugin {
  return {
    name: "prerender",
    transformIndexHtml: {
      order: "pre",
      async handler(_html: string, ctx: IndexHtmlTransformContext) {
        const route = routeForPath(ctx.path);
        if (!route) throw new Error(`No route for ${ctx.path}`);
        await prepare();
        return renderPage(route, { dev: Boolean(ctx.server) });
      },
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        prepare().then(() => {
          const file = generatedFiles()[(req.url ?? "").slice(1)];
          if (!file) return next();
          res.setHeader("Content-Type", `${file.type}; charset=utf-8`);
          res.end(file.body);
        }, next);
      });
    },
    async buildStart() {
      await prepare();
    },
    generateBundle() {
      for (const [fileName, file] of Object.entries(generatedFiles())) {
        this.emitFile({ type: "asset", fileName, source: file.body });
      }
    },
  };
}

// Answer unknown paths in `vite preview` the way GitHub Pages does: status 404
// with the site's own 404.html, so the tests see what visitors of a removed or
// mistyped URL get (Vite alone would send an empty 404).
function notFoundPage(): Plugin {
  return {
    name: "not-found-page",
    configurePreviewServer(server) {
      const outDir = path(`./${server.config.build.outDir}/`);
      const exists = (file: string) => {
        try {
          return statSync(file).isFile();
        } catch {
          return false;
        }
      };
      // Runs after Vite's static files and HTML fallback, so only requests
      // that match no file in dist/ fall through to the 404 page.
      return () => {
        server.middlewares.use((req, res, next) => {
          const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
          if (exists(`${outDir}${pathname}`)) return next();
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(readFileSync(`${outDir}404.html`));
        });
      };
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  appType: "mpa",
  plugins: [prerender(), notFoundPage()],
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
