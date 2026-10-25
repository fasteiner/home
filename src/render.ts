// Build-time renderer: turns resume.json into the page HTML for one language.
// Used by src/page.ts (via the Vite plugin in vite.config.ts) to prerender the
// /en/ and /de/ pages, the legal pages, the CV and the 404 page.

import { readFileSync } from "node:fs";
import resumeData from "./data/resume.json";
import { LINKS } from "./config";
import { icon } from "./icons";

export type Lang = "en" | "de";
export type PageKey = "home" | "imprint" | "privacy" | "cv";

export interface L {
  en: string;
  de: string;
}
interface LinkRef {
  href: string;
  label: L;
}
interface Org {
  name: L;
  href?: string;
}
interface ExperienceItem {
  role: L;
  org: Org;
  reference?: LinkRef;
  date: L;
  bullets?: L[];
  summary?: L;
}
interface EduItem {
  school: { name: string; href: string };
  subtitle: L;
  detail?: { text: L; href?: string };
  date: L;
}
interface SkillGroup {
  name: L;
  icons?: { icon: string; label: string }[];
  items: L[];
}
interface Project {
  title: string;
  image?: string;
  imageAlt?: string;
  icon?: string;
  primaryHref: string;
  repo?: string;
  desc: L;
  button: { label: L; href: string };
  badges?: { src: string; alt: string }[];
}
interface Contribution {
  title: string;
  icon: string;
  href: string;
  button: L;
  tech: L;
  date: L;
  summary: L;
  bullets: L[];
}
interface Interest {
  name: L;
  text: L;
  image?: string;
  icon?: string;
  href?: string;
}
interface Cert {
  text: L;
  link?: LinkRef;
}
interface DocItem {
  href: string | L;
  label: L;
}
interface Service {
  icon: string;
  delivery: "direct" | "techwork";
  title: L;
  desc: L;
  points: L[];
}
interface ImprintRow {
  label?: L;
  value: string | L;
  href?: string;
  link?: { prefix: L; label: string; href: string };
}
interface Imprint {
  title: L;
  responsible: L;
  name: string;
  address: L;
  rows: ImprintRow[];
}
interface PrivacySection {
  heading: L;
  body: L[];
}
interface Privacy {
  title: L;
  intro: L;
  updated: L;
  sections: PrivacySection[];
}
interface ContactAction {
  type: "primary" | "outline";
  icon: string;
  href: string;
  label: L;
  external?: boolean;
  download?: boolean;
}
interface ContactChannel {
  icon: string;
  label: string | L;
  value: string | L;
  href?: string;
  external?: boolean;
}
interface PageMeta {
  title: L;
  description: L;
}
export interface ResumeData {
  meta: {
    name: { pre: string; highlight: string; post: string };
    shortName: string;
    profileImage: string;
    tagline: L;
    lead: L;
    cta: { icon: string; label: L };
  };
  pages: Record<PageKey, PageMeta> & { notFound: { title: L; text: L; button: L } };
  cv: { title: L; profile: L; download: L; pdf: L; website: L };
  nav: { id: string; label: L }[];
  social: { href: string; icon: string; label: string }[];
  services: {
    title: L;
    lead: L;
    deliveryNote: L;
    viaLabel: L;
    viaHref: string;
    cta: { text: L; label: L };
    items: Service[];
  };
  contact: { title: L; lead: L; actions: ContactAction[]; channels: ContactChannel[] };
  experience: {
    title: L;
    items: ExperienceItem[];
    earlier: { title: L; items: ExperienceItem[] };
  };
  education: { title: L; items: EduItem[] };
  skills: { title: L; groups: SkillGroup[] };
  projects: { title: L; items: Project[] };
  contributions: { title: L; lead: L; contributedLabel: L; items: Contribution[] };
  interests: { title: L; items: Interest[] };
  certifications: { title: L; items: Cert[] };
  documents: { title: L; items: DocItem[] };
  imprint: Imprint;
  privacy: Privacy;
}

export const data = resumeData as unknown as ResumeData;

const TARGET = 'rel="noopener noreferrer" target="_blank"';

