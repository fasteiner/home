// Build-time renderer: turns resume.json into the page HTML for one language.
// Used by the Vite plugin (see vite.config.ts) to prerender /en/ and /de/.

import resumeData from "./data/resume.json";
import { LINKS } from "./config";

export type Lang = "en" | "de";
export type PageKey = "home" | "imprint" | "privacy";

interface L {
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
  icons?: { type: "fa" | "img"; value?: string; src?: string }[];
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
interface Interest {
  name: L;
  text: L;
  image: string;
}
interface Cert {
  text: L;
  link?: LinkRef;
}
interface DocItem {
  href: string;
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
interface Privacy {
  title: L;
  placeholder: L;
}
interface ContactAction {
  type: "primary" | "outline";
  icon: string;
  href: string;
  label: L;
  external?: boolean;
}
interface ContactChannel {
  icon: string;
  label: string | L;
  value: string | L;
  href?: string;
  external?: boolean;
}
interface ResumeData {
  meta: {
    name: { pre: string; highlight: string; post: string };
    shortName: string;
    profileImage: string;
    lead: L;
  };
  nav: { id: string; label: L }[];
  social: { href: string; icon: string; label: string }[];
  services: { title: L; lead: L; deliveryNote: L; viaLabel: L; items: Service[] };
  contact: { title: L; lead: L; actions: ContactAction[]; channels: ContactChannel[] };
  experience: { title: L; items: ExperienceItem[] };
  education: { title: L; items: EduItem[] };
  skills: { title: L; groups: SkillGroup[] };
  projects: { title: L; items: Project[] };
  interests: { title: L; items: Interest[] };
  certifications: { title: L; items: Cert[] };
  documents: { title: L; items: DocItem[] };
  imprint: Imprint;
  privacy: Privacy;
}

const data = resumeData as unknown as ResumeData;

const TARGET = 'rel="noopener noreferrer" target="_blank"';

// Localised paths for the main page and the two legal pages, keyed by page and
// language. Used for the sidebar links, the language switch and the footer.
const PAGES: Record<PageKey, L> = {
  home: { en: "/en/", de: "/de/" },
  imprint: { en: "/en/imprint/", de: "/de/impressum/" },
  privacy: { en: "/en/privacy/", de: "/de/datenschutz/" },
};

// Expand {{TOKEN}} placeholders (booking link, e-mail addresses, phone) from
// src/config.ts. Applied once to the finished page HTML by the Vite plugin, so
// each of those literals is defined in exactly one place.
export function resolve(html: string): string {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key: string) => LINKS[key] ?? match);
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function t(value: L, lang: Lang): string {
  return value[lang];
}

// Resolve a value that may be a plain string (language-neutral, e.g. "GitHub")
// or a localised { en, de } pair.
function tv(value: string | L, lang: Lang): string {
  return typeof value === "string" ? value : value[lang];
}

// Make a relative img/ or download/ path absolute so it resolves from /en/ and /de/.
function asset(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return `/${path}`;
}

function section(id: string, title: string | null, body: string): string {
  const heading = title ? `<h2 class="mb-5">${esc(title)}</h2>` : "";
  return `<section class="resume-section p-3 p-lg-5 d-flex flex-column" id="${id}">
  <div class="my-auto">${heading}${body}</div>
</section>`;
}

function renderAbout(lang: Lang): string {
  const { name, lead } = data.meta;
  const social = data.social
    .map(
      (s) =>
        `<a href="${s.href}" ${TARGET} aria-label="${esc(s.label)}" title="${esc(s.label)}"><i class="${s.icon}" aria-hidden="true"></i></a>`,
    )
    .join("\n");
  const body = `<h1 class="mb-0">${esc(name.pre)}
    <span class="text-primary">${esc(name.highlight)}</span>
    ${esc(name.post)}</h1>
  <div class="subheading mb-5"></div>
  <p class="lead mb-5">${esc(t(lead, lang))}</p>
  <div class="social-icons">${social}</div>`;
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
      const points = s.points
        .map((p) => `<li><i class="fa-li fa fa-check text-primary"></i> ${esc(t(p, lang))}</li>`)
        .join("");
      // Direct services render unchanged; techwork services carry a labelled
      // pill (text, not colour alone) so the delivery partner is explicit.
      const badge =
        s.delivery === "techwork"
          ? `\n        <span class="provider-badge"><i class="fas fa-handshake me-1" aria-hidden="true"></i>${viaLabel}</span>`
          : "";
      return `<div class="col-md-6 col-lg-4 mb-4">
    <div class="card service-card h-100 shadow-sm border-0">
      <div class="card-body">
        <div class="service-icon mb-3"><i class="${s.icon}" aria-hidden="true"></i></div>
        <h3 class="card-title">${esc(t(s.title, lang))}</h3>${badge}
        <p class="card-text">${esc(t(s.desc, lang))}</p>
        <ul class="fa-ul service-points mb-0">${points}</ul>
      </div>
    </div>
  </div>`;
    })
    .join("\n");
  return section(
    "services",
    t(data.services.title, lang),
    `${lead}${note}<div class="row">${cards}</div>`,
  );
}

