// What a page says about its owner in one glance: name, headline and up to
// three proof points. Used for link previews (opengraph-image), the page
// title and description, and structured data. Pure, so it can be tested.

import type { BlockContent } from "@/app/lib/types";

export interface Proof {
  label: string;
  value: string;
  // Revenue synced from Stripe or Lemon Squeezy by the server.
  verified?: boolean;
}

export interface ProfileSummary {
  name: string;
  // True when the page has a real name (not just @username).
  hasName: boolean;
  headline: string;
  location: string;
  bio: string;
  avatar: string | null;
  proofs: Proof[];
  // Profile links for structured data (sameAs).
  links: string[];
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function money(value: number, currency?: string): string {
  const code = text(currency).toUpperCase() || "USD";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      notation: value >= 10_000 ? "compact" : "standard",
      minimumFractionDigits: 0,
      maximumFractionDigits: value >= 10_000 ? 1 : 0,
    }).format(value);
  } catch {
    return `$${Math.round(value).toLocaleString("en")}`;
  }
}

function count(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function httpUrl(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

// blocks: the page's visible blocks in reading order.
export function summarizeProfile(username: string, blocks: BlockContent[], avatarUrl?: string | null): ProfileSummary {
  const of = <T extends BlockContent["type"]>(type: T) =>
    blocks.filter((block) => block?.type === type).map((block) => block.data as Extract<BlockContent, { type: T }>["data"]);

  const identity = of("identity")[0];
  const rawName = text(identity?.name);
  const hasName = Boolean(rawName) && rawName !== "Your Name";
  const portrait =
    identity?.portraitType === "none"
      ? null
      : identity?.portraitType === "memoji"
        ? text(identity?.avatar) || null
        : text(identity?.avatar) || text(avatarUrl) || null;

  const revenue: Proof[] = [];
  const reported: Proof[] = [];
  for (const saas of of("saas")) {
    const mrr = Number(saas.mrr) || 0;
    const total = Number(saas.totalRevenue) || 0;
    if (mrr <= 0 && total <= 0) continue;
    const proof = {
      label: text(saas.name) || "Revenue",
      value: mrr > 0 ? `${money(mrr, saas.currency)} MRR` : `${money(total, saas.currency)} revenue`,
    };
    if (saas.verified) revenue.push({ ...proof, verified: true });
    else reported.push(proof);
  }

  const others: Proof[] = [];
  const jobs = of("experience").flatMap((block) => block.items ?? []);
  const job = jobs.find((item) => item.isCurrent) ?? jobs[0];
  if (job && text(job.role)) {
    others.push({
      label: job.isCurrent || !text(job.endDate) ? "Now" : "Recently",
      value: text(job.company) ? `${text(job.role)} at ${text(job.company)}` : text(job.role),
    });
  }

  const github = of("github")[0];
  if (github) {
    const stars = Number(github.totalStars) || 0;
    const contributions = Number(github.contributions) || 0;
    const repos = Number(github.publicRepos) || 0;
    const value =
      stars >= 10
        ? `${count(stars)} stars`
        : contributions > 0
          ? `${count(contributions)} contributions`
          : repos > 0
            ? `${count(repos)} repos`
            : "";
    if (value) others.push({ label: "GitHub", value });
  }

  const projects = of("projects").flatMap((block) => block.items ?? []).filter((item) => text(item.name));
  if (projects.length > 1) others.push({ label: "Projects", value: `${projects.length} shipped` });
  else if (projects.length === 1) others.push({ label: "Project", value: text(projects[0].name) });

  const stack = of("techstack")
    .flatMap((block) => block.items ?? [])
    .map((item) => text(item.name))
    .filter(Boolean);
  if (stack.length) others.push({ label: "Stack", value: stack.slice(0, 3).join(" · ") });

  const links = new Set<string>();
  const website = httpUrl(identity?.website);
  if (website) links.add(website);
  for (const social of of("social")) {
    for (const item of social.items ?? []) {
      if (item.platform === "email") continue;
      const url = httpUrl(item.url);
      if (url) links.add(url);
    }
  }
  if (github?.username) links.add(`https://github.com/${text(github.username)}`);

  return {
    name: hasName ? rawName : `@${username}`,
    hasName,
    headline: text(identity?.headline) || text(identity?.title),
    location: text(identity?.location),
    bio: text(identity?.bio),
    avatar: portrait,
    // Verified revenue first, then the rest, then self-reported revenue.
    proofs: [...revenue, ...others, ...reported].slice(0, 3),
    links: [...links].slice(0, 10),
  };
}

// One line for <meta name="description">.
export function describeProfile(summary: ProfileSummary): string {
  if (summary.bio) return clamp(summary.bio, 160);
  const lead = [summary.headline, summary.location].filter(Boolean).join(" in ");
  const proof = summary.proofs.map((p) => (p.label === "Now" ? p.value : `${p.label}: ${p.value}`)).join(". ");
  const line = [lead, proof].filter(Boolean).join(". ");
  return clamp(line || `${summary.name}'s work, projects and links on bentofolio.`, 160);
}

export function clamp(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,.;:–—-]+\S*$/, "")}…`;
}
