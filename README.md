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

| Script               | Description                                      |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Start the Vite dev server (HMR)                  |
| `npm run dev-docker` | Same, bound to `0.0.0.0` (for the Dev Container) |
| `npm run build`      | Type-check and build static output to `dist/`    |
| `npm run preview`    | Preview the production build locally             |
| `npm run lint`       | Lint with ESLint                                 |
| `npm run format`     | Format with Prettier                             |

## Languages & content

The site is bilingual (English / German) using URL routing:

- `/` redirects to the visitor's language (saved choice → browser language → English).
- `/en/` and `/de/` are full pages, prerendered at build time from a single data source.

**All résumé content lives in [`src/data/resume.json`](src/data/resume.json)**, with an
`en` and `de` value for every translatable string. `src/render.ts` turns that JSON into the
page HTML (injected into `en/index.html` and `de/index.html` by the Vite plugin in
`vite.config.ts`). To change wording or add an entry, edit the JSON — both languages update.

## Project structure

```
index.html              # root: redirects to /en/ or /de/
en/  de/                # per-language page shells (content injected at build time)
src/
  data/resume.json      # all page content, bilingual (en/de) — single source of truth
  render.ts             # builds page HTML from resume.json (used by vite.config.ts)
  main.ts  theme-switcher.ts  resume.ts  scroll-reveal.ts  section-nav.ts
scss/                   # SCSS (imports Bootstrap + the theme layer)
public/                 # static assets copied verbatim into dist/
  img/  download/  projects/sgreening/  CNAME
.devcontainer/          # VS Code Dev Container (Node 24)
.github/workflows/      # GitHub Pages deployment
```

## Dev Container

See [.devcontainer/README.md](.devcontainer/README.md). Reopen in Container → `npm run dev-docker`.

## Deployment

Pushing to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which
builds the site and publishes `dist/` to GitHub Pages. The custom domain is shipped from
`public/CNAME`.

> One-time setup: in the repository **Settings → Pages**, set **Source** to **GitHub Actions**.

## Credits

Originally based on the [Start Bootstrap Resume](https://startbootstrap.com/template-overviews/resume/) theme.
