// Custom domains: validation, DNS instructions, and the Vercel API calls that
// attach a domain to this project. Pure except for `fetchImpl`, so it can be
// tested without Vercel.

const API = "https://api.vercel.com";

// Vercel's standard targets (used when the API doesn't suggest its own).
export const VERCEL_A_RECORD = "76.76.21.21";
export const VERCEL_CNAME = "cname.vercel-dns.com";

// Second-level suffixes where the registrable domain has three labels
// (mira.co.uk, studio.co.ma).
const TWO_PART_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "com.au", "net.au", "org.au", "co.nz", "co.za", "co.ma", "net.ma", "org.ma",
  "com.br", "com.mx", "co.jp", "co.in", "com.tr", "com.sg", "com.hk", "co.kr", "com.cn", "com.eg", "com.sa",
]);

export type DomainProblem = "empty" | "invalid" | "ours" | "too_long";

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/[/?#].*$/, "")
    .replace(/:\d+$/, "")
    .replace(/\.$/, "")
    .replace(/^www\./, "");
}

export function checkDomain(domain: string): DomainProblem | null {
  if (!domain) return "empty";
  if (domain.length > 253) return "too_long";
  const labels = domain.split(".");
  if (labels.length < 2) return "invalid";
  const labelOk = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
  if (!labels.every((label) => labelOk.test(label))) return "invalid";
  if (!/^[a-z]{2,63}$/.test(labels[labels.length - 1]) && !/^xn--[a-z0-9-]+$/.test(labels[labels.length - 1])) return "invalid";
  if (domain === "bentofolio.dev" || domain.endsWith(".bentofolio.dev") || domain.endsWith(".vercel.app")) return "ours";
  return null;
}

export function domainProblemMessage(problem: DomainProblem): string {
  switch (problem) {
    case "empty":
      return "Enter a domain, like mira.design.";
    case "too_long":
      return "That domain is too long.";
    case "ours":
      return "Use a domain you own, not a bentofolio or Vercel address.";
    default:
      return "That doesn't look like a domain. Try something like mira.design or cv.mira.design.";
  }
}

// mira.design → true; cv.mira.design → false; mira.co.uk → true.
export function isApexDomain(domain: string): boolean {
  const labels = domain.split(".");
  if (labels.length === 2) return true;
  return labels.length === 3 && TWO_PART_SUFFIXES.has(labels.slice(1).join("."));
}

export interface DnsRecord {
  type: "A" | "CNAME" | "TXT";
  name: string; // as typed at most registrars: "@", "www", "cv", "_vercel"
  value: string;
  ok: boolean | null; // null = unknown
}

// mira.design for cv.mira.design (or mira.co.uk for cv.mira.co.uk).
export function registrableDomain(domain: string): string {
  const labels = domain.split(".");
  const keep = TWO_PART_SUFFIXES.has(labels.slice(-2).join(".")) ? 3 : 2;
  return labels.slice(-keep).join(".");
}

// A record name as registrars ask for it: "@" for the apex, "cv" for
// cv.mira.design, "_vercel" for _vercel.mira.design.
export function hostLabel(domain: string): string {
  const apex = registrableDomain(domain);
  return domain === apex ? "@" : domain.slice(0, -(apex.length + 1));
}

export interface DomainStatus {
  domain: string;
  apex: boolean;
  // On the Vercel project.
  added: boolean;
  // Ownership proven (only needed when the domain was used on another
  // Vercel account).
  verified: boolean;
  // DNS points at Vercel.
  dnsOk: boolean;
  live: boolean;
  records: DnsRecord[];
  checkedAt: string;
}

interface ProjectDomain {
  name: string;
  verified: boolean;
  verification?: { type: string; domain: string; value: string; reason?: string }[];
}

interface DomainConfig {
  misconfigured: boolean;
  recommendedIPv4?: { rank: number; value: string[] }[];
  recommendedCNAME?: { rank: number; value: string }[];
}

export class DomainError extends Error {
  constructor(
    public code: "not_configured" | "in_use" | "invalid" | "vercel",
    message: string
  ) {
    super(message);
  }
}

export interface VercelConfig {
  token: string;
  projectId: string;
  teamId?: string;
}

export function vercelConfigFromEnv(env: Record<string, string | undefined> = process.env): VercelConfig | null {
  const token = env.VERCEL_API_TOKEN?.trim();
  const projectId = env.VERCEL_PROJECT_ID?.trim();
  if (!token || !projectId) return null;
  return { token, projectId, teamId: env.VERCEL_TEAM_ID?.trim() || undefined };
}

