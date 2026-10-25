# Fabian Steiner — Resume Website

Personal website and online résumé of **Ing. Fabian Steiner BSc.**, published at
[fabian.stei-ner.net](https://fabian.stei-ner.net).

Built as a static single-page site with **Vite + TypeScript + Bootstrap 5 (SCSS)**.

## Requirements

- Node.js 24+ (or use the provided Dev Container)

## Getting started

```bash
npm install
npm run dev          # Vite dev server at http://localhost:5173
```

## Scripts

| Script               | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server (HMR)                                 |
| `npm run dev-docker` | Same, bound to `0.0.0.0` (for the Dev Container)                |
| `npm run build`      | Type-check and build static output to `dist/`                   |
| `npm run build:pdf`  | Print the CV pages of `dist/` to PDF (`dist/download/`)         |
| `npm run preview`    | Preview the production build locally                            |
| `npm test`           | Build, generate the PDFs and run the Playwright usability tests |
| `npm run test:e2e`   | Run only the Playwright tests (against an existing build)       |
| `npm run images`     | Regenerate the social preview image and the home-screen icons   |
| `npm run lint`       | Lint with ESLint                                                |
| `npm run format`     | Format with Prettier                                            |

## Languages & content

The site is bilingual (English / German) using URL routing:

- `/` redirects to the visitor's language (saved choice → browser language → English).
- `/en/` and `/de/` are full pages, prerendered at build time from a single data source,
  as are the legal pages, the CV (`/en/cv/`, `/de/lebenslauf/`) and the bilingual `404.html`.

**All résumé content lives in [`src/data/resume.json`](src/data/resume.json)**, with an
`en` and `de` value for every translatable string. `src/render.ts` turns that JSON into the
page content and `src/page.ts` into whole documents (head, Open Graph, structured data), which
the Vite plugin in `vite.config.ts` writes in place of the route marker files. The same build
emits `sitemap.xml` and the vCard. To change wording or add an entry, edit the JSON — both
languages, the CV page and the CV PDF update.

Icons are Font Awesome icon data rendered at build time into a per-page SVG sprite
(`src/icons.ts`); an unknown icon name fails the build.

## Tests

`npm test` runs the Playwright usability tests in `tests/` against the production build, on a
desktop and a phone viewport:

- **Accessibility** — axe-core finds no WCAG 2.2 AA / best-practice violations on any page, in
  light and dark mode
- **Navigation** — sidebar and mobile menu, language and theme switch, skip link, visible
  keyboard focus, arrow keys, the "earlier positions" disclosure, the root language redirect
- **Layout** — no sideways scrolling, call to action on the first screen, navbar padding,
  stable layout while fonts load, page-weight budget
- **Integrity** — no console errors, failed or third-party requests; every image, icon,
  internal link and download resolves
- **SEO & downloads** — meta / Open Graph / hreflang / JSON-LD, sitemap, robots.txt, manifest,
  404 page, the CV PDFs and the vCard

## Project structure

```
index.html  404.html    # route markers: root (redirects to /en/ or /de/) and the 404 page
en/  de/                # route markers per language (home, legal pages, CV)
src/
  data/resume.json      # all page content, bilingual (en/de) — single source of truth
  config.ts             # contact links, site URL, address
  render.ts             # page content from resume.json
  page.ts               # whole documents, routes, sitemap, vCard (used by vite.config.ts)
  icons.ts  icon-svg.ts # Font Awesome icons as inline SVG
  main.ts  theme-switcher.ts  resume.ts  scroll-reveal.ts  section-nav.ts  …
scss/                   # SCSS (imports the used parts of Bootstrap + the theme layer)
scripts/                # CV PDF generation, social preview image / icons
tests/                  # Playwright usability tests
public/                 # static assets copied verbatim into dist/
  img/  download/  projects/sgreening/  robots.txt  site.webmanifest  CNAME
.devcontainer/          # VS Code Dev Container (Node 24)
.github/                # CI (tests + GitHub Pages deployment), Dependabot
```

## Dev Container

See [.devcontainer/README.md](.devcontainer/README.md). Reopen in Container → `npm run dev-docker`.

## Deployment

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) lints, builds and tests every pull
request. Pushing to `main` runs the same checks and, only when they pass, publishes `dist/`
(including the freshly generated CV PDFs) to GitHub Pages. The custom domain is shipped from
`public/CNAME`. Dependabot proposes dependency updates weekly.

> One-time setup: in the repository **Settings → Pages**, set **Source** to **GitHub Actions**.

## Credits

Originally based on the [Start Bootstrap Resume](https://startbootstrap.com/template-overviews/resume/) theme.
