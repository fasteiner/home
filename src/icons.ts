// Build-time icons: turns Font Awesome class strings from resume.json and the
// renderer ("fas fa-robot", "fa-li fa fa-check text-primary") into inline SVG
// that references a per-page sprite. Only the icons a page uses end up in its
// sprite, so no icon font is shipped at all.
//
// An unknown icon name fails the build instead of rendering an empty box.

import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition, IconPack } from "@fortawesome/free-solid-svg-icons";
import { iconPath, iconViewBox } from "./icon-svg";

type Style = "solid" | "regular" | "brands";

const STYLE_CLASSES: Record<string, Style> = {
  fa: "solid",
  fas: "solid",
  "fa-solid": "solid",
  far: "regular",
  "fa-regular": "regular",
  fab: "brands",
  "fa-brands": "brands",
};

// Font Awesome modifier classes; these are kept on the <svg> and styled in
// scss/_icons.scss. Every other fa-* class names the icon itself.
const MODIFIER = /^fa-(fw|li|lg|xs|sm|[1-9]?xl|[1-9]x)$/;

// Index each pack by icon name and by its aliases (e.g. "map-marker-alt").
function index(pack: IconPack): Map<string, IconDefinition> {
  const byName = new Map<string, IconDefinition>();
  for (const def of Object.values(pack)) {
    byName.set(def.iconName, def);
    for (const alias of def.icon[2]) {
      if (typeof alias === "string") byName.set(alias, def);
    }
  }
  return byName;
}

const PACKS: Record<Style, Map<string, IconDefinition>> = {
  solid: index(fas),
  regular: index(far),
  brands: index(fab),
};

// Icons used on the page being rendered, keyed by sprite symbol id.
const used = new Map<string, IconDefinition>();

export function resetIcons(): void {
  used.clear();
}

// Render an icon from a Font Awesome class string. Non-Font-Awesome classes
// (text-primary, me-2, small …) are passed through to the <svg>.
export function icon(classes: string): string {
  let style: Style = "solid";
  let name: string | undefined;
  const keep: string[] = [];
  for (const cls of classes.split(/\s+/).filter(Boolean)) {
    if (cls in STYLE_CLASSES) style = STYLE_CLASSES[cls];
    else if (MODIFIER.test(cls) || !cls.startsWith("fa-")) keep.push(cls);
    else name = cls.slice(3);
  }
  if (!name) throw new Error(`No icon name in "${classes}"`);
  const def = PACKS[style].get(name);
  if (!def) throw new Error(`Unknown Font Awesome ${style} icon "${name}" (from "${classes}")`);

  const id = `i-${style}-${def.iconName}`;
  used.set(id, def);
  const cls = ["icon", ...keep].join(" ");
  return `<svg class="${cls}" viewBox="${iconViewBox(def)}" aria-hidden="true" focusable="false"><use href="#${id}"></use></svg>`;
}

// The sprite with every icon used since resetIcons(); placed once per page.
export function renderSprite(): string {
  if (!used.size) return "";
  const symbols = [...used]
    .map(
      ([id, def]) =>
        `<symbol id="${id}" viewBox="${iconViewBox(def)}"><path fill="currentColor" d="${iconPath(def)}"></path></symbol>`,
    )
    .join("");
  return `<svg class="icon-sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${symbols}</svg>`;
}
