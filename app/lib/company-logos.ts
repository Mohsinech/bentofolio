// Company logo mappings - auto-fetch logos based on company name
// Uses Clearbit Logo API (free) or fallback patterns

export interface CompanyInfo {
  name: string;
  logo: string;
  domain?: string;
}

// Import data from separate file to avoid exposure in dev tools
import { knownCompanies } from "./company-logos.data";

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
