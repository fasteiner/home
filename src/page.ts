// Whole-document rendering: the route table, the <head> (titles, canonical and
// hreflang links, Open Graph, structured data), the page chrome, and the files
// generated next to the pages (sitemap, vCard).
//
// The HTML entry files (index.html, en/index.html, …) only mark the routes for
// Vite; the prerender plugin in vite.config.ts replaces their content with
// renderPage().

import { ADDRESS, LINKS, SITE_URL } from "./config";
import { renderSprite, resetIcons } from "./icons";
import {
  PAGES,
  data,
  esc,
  fullName,
  renderContent,
  renderCv,
  renderFooter,
  renderImprint,
  renderNav,
  renderNotFound,
  renderPrivacy,
  resolve,
  t,
  type Lang,
  type PageKey,
} from "./render";

export interface Route {
  key: PageKey | "root" | "notFound";
  lang: Lang;
  path: string; // public URL path
  file: string; // HTML entry file, relative to the project root
}

const LANGS: Lang[] = ["en", "de"];

export const ROUTES: Route[] = [
  { key: "root", lang: "en", path: "/", file: "index.html" },
  ...(Object.keys(PAGES) as PageKey[]).flatMap((key) =>
    LANGS.map((lang) => {
      const path = PAGES[key][lang];
      return { key, lang, path, file: `${path.slice(1)}index.html` };
    }),
  ),
  { key: "notFound", lang: "de", path: "/404.html", file: "404.html" },
];

// Match a Vite HTML path ("/en/imprint/index.html", "/404.html") to its route.
export function routeForPath(path: string): Route | undefined {
  const normalised = path.replace(/index\.html$/, "");
  return ROUTES.find((r) => r.path === normalised);
}

const OG_IMAGE = { src: "/img/og-image.png", width: 1200, height: 630 };
const LOCALES: Record<Lang, string> = { en: "en_US", de: "de_AT" };
const THEME_COLOR = "#b05634";

// The role, as the first part of the tagline ("Automation Consultant · …").
const JOB_TITLE = t(data.meta.tagline, "en").split(" · ")[0];

// Fonts used above the fold: preloaded so the first paint already uses them
// (Vite rewrites these paths to the hashed files the stylesheet references).
const PRELOAD_FONTS = [
  "/node_modules/@fontsource/mulish/files/mulish-latin-400-normal.woff2",
  "/node_modules/@fontsource/saira-extra-condensed/files/saira-extra-condensed-latin-700-normal.woff2",
];

function title(route: Route): string {
  if (route.key === "root") return t(data.pages.home.title, "en");
  if (route.key === "notFound") {
    const nf = data.pages.notFound.title;
    return `404 · ${t(nf, "de")} · ${t(nf, "en")}`;
  }
  return t(data.pages[route.key].title, route.lang);
}

function description(route: Route): string {
  if (route.key === "notFound") return t(data.pages.notFound.text, "de");
  return t(data.pages[route.key === "root" ? "home" : route.key].description, route.lang);
}