// Localised paths for the main page, the legal pages and the CV, keyed by page
// and language. Used for the sidebar links, the language switch, the footer,
// the Vite inputs and the sitemap.
export const PAGES: Record<PageKey, L> = {
  home: { en: "/en/", de: "/de/" },
  imprint: { en: "/en/imprint/", de: "/de/impressum/" },
  privacy: { en: "/en/privacy/", de: "/de/datenschutz/" },
  cv: { en: "/en/cv/", de: "/de/lebenslauf/" },
};

// Expand {{TOKEN}} placeholders (booking link, e-mail addresses, phone) from
// src/config.ts. Applied once to the finished page HTML by the Vite plugin, so
// each of those literals is defined in exactly one place.
export function resolve(html: string): string {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key: string) => LINKS[key] ?? match);
}

export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function t(value: L, lang: Lang): string {
  return value[lang];
}

// Resolve a value that may be a plain string (language-neutral, e.g. "GitHub")
// or a localised { en, de } pair.
function tv(value: string | L, lang: Lang): string {
  return typeof value === "string" ? value : value[lang];
}

// Make a relative img/ or download/ path absolute so it resolves from /en/ and /de/.
export function asset(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return `/${path}`;
}

export function fullName(): string {
  const { pre, highlight, post } = data.meta.name;
  return `${pre} ${highlight} ${post}`;
}

