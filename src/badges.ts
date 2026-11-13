// Version and download badges of the project cards. They are drawn at build
// time from the PowerShell Gallery and PyPI with badge-maker, the renderer of
// shields.io, and served from this site, so visitors contact no third party.
// The daily CI build keeps the figures current.
import { makeBadge } from "badge-maker";

export interface Package {
  registry: "psgallery" | "pypi";
  id: string;
}

export interface Badge {
  src: string;
  alt: string;
  // Where the badge links to: the registry page (version) or the download
  // statistics (downloads).
  href: string;
  width: number;
  height: number;
}

interface Stats {
  label: string;
  alt: string;
  page: string;
  statsPage: string;
  version: string;
  downloads: number;
  perMonth: boolean;
}

const ATTEMPTS = 4;
const TIMEOUT_MS = 15_000;

async function get(url: string): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (error) {
      if (attempt === ATTEMPTS) {
        throw new Error(`${url}: ${(error as Error).message}`, { cause: error });
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }
  }
}

// The gallery's package-wide DownloadCount (the figure shields.io shows) has
// not been updated for a long time, so add up the count of every version.
async function psGallery(id: string): Promise<Stats> {
  let url: string | undefined =
    `https://www.powershellgallery.com/api/v2/FindPackagesById()?id='${encodeURIComponent(id)}'`;
  let downloads = 0;
  let stable: string | undefined;
  let newest: string | undefined;
  while (url) {
    const xml = await (await get(url)).text();
    for (const [entry] of xml.matchAll(/<entry[\s>][\s\S]*?<\/entry>/g)) {
      const field = (name: string) => entry.match(new RegExp(`<d:${name}\\b[^>]*>([^<]*)<`))?.[1];
      downloads += Number(field("VersionDownloadCount") ?? 0);
      if (field("IsLatestVersion") === "true") stable = field("Version");
      if (field("IsAbsoluteLatestVersion") === "true") newest = field("Version");
    }
    url = xml.match(/<link rel="next" href="([^"]+)"/)?.[1].replaceAll("&amp;", "&");
  }
  const version = stable ?? newest;
  if (!version) throw new Error(`${id} is not on the PowerShell Gallery`);
  return {
    label: "powershell gallery",
    alt: "PowerShell Gallery",
    page: `https://www.powershellgallery.com/packages/${id}/`,
    statsPage: `https://www.powershellgallery.com/stats/packages/${id}?groupby=Version`,
    version,
    downloads,
    perMonth: false,
  };
}

async function pypi(id: string): Promise<Stats> {
  const [project, recent] = await Promise.all([
    get(`https://pypi.org/pypi/${id}/json`).then((r) => r.json()),
    get(`https://pypistats.org/api/packages/${id.toLowerCase()}/recent`).then((r) => r.json()),
  ]);
  return {
    label: "pypi",
    alt: "PyPI",
    page: `https://pypi.org/project/${id}/`,
    statsPage: `https://pypistats.org/packages/${id.toLowerCase()}`,
    version: project.info.version,
    downloads: recent.data.last_month,
    perMonth: true,
  };
}

// The colours shields.io uses for versions and download counts.
const versionColor = (v: string) => (v.startsWith("0.") || v.includes("-") ? "orange" : "blue");
const downloadsColor = (n: number) =>
  n <= 0 ? "red" : n < 10 ? "yellow" : n < 100 ? "yellowgreen" : n < 1000 ? "green" : "brightgreen";
const count = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

const svgs: Record<string, string> = {};
const badges = new Map<string, Badge[]>();
const key = (pkg: Package) => `${pkg.registry}:${pkg.id}`;

function draw(pkg: Package, stats: Stats): Badge[] {
  const version = `v${stats.version.replace(/^v/, "")}`;
  const downloads =
    count.format(stats.downloads).replace("K", "k") + (stats.perMonth ? "/month" : "");
  const slug = `${pkg.registry === "psgallery" ? "psg" : "pypi"}-${pkg.id.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const parts = [
    {
      file: `${slug}-v`,
      label: stats.label,
      message: version,
      color: versionColor(version.slice(1)),
      alt: stats.alt,
      href: stats.page,
    },
    {
      file: `${slug}-${stats.perMonth ? "dm" : "dt"}`,
      label: "downloads",
      message: downloads,
      color: downloadsColor(stats.downloads),
      alt: "Downloads",
      href: stats.statsPage,
    },
  ];
  return parts.map(({ file, label, message, color, alt, href }) => {
    const svg = makeBadge({ label, message, color });
    const src = `/img/badges/${file}.svg`;
    svgs[src.slice(1)] = svg;
    const size = (name: string) => Number(svg.match(new RegExp(`\\s${name}="(\\d+)"`))![1]);
    return { src, alt: `${alt}: ${message}`, href, width: size("width"), height: size("height") };
  });
}

// Fetch the figures of every package once. In CI a failure stops the build,
// so the deployed site keeps its badges; locally the badges are left out.
export async function loadBadges(packages: Package[]): Promise<void> {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      const stats = await (pkg.registry === "psgallery" ? psGallery(pkg.id) : pypi(pkg.id));
      badges.set(key(pkg), draw(pkg, stats));
    }),
  );
  const errors = results.flatMap((r) =>
    r.status === "rejected" ? [(r.reason as Error).message] : [],
  );
  if (errors.length === 0) return;
  const message = `Could not fetch the project badges:\n  ${errors.join("\n  ")}`;
  if (process.env.CI) throw new Error(message);
  console.warn(`${message}\nThe affected badges are left out of this build.`);
}

export const badgesFor = (pkg: Package): Badge[] => badges.get(key(pkg)) ?? [];

export function badgeFiles(): Record<string, { type: string; body: string }> {
  return Object.fromEntries(
    Object.entries(svgs).map(([file, body]) => [file, { type: "image/svg+xml", body }]),
  );
}
