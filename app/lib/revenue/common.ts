// Shared shapes and helpers for revenue providers.

export type RevenueProvider = "stripe" | "lemonsqueezy";

export interface RevenueSnapshot {
  mrr: number; // major units (e.g. dollars), rounded to cents
  currency: string; // ISO 4217, upper case
  revenue: number[]; // 12 months, oldest first, major units
  revenueStart: string; // "YYYY-MM" of revenue[0]
  customers: number; // active subscriptions counted in MRR
  totalRevenue: number; // all-time revenue, major units, same currency
}

export class RevenueError extends Error {
  // "invalid_key" | "not_read_only" | "permission" | "provider" | "network"
  // | "choose_store" (details.stores lists the stores to pick from)
  constructor(
    public code: string,
    message: string,
    public details?: { stores?: { id: string; name: string }[] }
  ) {
    super(message);
  }
}

export const MONTHS = 12;

// Currencies Stripe and Lemon Squeezy count in whole units, not cents.
const ZERO_DECIMAL = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export function toMajor(minor: number, currency: string): number {
  return ZERO_DECIMAL.has(currency.toUpperCase()) ? minor : minor / 100;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Factor that turns one billing period's amount into a monthly amount.
export function monthlyFactor(interval: string | null | undefined, count = 1): number {
  const n = count > 0 ? count : 1;
  switch (interval) {
    case "day":
      return 365 / 12 / n;
    case "week":
      return 52 / 12 / n;
    case "month":
      return 1 / n;
    case "year":
      return 1 / (12 * n);
    default:
      return 0;
  }
}

// The 12 calendar months ending with the current one (UTC).
export function monthWindow(now = new Date()): { keys: string[]; start: Date } {
  const keys: string[] = [];
  const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1), 1));
  for (let i = 0; i < MONTHS; i++) {
    const d = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return { keys, start: first };
}

export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

// Sums amounts per currency and returns the currency with the most money,
// so a mostly-USD business with a few EUR sales reports in USD.
export function dominantCurrency(totals: Map<string, number>, fallback: string): string {
  let best = fallback.toUpperCase();
  let bestAmount = -1;
  for (const [currency, amount] of totals) {
    if (amount > bestAmount) {
      best = currency;
      bestAmount = amount;
    }
  }
  return best;
}

export async function fetchJson(
  url: string,
  init: RequestInit,
  fetchImpl: typeof fetch = fetch
): Promise<{ status: number; body: unknown }> {
  let response: Response;
  try {
    response = await fetchImpl(url, { ...init, cache: "no-store" });
  } catch {
    throw new RevenueError("network", "Couldn't reach the payment provider. Try again in a minute.");
  }
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}