async function vercel<T>(
  config: VercelConfig,
  method: string,
  path: string,
  body: unknown,
  fetchImpl: typeof fetch
): Promise<{ status: number; data: T & { error?: { code?: string; message?: string } } }> {
  const url = new URL(API + path);
  if (config.teamId) url.searchParams.set("teamId", config.teamId);
  const response = await fetchImpl(url.toString(), {
    method,
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as T & { error?: { code?: string; message?: string } };
  return { status: response.status, data };
}

function project(config: VercelConfig) {
  return `/v9/projects/${encodeURIComponent(config.projectId)}/domains`;
}

// Adds the domain (and www.<apex>, redirecting to the apex) to the project.
export async function addDomain(config: VercelConfig, domain: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  const add = async (name: string, redirect?: string) => {
    const { status, data } = await vercel(
      config,
      "POST",
      `/v10/projects/${encodeURIComponent(config.projectId)}/domains`,
      redirect ? { name, redirect, redirectStatusCode: 308 } : { name },
      fetchImpl
    );
    if (status === 200 || status === 201) return;
    const code = data.error?.code ?? "";
    if (code === "domain_already_in_use" && status === 409) {
      // Already on this project is fine; on another project/team is not.
      const existing = await vercel<ProjectDomain>(config, "GET", `${project(config)}/${encodeURIComponent(name)}`, undefined, fetchImpl);
      if (existing.status === 200) return;
      throw new DomainError("in_use", "This domain is connected to another Vercel project. Remove it there first.");
    }
    if (code === "invalid_domain" || status === 400) throw new DomainError("invalid", data.error?.message || "Vercel didn't accept that domain.");
    throw new DomainError("vercel", data.error?.message || `Vercel returned an error (${status}).`);
  };
  await add(domain);
  if (isApexDomain(domain)) await add(`www.${domain}`, domain);
}

export async function removeDomain(config: VercelConfig, domain: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  const names = isApexDomain(domain) ? [`www.${domain}`, domain] : [domain];
  for (const name of names) {
    const { status, data } = await vercel(config, "DELETE", `${project(config)}/${encodeURIComponent(name)}`, undefined, fetchImpl);
    if (status !== 200 && status !== 404) throw new DomainError("vercel", data.error?.message || `Vercel returned an error (${status}).`);
  }
}

export async function checkDomainStatus(
  config: VercelConfig,
  domain: string,
  fetchImpl: typeof fetch = fetch,
  now = new Date()
): Promise<DomainStatus> {
  const apex = isApexDomain(domain);
  let projectDomain = await vercel<ProjectDomain>(config, "GET", `${project(config)}/${encodeURIComponent(domain)}`, undefined, fetchImpl);
  // Ask Vercel to re-check ownership when it's still pending.
  if (projectDomain.status === 200 && !projectDomain.data.verified) {
    const verify = await vercel<ProjectDomain>(config, "POST", `${project(config)}/${encodeURIComponent(domain)}/verify`, {}, fetchImpl);
    if (verify.status === 200) projectDomain = verify;
  }
  const added = projectDomain.status === 200;
  const verified = added && Boolean(projectDomain.data.verified);

  const configResult = await vercel<DomainConfig>(config, "GET", `/v6/domains/${encodeURIComponent(domain)}/config`, undefined, fetchImpl);
  const dnsOk = configResult.status === 200 && configResult.data.misconfigured === false;

  let wwwOk: boolean | null = null;
  if (apex) {
    const www = await vercel<DomainConfig>(config, "GET", `/v6/domains/${encodeURIComponent(`www.${domain}`)}/config`, undefined, fetchImpl);
    wwwOk = www.status === 200 ? www.data.misconfigured === false : null;
  }

  const ipv4 =
    configResult.data.recommendedIPv4?.sort((a, b) => a.rank - b.rank)[0]?.value?.[0] ?? VERCEL_A_RECORD;
  const cname = (configResult.data.recommendedCNAME?.sort((a, b) => a.rank - b.rank)[0]?.value ?? VERCEL_CNAME).replace(/\.$/, "");

  const records: DnsRecord[] = apex
    ? [
        { type: "A", name: "@", value: ipv4, ok: dnsOk },
        { type: "CNAME", name: "www", value: cname, ok: wwwOk },
      ]
    : [{ type: "CNAME", name: hostLabel(domain), value: cname, ok: dnsOk }];

  for (const item of projectDomain.data.verification ?? []) {
    if (item.type !== "TXT") continue;
    records.push({ type: "TXT", name: hostLabel(item.domain), value: item.value, ok: verified });
  }

  return { domain, apex, added, verified, dnsOk, live: added && verified && dnsOk, records, checkedAt: now.toISOString() };
}
