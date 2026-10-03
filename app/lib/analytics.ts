// Analytics helpers: who's a bot, which device, where a visit came from,
// and turning raw events into the dashboard's numbers. Pure, so it can be
// unit-tested.

export type Period = 7 | 30 | 90;

export function parsePeriod(value: unknown): Period {
  const n = Number(String(value ?? "").replace(/d$/, ""));
  return n === 7 || n === 90 ? n : 30;
}

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|skype|vkshare|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http/i;

export function isBot(userAgent: string | null | undefined): boolean {
  return !userAgent || BOT.test(userAgent);
}

export type Device = "Mobile" | "Tablet" | "Desktop";

export function deviceOf(userAgent: string | null | undefined): Device {
  const ua = userAgent ?? "";
  if (/ipad|tablet|kindle|silk|playbook|(android(?!.*mobile))/i.test(ua)) return "Tablet";
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "Mobile";
  return "Desktop";
}

const SOURCES: [RegExp, string][] = [
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, "X (Twitter)"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)github\.com$/, "GitHub"],
  [/(^|\.)google\.[a-z.]+$/, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)(facebook\.com|fb\.com|l\.facebook\.com)$/, "Facebook"],
  [/(^|\.)(instagram\.com|l\.instagram\.com)$/, "Instagram"],
  [/(^|\.)threads\.net$/, "Threads"],
  [/(^|\.)reddit\.com$/, "Reddit"],
  [/(^|\.)news\.ycombinator\.com$/, "Hacker News"],
  [/(^|\.)producthunt\.com$/, "Product Hunt"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
  [/(^|\.)(dribbble\.com)$/, "Dribbble"],
  [/(^|\.)(behance\.net)$/, "Behance"],
];

// "Direct" for no referrer or our own site; a friendly name for known sites;
// otherwise the bare hostname.
export function sourceOf(referrer: string | null | undefined, appHost = "bentofolio.dev"): string {
  if (!referrer) return "Direct";
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "Direct";
  }
  if (!host || host === appHost || host.endsWith(`.${appHost}`) || host === "localhost") return "Direct";
  for (const [pattern, name] of SOURCES) if (pattern.test(host)) return name;
  return host;
}

export interface AnalyticsRow {
  event_type: string;
  created_at: string;
  referrer?: string | null;
  user_agent?: string | null;
  country?: string | null;
  visitor_hash?: string | null;
  clicked_url?: string | null;
  block?: string | null;
}

export interface Totals {
  views: number;
  visitors: number;
  clicks: number;
  // Link clicks per visitor, 0–1+.
  clickRate: number;
}

export interface Dashboard {
  period: Period;
  totals: Totals;
  previous: Totals;
  daily: { date: string; views: number; visitors: number }[];
  sources: { name: string; count: number }[];
  countries: { code: string; count: number }[];
  devices: { name: Device; count: number }[];
  links: { url: string; block: string | null; count: number }[];
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function totalsOf(rows: AnalyticsRow[]): Totals {
  const views = rows.filter((r) => r.event_type === "view");
  const clicks = rows.filter((r) => r.event_type === "link_click").length;
  // Unique visitors per day (the hash changes daily), summed over the period.
  // Views recorded before visitor ids existed count as one visitor each.
  const seen = new Set<string>();
  let visitors = 0;
  for (const view of views) {
    if (!view.visitor_hash) {
      visitors++;
      continue;
    }
    const key = `${view.created_at.slice(0, 10)}|${view.visitor_hash}`;
    if (!seen.has(key)) {
      seen.add(key);
      visitors++;
    }
  }
  return { views: views.length, visitors, clicks, clickRate: visitors ? clicks / visitors : 0 };
}

function top<K extends string>(counts: Map<K, number>, limit: number): { key: K; count: number }[] {
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || String(a.key).localeCompare(String(b.key)))
    .slice(0, limit);
}

function bump<K>(map: Map<K, number>, key: K) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

// rows: events from the last 2 × period days (the earlier half is the
// comparison period).
export function aggregate(rows: AnalyticsRow[], period: Period, now = new Date(), appHost?: string): Dashboard {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const start = new Date(end.getTime() - period * 86_400_000);
  const prevStart = new Date(start.getTime() - period * 86_400_000);
  const inRange = (row: AnalyticsRow, from: Date, to: Date) => {
    const t = new Date(row.created_at).getTime();
    return t >= from.getTime() && t < to.getTime();
  };
  const current = rows.filter((row) => inRange(row, start, end));
  const previous = rows.filter((row) => inRange(row, prevStart, start));

  const days: string[] = [];
  for (let i = 0; i < period; i++) days.push(dayKey(new Date(start.getTime() + i * 86_400_000)));
  const viewsByDay = new Map<string, AnalyticsRow[]>();
  for (const row of current) {
    if (row.event_type !== "view") continue;
    const key = row.created_at.slice(0, 10);
    viewsByDay.set(key, [...(viewsByDay.get(key) ?? []), row]);
  }

  const sources = new Map<string, number>();
  const countries = new Map<string, number>();
  const devices = new Map<Device, number>();
  const links = new Map<string, { block: string | null; count: number }>();
  for (const row of current) {
    if (row.event_type === "view") {
      bump(sources, sourceOf(row.referrer, appHost));
      if (row.country && /^[A-Z]{2}$/.test(row.country)) bump(countries, row.country);
      bump(devices, deviceOf(row.user_agent));
    } else if (row.event_type === "link_click" && row.clicked_url) {
      const entry = links.get(row.clicked_url) ?? { block: row.block ?? null, count: 0 };
      entry.count++;
      links.set(row.clicked_url, entry);
    }
  }

  return {
    period,
    totals: totalsOf(current),
    previous: totalsOf(previous),
    daily: days.map((date) => {
      const t = totalsOf(viewsByDay.get(date) ?? []);
      return { date, views: t.views, visitors: t.visitors };
    }),
    sources: top(sources, 8).map(({ key, count }) => ({ name: key, count })),
    countries: top(countries, 8).map(({ key, count }) => ({ code: key, count })),
    devices: (["Desktop", "Mobile", "Tablet"] as Device[])
      .map((name) => ({ name, count: devices.get(name) ?? 0 }))
      .filter((d) => d.count > 0),
    links: [...links.entries()]
      .map(([url, v]) => ({ url, block: v.block, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
}

// Change vs the previous period, or null when there's nothing to compare.
export function delta(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return (current - previous) / previous;
}
