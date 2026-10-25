// Markup for one Font Awesome icon as inline SVG. Shared by the build-time
// renderer (src/icons.ts) and client scripts that create icons at runtime, so
// both produce the same `.icon` element styled by scss/_icons.scss.

import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

export function iconViewBox(def: IconDefinition): string {
  const [width, height] = def.icon;
  return `0 0 ${width} ${height}`;
}

export function iconPath(def: IconDefinition): string {
  const path = def.icon[4];
  return Array.isArray(path) ? path.join(" ") : path;
}

// A standalone icon (path inlined). Icons are decorative: the text next to them
// carries the meaning, so they are hidden from assistive technology.
export function iconSvg(def: IconDefinition, classes = ""): string {
  const cls = ["icon", classes].filter(Boolean).join(" ");
  return `<svg class="${cls}" viewBox="${iconViewBox(def)}" aria-hidden="true" focusable="false"><path fill="currentColor" d="${iconPath(def)}"></path></svg>`;
}