function head(route: Route): string {
  const pageKey: PageKey = route.key === "root" || route.key === "notFound" ? "home" : route.key;
  const url = `${SITE_URL}${route.path}`;
  const lines = [
    `<title>${esc(title(route))}</title>`,
    `<meta name="description" content="${esc(description(route))}">`,
    `<meta name="author" content="${esc(data.meta.shortName)}">`,
    `<meta name="theme-color" content="${THEME_COLOR}">`,
    `<link rel="icon" type="image/svg+xml" href="/img/favicon.svg">`,
    `<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">`,
    `<link rel="manifest" href="/site.webmanifest">`,
  ];

  if (route.key === "notFound") {
    lines.push(`<meta name="robots" content="noindex">`);
  } else {
    // Both languages plus x-default: the language-detecting root for the home
    // page, the English version for every other page.
    const xDefault = pageKey === "home" ? "/" : PAGES[pageKey].en;
    for (const lang of LANGS) {
      lines.push(
        `<link rel="alternate" hreflang="${lang}" href="${SITE_URL}${PAGES[pageKey][lang]}">`,
      );
    }
    lines.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}${xDefault}">`);
    if (route.key !== "root") lines.push(`<link rel="canonical" href="${url}">`);

    const otherLang = route.lang === "en" ? "de" : "en";
    lines.push(
      `<meta property="og:type" content="${pageKey === "home" ? "profile" : "website"}">`,
      `<meta property="og:site_name" content="${esc(data.meta.shortName)}">`,
      `<meta property="og:title" content="${esc(title(route))}">`,
      `<meta property="og:description" content="${esc(description(route))}">`,
      `<meta property="og:url" content="${url}">`,
      `<meta property="og:image" content="${SITE_URL}${OG_IMAGE.src}">`,
      `<meta property="og:image:width" content="${OG_IMAGE.width}">`,
      `<meta property="og:image:height" content="${OG_IMAGE.height}">`,
      `<meta property="og:image:alt" content="${esc(`${fullName()} – ${t(data.meta.tagline, route.lang)}`)}">`,
      `<meta property="og:locale" content="${LOCALES[route.lang]}">`,
      `<meta property="og:locale:alternate" content="${LOCALES[otherLang]}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
    );
    if (pageKey === "home") {
      lines.push(
        `<meta property="profile:first_name" content="Fabian">`,
        `<meta property="profile:last_name" content="${esc(data.meta.name.highlight)}">`,
      );
    }
  }

  if (route.key !== "root") {
    for (const href of PRELOAD_FONTS) {
      lines.push(`<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`);
    }
  }
  if (route.key === "home") lines.push(structuredData(route.lang));
  return lines.join("\n  ");
}

// schema.org data for search engines: the person and the consulting business.
function structuredData(lang: Lang): string {
  const address = {
    "@type": "PostalAddress",
    streetAddress: ADDRESS.street,
    postalCode: ADDRESS.postalCode,
    addressLocality: ADDRESS.locality[lang],
    addressCountry: ADDRESS.countryCode,
  };
  const sameAs = data.contact.channels.filter((c) => c.external).map((c) => c.href);
  const [prefix, ...given] = data.meta.name.pre.split(" ");
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: `${given.join(" ")} ${data.meta.name.highlight}`,
    honorificPrefix: prefix,
    honorificSuffix: data.meta.name.post,
    jobTitle: JOB_TITLE,
    description: t(data.meta.lead, lang),
    url: `${SITE_URL}${PAGES.home[lang]}`,
    image: `${SITE_URL}/${data.meta.profileImage}`,
    email: LINKS.EMAIL_DIRECT,
    telephone: LINKS.PHONE.replace(/\s/g, ""),
    address,
    sameAs,
    knowsAbout: data.services.items.map((s) => t(s.title, lang)),
    alumniOf: data.education.items.map((e) => ({
      "@type": "EducationalOrganization",
      name: e.school.name,
      url: e.school.href,
    })),
  };
  // Only the services Fabian delivers himself; the rest run through techwork.
  const business = {
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#business`,
    name: `${fullName()} – Automation Consulting`,
    url: `${SITE_URL}${PAGES.home[lang]}`,
    image: `${SITE_URL}${OG_IMAGE.src}`,
    email: LINKS.EMAIL_DIRECT,
    telephone: LINKS.PHONE.replace(/\s/g, ""),
    address,
    areaServed: { "@type": "Country", name: "Austria" },
    founder: { "@id": `${SITE_URL}/#person` },
    makesOffer: data.services.items
      .filter((s) => s.delivery === "direct")
      .map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: t(s.title, lang), description: t(s.desc, lang) },
      })),
  };
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": [person, business] });
  // "</" must not end the script element early.
  return `<script type="application/ld+json">${json.replace(/<\//g, "<\\/")}</script>`;
}

// Inline boot script: set the colour mode before first paint to avoid a flash
// of the wrong theme.
const THEME_BOOT = `<script>
    (function () {
      try {
        var pref = localStorage.getItem("theme-preference") || "system";
        var dark =
          pref === "dark" ||
          (pref !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.setAttribute("data-bs-theme", dark ? "dark" : "light");
      } catch (e) {}
    })();
  </script>`;

// Dev server only: there the stylesheet is injected by /src/main.ts (a deferred
// module), so the raw page would paint unstyled for a moment. This overlay
// covers it until main.ts has applied the styles. Production builds link the
// stylesheet in the <head>, so they paint styled right away and skip it.
const DEV_LOADER = `<style>
    #app-loader { position: fixed; inset: 0; z-index: 2000; display: none; background: #fff; }
    html[data-bs-theme="dark"] #app-loader { background: #212529; }
    html.app-loading #app-loader { display: block; }
  </style>
  <script>
    document.documentElement.classList.add("app-loading");
    window.setTimeout(function () {
      document.documentElement.classList.remove("app-loading");
    }, 8000);
  </script>`;

// Root page: sends visitors to their language (stored choice, else browser
// language, else English). Crawlers get the hreflang links and the noscript list.
function rootBody(): string {
  return `<noscript>
    <p>Choose a language: <a href="/en/">English</a> &middot; <a href="/de/">Deutsch</a></p>
  </noscript>`;
}

