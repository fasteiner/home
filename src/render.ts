// Build-time renderer: turns resume.json into the page HTML for one language.
// Used by the Vite plugin (see vite.config.ts) to prerender /en/ and /de/.

import resumeData from "./data/resume.json";

export type Lang = "en" | "de";

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
interface ResumeData {
  meta: {
    name: { pre: string; highlight: string; post: string };
    shortName: string;
    profileImage: string;
    lead: L;
  };
  nav: { id: string; label: L }[];
  social: { href: string; icon: string; label: string }[];
  experience: { title: L; items: ExperienceItem[] };
  education: { title: L; items: EduItem[] };
  skills: { title: L; groups: SkillGroup[] };
  projects: { title: L; items: Project[] };
  interests: { title: L; items: Interest[] };
  certifications: { title: L; items: Cert[] };
  documents: { title: L; items: DocItem[] };
}

const data = resumeData as unknown as ResumeData;

const TARGET = 'rel="noopener noreferrer" target="_blank"';

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function t(value: L, lang: Lang): string {
  return value[lang];
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
  return section(data.nav[1].id, t(data.experience.title, lang), items);
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

const THEME_LABELS = {
  system: { en: "System", de: "System" },
  light: { en: "Light", de: "Hell" },
  dark: { en: "Dark", de: "Dunkel" },
};

export function renderNav(lang: Lang): string {
  const links = data.nav
    .map(
      (n) =>
        `<li class="nav-item"><a class="nav-link js-scroll-trigger" href="#${n.id}">${esc(t(n.label, lang))}</a></li>`,
    )
    .join("\n");

  const themeOptions = (["system", "light", "dark"] as const)
    .map((v) => `<option value="${v}">${esc(THEME_LABELS[v][lang])}</option>`)
    .join("");

  const themeAria = lang === "de" ? "Designauswahl" : "Theme switcher";
  const langAria = lang === "de" ? "Sprache" : "Language";

  return `${links}
  <li class="nav-item">
    <div class="theme-switcher">
      <select id="theme-select" aria-label="${themeAria}" class="form-select form-select-sm mt-3">${themeOptions}</select>
    </div>
  </li>
  <li class="nav-item">
    <div class="lang-switch" role="group" aria-label="${langAria}">
      <a href="/en/" hreflang="en" class="lang-option"${lang === "en" ? ' aria-current="true"' : ""}>EN</a>
      <a href="/de/" hreflang="de" class="lang-option"${lang === "de" ? ' aria-current="true"' : ""}>DE</a>
    </div>
  </li>`;
}

export function renderContent(lang: Lang): string {
  return [
    renderAbout(lang),
    renderExperience(lang),
    renderEducation(lang),
    renderSkills(lang),
    renderProjects(lang),
    renderInterests(lang),
    renderCertifications(lang),
    renderDocuments(lang),
  ].join('\n\n    <hr class="m-0">\n\n    ');
}
