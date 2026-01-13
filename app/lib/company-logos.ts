// Company logo mappings - auto-fetch logos based on company name
// Uses Clearbit Logo API (free) or fallback patterns

export interface CompanyInfo {
  name: string;
  logo: string;
  domain?: string;
}

// Well-known companies with their domains for logo fetching
const knownCompanies: Record<string, string> = {
  // Freelance platforms
  upwork: "upwork.com",
  fiverr: "fiverr.com",
  toptal: "toptal.com",
  freelancer: "freelancer.com",
  "99designs": "99designs.com",

  // Tech giants
  google: "google.com",
  microsoft: "microsoft.com",
  apple: "apple.com",
  amazon: "amazon.com",
  meta: "meta.com",
  facebook: "facebook.com",
  netflix: "netflix.com",
  spotify: "spotify.com",
  twitter: "twitter.com",
  x: "x.com",
  linkedin: "linkedin.com",
  github: "github.com",
  gitlab: "gitlab.com",
  slack: "slack.com",
  discord: "discord.com",
  zoom: "zoom.us",

  // Cloud & DevOps
  aws: "aws.amazon.com",
  azure: "azure.microsoft.com",
  digitalocean: "digitalocean.com",
  vercel: "vercel.com",
  netlify: "netlify.com",
  heroku: "heroku.com",
  cloudflare: "cloudflare.com",

  // Tech companies
  stripe: "stripe.com",
  shopify: "shopify.com",
  twilio: "twilio.com",
  sendgrid: "sendgrid.com",
  mailchimp: "mailchimp.com",
  hubspot: "hubspot.com",
  salesforce: "salesforce.com",
  atlassian: "atlassian.com",
  jira: "atlassian.com",
  notion: "notion.so",
  figma: "figma.com",
  canva: "canva.com",
  adobe: "adobe.com",
  sketch: "sketch.com",

  // Startups & YC companies
  airbnb: "airbnb.com",
  uber: "uber.com",
  lyft: "lyft.com",
  doordash: "doordash.com",
  instacart: "instacart.com",
  coinbase: "coinbase.com",
  robinhood: "robinhood.com",
  plaid: "plaid.com",

  // Consulting
  mckinsey: "mckinsey.com",
  bcg: "bcg.com",
  bain: "bain.com",
  deloitte: "deloitte.com",
  accenture: "accenture.com",
  pwc: "pwc.com",
  kpmg: "kpmg.com",
  ey: "ey.com",

  // Education
  coursera: "coursera.org",
  udemy: "udemy.com",
  udacity: "udacity.com",
  codecademy: "codecademy.com",
  pluralsight: "pluralsight.com",

  // Social/Media
  tiktok: "tiktok.com",
  snapchat: "snapchat.com",
  pinterest: "pinterest.com",
  reddit: "reddit.com",
  medium: "medium.com",
  substack: "substack.com",

  // E-commerce
  ebay: "ebay.com",
  etsy: "etsy.com",
  alibaba: "alibaba.com",
  walmart: "walmart.com",
  target: "target.com",
};

/**
 * Get logo URL for a company name
 * Uses Clearbit Logo API which is free and reliable
 */
export function getCompanyLogo(companyName: string): string | null {
  if (!companyName) return null;

  const normalized = companyName.toLowerCase().trim();

  // Check known companies first
  const domain = knownCompanies[normalized];
  if (domain) {
    return `https://logo.clearbit.com/${domain}`;
  }

  // Try to extract domain if company name looks like a domain
  if (normalized.includes(".")) {
    return `https://logo.clearbit.com/${normalized}`;
  }

  // Try company name + .com as fallback
  return `https://logo.clearbit.com/${normalized.replace(/\s+/g, "")}.com`;
}

/**
 * Get company suggestions based on partial input
 */
export function getCompanySuggestions(input: string): CompanyInfo[] {
  if (!input || input.length < 2) return [];

  const normalized = input.toLowerCase().trim();
  const matches: CompanyInfo[] = [];

  for (const [name, domain] of Object.entries(knownCompanies)) {
    if (name.includes(normalized) || domain.includes(normalized)) {
      matches.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        logo: `https://logo.clearbit.com/${domain}`,
        domain,
      });
    }
    if (matches.length >= 5) break;
  }

  return matches;
}

/**
 * Generate initials fallback for company
 */
export function getCompanyInitials(name: string): string {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Generate a color from company name for fallback background
 */
export function getCompanyColor(name: string): string {
  if (!name) return "#6366f1";

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
  ];

  return colors[Math.abs(hash) % colors.length];
}
