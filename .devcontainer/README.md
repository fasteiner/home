# Dev Container — Fabian Steiner resume site

Vite + TypeScript + Bootstrap 5 (SCSS). Node 24.

## Usage

1. Install VS Code and the Dev Containers extension.
2. Open this repository folder in VS Code.
3. Choose **Reopen in Container**. `npm install` runs automatically via `postCreateCommand`.

## Start development

- Dev server: `npm run dev-docker` → http://localhost:5173

`dev-docker` runs `vite --host`, so the server binds to `0.0.0.0` and the port exposed
through `appPort` is reachable from your host browser.

## Build

- `npm run build` → static output in `dist/`
- `npm run preview` → serve the production build locally

## Notes

- Node version in this dev container: 24.