// Intrinsic size of an image in public/ (SVG, PNG or WebP), so every <img> can
// reserve its space with width/height attributes before it loads.
function imageSize(src: string): { width: number; height: number } {
  const relative = decodeURIComponent(asset(src)).slice(1);
  const file = readFileSync(new URL(`../public/${relative}`, import.meta.url));
  if (file.toString("latin1", 1, 4) === "PNG") {
    return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
  }
  if (file.toString("latin1", 0, 4) === "RIFF" && file.toString("latin1", 8, 12) === "WEBP") {
    const chunk = file.toString("latin1", 12, 16);
    if (chunk === "VP8X") {
      return { width: 1 + file.readUIntLE(24, 3), height: 1 + file.readUIntLE(27, 3) };
    }
    if (chunk === "VP8L") {
      const bits = file.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
    return { width: file.readUInt16LE(26) & 0x3fff, height: file.readUInt16LE(28) & 0x3fff };
  }
  const svg = file.toString("utf8");
  const root = svg.match(/<svg[^>]*>/)?.[0] ?? "";
  const width = root.match(/\swidth="([\d.]+)"/)?.[1];
  const height = root.match(/\sheight="([\d.]+)"/)?.[1];
  if (width && height) return { width: Math.round(+width), height: Math.round(+height) };
  const viewBox = root.match(/viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"/);
  if (viewBox) return { width: Math.round(+viewBox[1]), height: Math.round(+viewBox[2]) };
  throw new Error(`Cannot determine the size of ${src}`);
}

// An <img> with its intrinsic width/height, lazily loaded unless told otherwise.
export function img(src: string, attrs: string, eager = false): string {
  const { width, height } = imageSize(src);
  const loading = eager ? "" : ' loading="lazy"';
  return `<img src="${asset(src)}" width="${width}" height="${height}" ${attrs}${loading} decoding="async">`;
}

function section(id: string, title: string | null, body: string): string {
  const heading = title ? `<h2 class="mb-5">${esc(title)}</h2>` : "";
  return `<section class="resume-section p-3 p-lg-5 d-flex flex-column" id="${id}">
  <div class="my-auto">${heading}${body}</div>
</section>`;
}

function checkList(items: L[], lang: Lang, cls: string, iconCls = "text-primary"): string {
  const points = items
    .map((p) => `<li>${icon(`fa-li fa fa-check ${iconCls}`)} ${esc(t(p, lang))}</li>`)
    .join("");
  return `<ul class="fa-ul ${cls}">${points}</ul>`;
}

function renderAbout(lang: Lang): string {
  const { name, tagline, lead, cta } = data.meta;
  const social = data.social
    .map(
      (s) =>
        `<a href="${s.href}" ${TARGET} aria-label="${esc(s.label)}" title="${esc(s.label)}">${icon(s.icon)}</a>`,
    )
    .join("\n");
  const body = `<h1 class="mb-0">${esc(name.pre)}
    <span class="text-primary">${esc(name.highlight)}</span>
    ${esc(name.post)}</h1>
  <p class="subheading hero-tagline">${esc(t(tagline, lang))}</p>
  <p class="lead hero-lead">${esc(t(lead, lang))}</p>
  <div class="about-actions">
    <a href="#contact" class="btn btn-primary btn-lg js-scroll-trigger">${icon(`${cta.icon} me-2`)}${esc(t(cta.label, lang))}</a>
    <div class="social-icons">${social}</div>
  </div>`;
  return section("about", null, body);
}

function renderServices(lang: Lang): string {
  const lead = `<p class="lead mb-3">${esc(t(data.services.lead, lang))}</p>`;
  const note = `<p class="services-delivery-note text-body-secondary mb-5">${esc(
    t(data.services.deliveryNote, lang),
  )}</p>`;
  const viaLabel = esc(t(data.services.viaLabel, lang));
  const cards = data.services.items
    .map((s) => {
      // Direct services render unchanged; techwork services carry a labelled
      // pill (text, not colour alone) that links to the delivery partner.
      const badge =
        s.delivery === "techwork"
          ? `\n        <a class="provider-badge" href="${data.services.viaHref}" ${TARGET}>${icon("fas fa-handshake me-1")}${viaLabel}</a>`
          : "";
      return `<div class="col-md-6 col-lg-4 mb-4">
    <div class="card service-card h-100 shadow-sm border-0">
      <div class="card-body">
        <div class="service-icon mb-3">${icon(s.icon)}</div>
        <h3 class="card-title">${esc(t(s.title, lang))}</h3>${badge}
        <p class="card-text">${esc(t(s.desc, lang))}</p>
        ${checkList(s.points, lang, "service-points mb-0")}
      </div>
    </div>
  </div>`;
    })
    .join("\n");
  // Call to action after the offer: the point where a visitor decides.
  const cta = `<div class="services-cta">
    <p class="lead mb-0">${esc(t(data.services.cta.text, lang))}</p>
    <a href="#contact" class="btn btn-primary btn-lg js-scroll-trigger">${esc(t(data.services.cta.label, lang))}</a>
  </div>`;
  return section(
    "services",
    t(data.services.title, lang),
    `${lead}${note}<div class="row">${cards}</div>${cta}`,
  );
}

function experienceItem(item: ExperienceItem, lang: Lang): string {
  const org = item.org.href
    ? `<a href="${item.org.href}" ${TARGET}>${esc(t(item.org.name, lang))}</a>`
    : esc(t(item.org.name, lang));
  const ref = item.reference
    ? ` &nbsp;&nbsp;| <a href="${asset(item.reference.href)}" class="reference-link" ${TARGET}>${esc(
        t(item.reference.label, lang),
      )}</a>`
    : "";
  let detail = "";
  if (item.bullets) {
    detail = `<ul>${item.bullets.map((b) => `<li>${t(b, lang)}</li>`).join("")}</ul>`;
  } else if (item.summary) {
    detail = `<p>${esc(t(item.summary, lang))}</p>`;
  }
  return `<div class="resume-item d-flex flex-column flex-md-row mb-5">
    <div class="resume-content me-auto">
      <h3 class="mb-0">${esc(t(item.role, lang))}</h3>
      <div class="subheading mb-3">${org}${ref}</div>
      ${detail}
    </div>
    <div class="resume-date text-md-end"><span class="text-primary">${esc(t(item.date, lang))}</span></div>
  </div>`;
}

function renderExperience(lang: Lang): string {
  const { items, earlier } = data.experience;
  const recent = items.map((item) => experienceItem(item, lang)).join("\n");
  // Older internships and short jobs sit in a native disclosure: closed by
  // default, keyboard and screen-reader friendly, and open without JS.
  const older = `<details class="earlier-positions">
    <summary>${esc(t(earlier.title, lang))} (${earlier.items.length})</summary>
    ${earlier.items.map((item) => experienceItem(item, lang)).join("\n")}
  </details>`;
  return section("experience", t(data.experience.title, lang), `${recent}\n${older}`);
}

function renderEducation(lang: Lang): string {
  const items = data.education.items
    .map((item) => {
      let detail = "";
      if (item.detail) {
        const text = esc(t(item.detail.text, lang));
        detail = item.detail.href
          ? `<div><a href="${item.detail.href}" ${TARGET}>${text}</a></div>`
          : `<div>${text}</div>`;
      }
      return `<div class="resume-item d-flex flex-column flex-md-row mb-5">
    <div class="resume-content me-auto">
      <h3 class="mb-0"><a href="${item.school.href}" ${TARGET}>${esc(item.school.name)}</a></h3>
      <div class="subheading mb-3">${esc(t(item.subtitle, lang))}</div>
      ${detail}
    </div>
    <div class="resume-date text-md-end"><span class="text-primary">${esc(t(item.date, lang))}</span></div>
  </div>`;
    })
    .join("\n");
  return section("education", t(data.education.title, lang), items);
}

function renderSkills(lang: Lang): string {
  const groups = data.skills.groups
    .map((group) => {
      // Icons always carry a visible label, so the skill is readable (and
      // announced) without recognising the logo.
      const icons = group.icons
        ? `<ul class="list-inline dev-icons">${group.icons
            .map(
              (i) =>
                `<li class="list-inline-item">${icon(i.icon)}<span class="dev-icon-label">${esc(i.label)}</span></li>`,
            )
            .join("")}</ul>`
        : "";
      const items = group.items.length ? checkList(group.items, lang, "mb-0", "") : "";
      return `<div class="skill-group"><h3 class="subheading mb-3">${esc(t(group.name, lang))}</h3>${icons}${items}</div>`;
    })
    .join("\n");
  return section("skills", t(data.skills.title, lang), groups);
}

function renderProjects(lang: Lang): string {
  const cards = data.projects.items
    .map((p) => {
      const media = p.image
        ? img(p.image, `class="card-img-top p-4" alt="${esc(p.imageAlt ?? p.title)}"`)
        : `<div class="card-img-top d-flex align-items-center justify-content-center">${icon(`${p.icon} fa-4x text-primary`)}</div>`;
      // Icon headers have no alt text to name the link, so label it.
      const mediaLabel = p.image ? "" : ` aria-label="${esc(p.title)}"`;
      const repo = p.repo
        ? `\n        <a href="${p.repo}" ${TARGET} class="ms-2 text-body" title="View on GitHub" aria-label="${esc(p.title)} on GitHub">${icon("fab fa-github")}</a>`
        : "";
      const badges = p.badges
        ? `<div>${p.badges
            .map((b) => img(b.src, `alt="${esc(b.alt)}" title="${esc(b.alt)}"`))
            .join("")}</div>`
        : "";
      return `<div class="col-md-6 col-lg-4 mb-4">
    <div class="card h-100 shadow-sm border-0">
      <a href="${p.primaryHref}" ${TARGET}${mediaLabel}>${media}</a>
      <div class="card-body">
        <h3 class="card-title">${esc(p.title)}${repo}</h3>
        <p class="card-text">${esc(t(p.desc, lang))}</p>
        <a href="${p.button.href}" ${TARGET} class="btn btn-primary mb-2">${esc(t(p.button.label, lang))}</a>
        ${badges}
      </div>
    </div>
  </div>`;
    })
    .join("\n");
  return section("projects", t(data.projects.title, lang), `<div class="row">${cards}</div>`);
}

// Other people's projects I contribute to — project-style cards (icon header,
// button to the upstream repository) with a check list of my contributions.
function renderContributions(lang: Lang): string {
  const lead = `<p class="lead mb-5">${esc(t(data.contributions.lead, lang))}</p>`;
  const contributedLabel = esc(t(data.contributions.contributedLabel, lang));
  const cards = data.contributions.items
    .map((c) => {
      return `<div class="col-lg-6 mb-4">
    <div class="card contribution-card h-100 shadow-sm border-0">
      <a href="${c.href}" ${TARGET} aria-label="${esc(c.title)}"><div class="card-img-top d-flex align-items-center justify-content-center">${icon(`${c.icon} fa-4x text-primary`)}</div></a>
      <div class="card-body">
        <h3 class="card-title">${esc(c.title)}</h3>
        <p class="contribution-meta">${esc(t(c.tech, lang))} · <span class="text-primary">${esc(t(c.date, lang))}</span></p>
        <p class="card-text">${esc(t(c.summary, lang))}</p>
        <h4 class="contribution-heading">${contributedLabel}</h4>
        ${checkList(c.bullets, lang, "contribution-points")}
        <a href="${c.href}" ${TARGET} class="btn btn-primary">${esc(t(c.button, lang))}</a>
      </div>
    </div>
  </div>`;
    })
    .join("\n");
  return section(
    "contributions",
    t(data.contributions.title, lang),
    `${lead}<div class="row">${cards}</div>`,
  );
}

function renderInterests(lang: Lang): string {
  const items = data.interests.items
    .map((i) => {
      const text = esc(t(i.text, lang));
      const caption = text ? `<p class="mb-0">${text}</p>` : "";
      // Hobbies without a photo get a branded tile with a large icon instead.
      const media = i.image
        ? img(i.image, 'class="img-fluid" alt=""')
        : `<span class="portfolio-icon">${icon(i.icon ?? "fas fa-star")}</span>`;
      const inner = `<span class="caption"><span class="caption-content">
        <h3>${esc(t(i.name, lang))}</h3>
        ${caption}
      </span></span>
      ${media}`;
      // Only tiles with a destination are links; the rest are plain tiles.
      const tile = i.href
        ? `<a class="portfolio-item" href="${i.href}" ${TARGET}>${inner}</a>`
        : `<div class="portfolio-item">${inner}</div>`;
      return `<div class="col-lg-6">
    ${tile}
  </div>`;
    })
    .join("\n");
  // Centre a last tile that is left on its own in the two-column grid.
  return section(
    "interests",
    t(data.interests.title, lang),
    `<div class="row g-0 justify-content-center">${items}</div>`,
  );
}

function renderCertifications(lang: Lang): string {
  const items = data.certifications.items
    .map((c) => {
      const link = c.link
        ? ` <a href="${asset(c.link.href)}" ${TARGET}>${esc(t(c.link.label, lang))}</a>`
        : "";
      return `<li>${icon("fa-li fa fa-trophy text-warning")} ${esc(t(c.text, lang))}${link}</li>`;
    })
    .join("\n");
  return section(
    "awards",
    t(data.certifications.title, lang),
    `<ul class="fa-ul mb-0">${items}</ul>`,
  );
}

function renderDocuments(lang: Lang): string {
  const items = data.documents.items
    .map(
      (
        d,
      ) => `<a href="${asset(tv(d.href, lang))}" class="list-group-item list-group-item-action d-flex align-items-center gap-3" ${TARGET}>
    ${icon("fas fa-file-pdf fa-fw text-primary")}
    <span class="flex-grow-1">${esc(t(d.label, lang))}</span>
    ${icon("fas fa-arrow-up-right-from-square small text-body-secondary")}
  </a>`,
    )
    .join("\n");
  return section(
    "documents",
    t(data.documents.title, lang),
    `<div class="list-group shadow-sm">${items}</div>`,
  );
}

function renderContact(lang: Lang): string {
  const c = data.contact;
  const lead = `<p class="lead mb-4">${esc(t(c.lead, lang))}</p>`;
  const actions = c.actions
    .map((a) => {
      const cls = a.type === "primary" ? "btn btn-primary" : "btn btn-outline-primary";
      const target = a.external ? ` ${TARGET}` : "";
      const download = a.download ? " download" : "";
      return `<a href="${a.href}"${target}${download} class="${cls} btn-lg me-3 mb-3">${icon(`${a.icon} me-2`)}${esc(
        t(a.label, lang),
      )}</a>`;
    })
    .join("");
  const channels = c.channels
    .map((ch) => {
      const label = esc(tv(ch.label, lang));
      const value = esc(tv(ch.value, lang));
      const inner = `${icon(`${ch.icon} fa-fw contact-icon`)}
      <span class="contact-text"><span class="contact-label">${label}</span><span class="contact-value">${value}</span></span>`;
      return ch.href
        ? `<a href="${ch.href}"${ch.external ? ` ${TARGET}` : ""} class="contact-channel">${inner}</a>`
        : `<div class="contact-channel">${inner}</div>`;
    })
    .join("\n");
  const body = `${lead}
  <div class="contact-actions mb-5">${actions}</div>
  <div class="contact-channels">${channels}</div>`;
  return section("contact", t(c.title, lang), body);
}

const THEME_LABELS = {
  system: { en: "System", de: "System" },
  light: { en: "Light", de: "Hell" },
  dark: { en: "Dark", de: "Dunkel" },
};

// The sidebar (desktop) / top navbar (mobile): brand, section links, theme and
// language switch.
export function renderNav(lang: Lang, page: PageKey = "home"): string {
  const de = lang === "de";
  // On the main page the section links are in-page anchors (#services); on the
  // other pages they point back to the same section on the main page
  // (/en/#services) so the sidebar keeps working as a table of contents.
  const sectionHref = (id: string) => (page === "home" ? `#${id}` : `${PAGES.home[lang]}#${id}`);
  const links = data.nav
    .map(
      (n) =>
        `<li class="nav-item"><a class="nav-link js-scroll-trigger" href="${sectionHref(n.id)}">${esc(t(n.label, lang))}</a></li>`,
    )
    .join("\n");

  const themeOptions = (["system", "light", "dark"] as const)
    .map((v) => `<option value="${v}">${esc(THEME_LABELS[v][lang])}</option>`)
    .join("");

  const brandHref = page === "home" ? "#page-top" : PAGES.home[lang];
  const brandLabel =
    page === "home" ? (de ? "nach oben" : "back to top") : de ? "Startseite" : "home";
  const photo = img(
    data.meta.profileImage,
    'class="img-fluid img-profile rounded-circle mx-auto mb-2" alt=""',
  );

  // The language switch maps to the equivalent page in the other language
  // (e.g. /en/imprint/ <-> /de/impressum/), not just the home page.
  return `<nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top" id="sideNav" aria-label="${de ? "Hauptnavigation" : "Main navigation"}">
    <a class="navbar-brand js-scroll-trigger" href="${brandHref}" aria-label="${esc(data.meta.shortName)} — ${brandLabel}">
      <span class="d-block d-lg-none">${esc(data.meta.shortName)}</span>
      <span class="d-none d-lg-block">${photo}</span>
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="${de ? "Navigation umschalten" : "Toggle navigation"}">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav">
  ${links}
  <li class="nav-item">
    <div class="theme-switcher">
      <select id="theme-select" aria-label="${de ? "Designauswahl" : "Theme switcher"}" class="form-select form-select-sm mt-3">${themeOptions}</select>
    </div>
  </li>
  <li class="nav-item">
    <div class="lang-switch" role="group" aria-label="${de ? "Sprache" : "Language"}">
      <a href="${PAGES[page].en}" hreflang="en" lang="en" class="lang-option"${lang === "en" ? ' aria-current="true"' : ""}>EN</a>
      <a href="${PAGES[page].de}" hreflang="de" lang="de" class="lang-option"${lang === "de" ? ' aria-current="true"' : ""}>DE</a>
    </div>
  </li>
      </ul>
    </div>
  </nav>`;
}

export function renderContent(lang: Lang): string {
  return [
    renderAbout(lang),
    renderServices(lang),
    renderExperience(lang),
    renderEducation(lang),
    renderSkills(lang),
    renderProjects(lang),
    renderContributions(lang),
    renderInterests(lang),
    renderCertifications(lang),
    renderDocuments(lang),
    renderContact(lang),
  ].join('\n\n    <hr class="m-0">\n\n    ');
}

// Site footer with the legal links (imprint + privacy) and a copyright line.
// Appended to every page, so the legal notices are reachable from anywhere.
export function renderFooter(lang: Lang, page: PageKey = "home"): string {
  const year = new Date().getFullYear();
  const navAria = lang === "de" ? "Rechtliches" : "Legal";
  const current = (p: PageKey) => (page === p ? ' aria-current="page"' : "");
  return `<footer class="site-footer">
    <nav class="footer-links" aria-label="${navAria}">
      <a href="${PAGES.imprint[lang]}"${current("imprint")}>${esc(t(data.imprint.title, lang))}</a>
      <a href="${PAGES.privacy[lang]}"${current("privacy")}>${esc(t(data.privacy.title, lang))}</a>
    </nav>
    <p class="footer-copy mb-0">© ${year} ${esc(fullName())}</p>
  </footer>`;
}

// Legal pages are standalone documents (no About section), so their title is
// the page <h1> — which keeps the heading order valid. They deliberately avoid
// the .resume-section class so the scrollspy / section-nav / lang-switch scripts
// stay inert, and use plain markup so the content is always visible without JS.
export function renderImprint(lang: Lang): string {
  const im = data.imprint;
  const rows = im.rows
    .map((r) => {
      let value = esc(tv(r.value, lang));
      if (r.href) value = `<a href="${r.href}">${value}</a>`;
      if (r.link) {
        value += ` ${esc(t(r.link.prefix, lang))} <a href="${r.link.href}" ${TARGET}>${esc(
          r.link.label,
        )}</a>`;
      }
      const label = r.label ? `<span class="legal-label">${esc(t(r.label, lang))}</span>` : "";
      const rowClass = r.label ? "legal-row" : "legal-row legal-row--statement";
      return `<div class="${rowClass}">${label}<span class="legal-value">${value}</span></div>`;
    })
    .join("\n");
  const body = `<p class="subheading mb-4">${esc(t(im.responsible, lang))}</p>
    <p class="lead mb-1">${esc(im.name)}</p>
    <p class="mb-4">${esc(t(im.address, lang))}</p>
    <div class="legal-list">${rows}</div>`;
  return `<section class="legal-section p-3 p-lg-5">
  <div class="legal-content">
    <h1 class="mb-4">${esc(t(im.title, lang))}</h1>
    ${body}
  </div>
</section>`;
}

export function renderPrivacy(lang: Lang): string {
  const pv = data.privacy;
  const sections = pv.sections
    .map((s) => {
      const paras = s.body.map((p) => `<p>${esc(t(p, lang))}</p>`).join("\n      ");
      return `<h2 class="h4 mt-5 mb-3">${esc(t(s.heading, lang))}</h2>\n      ${paras}`;
    })
    .join("\n      ");
  return `<section class="legal-section p-3 p-lg-5">
  <div class="legal-content">
    <h1 class="mb-4">${esc(t(pv.title, lang))}</h1>
    <p class="lead">${esc(t(pv.intro, lang))}</p>
      ${sections}
    <p class="text-body-secondary mt-5">${esc(t(pv.updated, lang))}</p>
  </div>
</section>`;
}

// The CV: a compact, print-ready summary of the whole résumé (every position,
// including the earlier ones). The pipeline prints it to the PDF that the
// Documents section offers (see scripts/build-pdf.mjs).
export function renderCv(lang: Lang): string {
  const cv = data.cv;
  const contact = data.contact.channels.filter((c) => c.href);
  const contactList = [
    `<li>${icon("fas fa-envelope fa-fw")} <a href="mailto:{{EMAIL_DIRECT}}">{{EMAIL_DIRECT}}</a></li>`,
    `<li>${icon("fas fa-phone fa-fw")} <a href="tel:${LINKS.PHONE.replace(/\s/g, "")}">{{PHONE}}</a></li>`,
    `<li>${icon("fas fa-globe fa-fw")} <a href="${PAGES.home[lang]}">fabian.stei-ner.net</a></li>`,
    ...contact
      .filter((c) => c.external)
      .map(
        (c) =>
          `<li>${icon(`${c.icon} fa-fw`)} <a href="${c.href}" ${TARGET}>${esc(c.href!.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a></li>`,
      ),
  ].join("");

  const entry = (title: string, meta: string, date: string, body: string) =>
    `<div class="cv-entry">
      <div class="cv-entry-head"><h3>${title}</h3><span class="cv-date">${esc(date)}</span></div>
      ${meta ? `<p class="cv-meta">${meta}</p>` : ""}
      ${body}
    </div>`;

  const experience = [...data.experience.items, ...data.experience.earlier.items]
    .map((item) => {
      const detail = item.bullets
        ? `<ul>${item.bullets.map((b) => `<li>${t(b, lang)}</li>`).join("")}</ul>`
        : item.summary
          ? `<p>${esc(t(item.summary, lang))}</p>`
          : "";
      return entry(
        esc(t(item.role, lang)),
        esc(t(item.org.name, lang)),
        t(item.date, lang),
        detail,
      );
    })
    .join("");

  const education = data.education.items
    .map((item) =>
      entry(
        esc(item.school.name),
        esc(t(item.subtitle, lang)),
        t(item.date, lang),
        item.detail ? `<p>${esc(t(item.detail.text, lang))}</p>` : "",
      ),
    )
    .join("");

  const skills = data.skills.groups
    .map((g) => {
      const names = [...(g.icons ?? []).map((i) => i.label), ...g.items.map((i) => t(i, lang))];
      return `<dt>${esc(t(g.name, lang))}</dt><dd>${esc(names.join(", "))}</dd>`;
    })
    .join("");

  const certs = data.certifications.items.map((c) => `<li>${esc(t(c.text, lang))}</li>`).join("");

  const projects = data.projects.items
    .map(
      (p) =>
        `<li><strong>${esc(p.title)}</strong> – ${esc(t(p.desc, lang))} <span class="cv-link">${esc(p.button.href.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""))}</span></li>`,
    )
    .join("");

  const contributions = data.contributions.items
    .map(
      (c) =>
        `<li><strong>${esc(c.title)}</strong> (${esc(t(c.tech, lang))}, ${esc(t(c.date, lang))}) – ${esc(t(c.summary, lang))}</li>`,
    )
    .join("");

  const block = (title: L | string, body: string) =>
    `<section class="cv-section"><h2>${esc(typeof title === "string" ? title : t(title, lang))}</h2>${body}</section>`;

  return `<article class="cv p-3 p-lg-5">
  <header class="cv-header">
    <div class="cv-heading">
      <p class="cv-kicker">${esc(t(cv.title, lang))}</p>
      <h1>${esc(fullName())}</h1>
      <p class="cv-tagline">${esc(t(data.meta.tagline, lang))}</p>
      <ul class="cv-contact">${contactList}</ul>
    </div>
    ${img(data.meta.profileImage, 'class="cv-photo rounded-circle" alt=""', true)}
  </header>
  <p class="cv-actions d-print-none"><a class="btn btn-primary" href="${asset(t(cv.pdf, lang))}" download>${icon("fas fa-file-arrow-down me-2")}${esc(t(cv.download, lang))}</a></p>
  ${block(cv.profile, `<p>${esc(t(data.meta.lead, lang))}</p>`)}
  ${block(data.experience.title, experience)}
  ${block(data.education.title, education)}
  ${block(data.skills.title, `<dl class="cv-skills">${skills}</dl>`)}
  ${block(data.certifications.title, `<ul>${certs}</ul>`)}
  ${block(data.projects.title, `<ul class="cv-list">${projects}</ul>`)}
  ${block(data.contributions.title, `<ul class="cv-list">${contributions}</ul>`)}
</article>`;
}

// The bilingual 404 page (GitHub Pages serves /404.html for unknown paths, so
// the visitor's language is unknown).
export function renderNotFound(): string {
  const nf = data.pages.notFound;
  const block = (lang: Lang) => `<div class="not-found-block" lang="${lang}">
      <h2>${esc(t(nf.title, lang))}</h2>
      <p>${esc(t(nf.text, lang))}</p>
      <a class="btn btn-primary" href="${PAGES.home[lang]}">${esc(t(nf.button, lang))}</a>
    </div>`;
  return `<section class="not-found p-3 p-lg-5">
    <h1><span class="text-primary">404</span> <span class="visually-hidden">${esc(t(nf.title, "de"))} · ${esc(t(nf.title, "en"))}</span></h1>
    <div class="not-found-blocks">${block("de")}${block("en")}</div>
  </section>`;
}