function renderExperience(lang: Lang): string {
  const items = data.experience.items
    .map((item) => {
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
    })
    .join("\n");
  return section("experience", t(data.experience.title, lang), items);
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
      const icons = group.icons
        ? `<ul class="list-inline dev-icons">${group.icons
            .map((icon) =>
              icon.type === "img"
                ? `<li class="list-inline-item"><img class="fab" src="${asset(icon.src ?? "")}" height="72px" alt="" loading="lazy" decoding="async"></li>`
                : `<li class="list-inline-item"><i class="${icon.value}"></i></li>`,
            )
            .join("")}</ul>`
        : "";
      const items = `<ul class="fa-ul mb-0">${group.items
        .map((item) => `<li><i class="fa-li fa fa-check"></i> ${esc(t(item, lang))}</li>`)
        .join("")}</ul>`;
      return `<div class="subheading mb-3">${esc(t(group.name, lang))}</div>${icons}${items}<br>`;
    })
    .join("\n");
  return section("skills", t(data.skills.title, lang), groups);
}

function renderProjects(lang: Lang): string {
  const cards = data.projects.items
    .map((p) => {
      const media = p.image
        ? `<img src="${asset(p.image)}" class="card-img-top p-4" alt="${esc(p.imageAlt ?? p.title)}" loading="lazy" decoding="async">`
        : `<div class="card-img-top d-flex align-items-center justify-content-center" style="height: 180px;"><i class="${p.icon} fa-4x text-primary"></i></div>`;
      const repo = p.repo
        ? `\n        <a href="${p.repo}" ${TARGET} class="ms-2 text-body" title="View on GitHub" aria-label="${esc(p.title)} on GitHub"><i class="fab fa-github" aria-hidden="true"></i></a>`
        : "";
      const badges = p.badges
        ? `<div>${p.badges
            .map(
              (b) =>
                `<img src="${b.src}" alt="${esc(b.alt)}" title="${esc(b.alt)}" loading="lazy" decoding="async">`,
            )
            .join("")}</div>`
        : "";
      return `<div class="col-md-6 col-lg-4 mb-4">
    <div class="card h-100 shadow-sm border-0">
      <a href="${p.primaryHref}" ${TARGET}>${media}</a>
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

function renderInterests(lang: Lang): string {
  const items = data.interests.items
    .map((i) => {
      const text = esc(t(i.text, lang));
      const caption = text ? `<p class="mb-0">${text}</p>` : "";
      return `<div class="col-lg-6">
    <a class="portfolio-item" href="#">
      <span class="caption"><span class="caption-content">
        <h3>${esc(t(i.name, lang))}</h3>
        ${caption}
      </span></span>
      <img class="img-fluid" src="${asset(i.image)}" alt="" loading="lazy" decoding="async">
    </a>
  </div>`;
    })
    .join("\n");
  return section("interests", t(data.interests.title, lang), `<div class="row g-0">${items}</div>`);
}

function renderCertifications(lang: Lang): string {
  const items = data.certifications.items
    .map((c) => {
      const link = c.link
        ? ` <a href="${asset(c.link.href)}" ${TARGET}>${esc(t(c.link.label, lang))}</a>`
        : "";
      return `<li><i class="fa-li fa fa-trophy text-warning"></i> ${esc(t(c.text, lang))}${link}</li>`;
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
      ) => `<a href="${asset(d.href)}" class="list-group-item list-group-item-action d-flex align-items-center gap-3" ${TARGET}>
    <i class="fas fa-file-pdf fa-fw text-primary"></i>
    <span class="flex-grow-1">${esc(t(d.label, lang))}</span>
    <i class="fas fa-arrow-up-right-from-square small text-secondary"></i>
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
      return `<a href="${a.href}"${target} class="${cls} btn-lg me-3 mb-3"><i class="${a.icon} me-2" aria-hidden="true"></i>${esc(
        t(a.label, lang),
      )}</a>`;
    })
    .join("");
  const channels = c.channels
    .map((ch) => {
      const label = esc(tv(ch.label, lang));
      const value = esc(tv(ch.value, lang));
      const inner = `<i class="${ch.icon} fa-fw contact-icon" aria-hidden="true"></i>
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

export function renderNav(lang: Lang, page: PageKey = "home"): string {
  // On the main page the section links are in-page anchors (#services); on a
  // legal subpage they point back to the same section on the main page
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

  const themeAria = lang === "de" ? "Designauswahl" : "Theme switcher";
  const langAria = lang === "de" ? "Sprache" : "Language";

  // The language switch maps to the equivalent page in the other language
  // (e.g. /en/imprint/ <-> /de/impressum/), not just the home page.
  return `${links}
  <li class="nav-item">
    <div class="theme-switcher">
      <select id="theme-select" aria-label="${themeAria}" class="form-select form-select-sm mt-3">${themeOptions}</select>
    </div>
  </li>
  <li class="nav-item">
    <div class="lang-switch" role="group" aria-label="${langAria}">
      <a href="${PAGES[page].en}" hreflang="en" class="lang-option"${lang === "en" ? ' aria-current="true"' : ""}>EN</a>
      <a href="${PAGES[page].de}" hreflang="de" class="lang-option"${lang === "de" ? ' aria-current="true"' : ""}>DE</a>
    </div>
  </li>`;
}

export function renderContent(lang: Lang): string {
  return [
    renderAbout(lang),
    renderServices(lang),
    renderExperience(lang),
    renderEducation(lang),
    renderSkills(lang),
    renderProjects(lang),
    renderInterests(lang),
    renderCertifications(lang),
    renderDocuments(lang),
    renderContact(lang),
  ].join('\n\n    <hr class="m-0">\n\n    ');
}

// Site footer with the legal links (imprint + privacy) and a copyright line.
// Appended to every page, so the legal notices are reachable from anywhere.
export function renderFooter(lang: Lang, page: PageKey = "home"): string {
  const name = `${data.meta.name.pre} ${data.meta.name.highlight} ${data.meta.name.post}`;
  const year = new Date().getFullYear();
  const navAria = lang === "de" ? "Rechtliches" : "Legal";
  const current = (p: PageKey) => (page === p ? ' aria-current="page"' : "");
  return `<footer class="site-footer">
    <nav class="footer-links" aria-label="${navAria}">
      <a href="${PAGES.imprint[lang]}"${current("imprint")}>${esc(t(data.imprint.title, lang))}</a>
      <a href="${PAGES.privacy[lang]}"${current("privacy")}>${esc(t(data.privacy.title, lang))}</a>
    </nav>
    <p class="footer-copy mb-0">© ${year} ${esc(name)}</p>
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
  return `<section class="legal-section p-3 p-lg-5">
  <div class="legal-content">
    <h1 class="mb-4">${esc(t(pv.title, lang))}</h1>
    <p class="lead">${esc(t(pv.placeholder, lang))}</p>
  </div>
</section>`;
}