const ROOT_REDIRECT = `<script>
    (function () {
      try {
        var stored = localStorage.getItem("lang");
        var lang =
          stored === "de" || stored === "en"
            ? stored
            : (navigator.language || "en").toLowerCase().indexOf("de") === 0
              ? "de"
              : "en";
        location.replace("/" + lang + "/");
      } catch (e) {
        location.replace("/en/");
      }
    })();
  </script>
  <meta http-equiv="refresh" content="0; url=/en/">`;

function main(route: Route): string {
  switch (route.key) {
    case "home":
      return renderContent(route.lang);
    case "imprint":
      return renderImprint(route.lang);
    case "privacy":
      return renderPrivacy(route.lang);
    case "cv":
      return renderCv(route.lang);
    default:
      return renderNotFound();
  }
}

function body(route: Route): string {
  if (route.key === "root") return rootBody();
  const de = route.lang === "de";
  if (route.key === "notFound") {
    return `<main id="main" class="page-plain">
    ${main(route)}
  </main>
  <footer class="site-footer page-plain">
    <nav class="footer-links" aria-label="Rechtliches · Legal">
      <a href="${PAGES.imprint.de}" lang="de">${esc(t(data.imprint.title, "de"))}</a>
      <a href="${PAGES.imprint.en}" lang="en">${esc(t(data.imprint.title, "en"))}</a>
    </nav>
  </footer>`;
  }
  return `<a class="skip-link visually-hidden-focusable" href="#main">${de ? "Zum Inhalt springen" : "Skip to content"}</a>
  ${renderNav(route.lang, route.key)}
  <main id="main" class="container-fluid p-0" tabindex="-1">
    ${main(route)}
  </main>
  ${renderFooter(route.lang, route.key)}`;
}

export function renderPage(route: Route, { dev = false } = {}): string {
  resetIcons();
  const content = body(route);
  const sprite = route.key === "root" ? "" : renderSprite();
  const scripts =
    route.key === "root"
      ? ROOT_REDIRECT
      : `${THEME_BOOT}${dev ? `\n  ${DEV_LOADER}` : ""}
  <!-- App entry: Vite bundles Bootstrap, the SCSS theme and the site scripts -->
  <script type="module" src="/src/main.ts"></script>`;
  const bodyAttrs =
    route.key === "home"
      ? ' id="page-top" data-bs-spy="scroll" data-bs-target="#sideNav" data-bs-offset="54"'
      : route.key === "notFound"
        ? ' class="page-plain"'
        : ' id="page-top"';
  // resolve() expands the {{TOKEN}} placeholders (booking link, e-mails, phone)
  // once over the finished HTML.
  return resolve(`<!DOCTYPE html>
<html lang="${route.lang}">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${head(route)}
  ${scripts}
</head>

<body${bodyAttrs}>
  ${sprite}
  ${dev && route.key !== "root" ? '<div id="app-loader" aria-hidden="true"></div>' : ""}
  ${content}
</body>

</html>
`);
}

// sitemap.xml with the language alternates of every page.
export function renderSitemap(): string {
  const urls = (Object.keys(PAGES) as PageKey[]).flatMap((key) =>
    LANGS.map((lang) => {
      const alternates = LANGS.map(
        (l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${PAGES[key][l]}"/>`,
      ).join("");
      return `<url><loc>${SITE_URL}${PAGES[key][lang]}</loc>${alternates}</url>`;
    }),
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
}

// vCard 3.0 for the "Save contact" button in the contact section.
export function renderVCard(): string {
  const escape = (value: string) => value.replace(/([\\,;])/g, "\\$1");
  const [prefix, given, ...additional] = data.meta.name.pre.split(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escape(data.meta.name.highlight)};${escape(given)};${escape(additional.join(" "))};${escape(prefix)};${escape(data.meta.name.post)}`,
    `FN:${escape(fullName())}`,
    `TITLE:${escape(JOB_TITLE)}`,
    `EMAIL;TYPE=INTERNET,WORK:${LINKS.EMAIL_DIRECT}`,
    `TEL;TYPE=CELL,VOICE:${LINKS.PHONE}`,
    `ADR;TYPE=WORK:;;${escape(ADDRESS.street)};${escape(ADDRESS.locality.de)};;${ADDRESS.postalCode};${escape(ADDRESS.country.de)}`,
    `URL:${SITE_URL}/`,
    ...data.social.map((s) => `X-SOCIALPROFILE;TYPE=${s.label.toLowerCase()}:${s.href}`),
    "END:VCARD",
  ];
  return `${lines.join("\r\n")}\r\n`;
}

// Files generated next to the pages: emitted into dist/ by the build and served
// by the dev server.
export function generatedFiles(): Record<string, { type: string; body: string }> {
  return {
    "sitemap.xml": { type: "application/xml", body: renderSitemap() },
    "fabian-steiner.vcf": { type: "text/vcard", body: renderVCard() },
  };
}
