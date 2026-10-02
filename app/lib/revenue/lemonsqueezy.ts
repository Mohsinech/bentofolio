import {
  RevenueError,
  dominantCurrency,
  fetchJson,
  monthKey,
  monthWindow,
  monthlyFactor,
  round2,
  toMajor,
  type RevenueSnapshot,
} from "./common";

// Reads MRR and the last 12 months of revenue from Lemon Squeezy.
// Lemon Squeezy API keys can't be limited to read-only, so the editor warns
// people before they connect. We only ever send GET requests.

const API = "https://api.lemonsqueezy.com/v1";
const MAX_PAGES = 40;

export function checkLemonSqueezyKeyFormat(key: string): void {
  const trimmed = key.trim();
  // Lemon Squeezy keys are long JWTs (three dot-separated parts).
  if (trimmed.length < 40 || trimmed.split(".").length !== 3) {
    throw new RevenueError("invalid_key", "Paste a Lemon Squeezy API key from Settings → API.");
  }
}

interface JsonApiItem<A> {
  id: string;
  attributes: A;
}

interface JsonApiList<A> {
  data: JsonApiItem<A>[];
  meta?: { page?: { lastPage?: number } };
}

interface Subscription {
  status: string;
  first_subscription_item?: { price_id?: number | null; quantity?: number | null } | null;
}

interface Price {
  unit_price: number | null;
  unit_price_decimal: string | null;
  renewal_interval_unit: string | null;
  renewal_interval_quantity: number | null;
  category: string;
}

interface Order {
  status: string;
  total: number;
  refunded_amount?: number | null;
  currency: string;
  created_at: string;
}

interface SubscriptionInvoice {
  status: string;
  billing_reason: string;
  total: number;
  refunded_amount?: number | null;
  currency: string;
  created_at: string;
}

function headers(key: string) {
  return {
    Authorization: `Bearer ${key}`,
    Accept: "application/vnd.api+json",
  };
}

function check(status: number, what: string) {
  if (status === 401) throw new RevenueError("invalid_key", "Lemon Squeezy didn't accept that key. Check it was copied fully.");
  if (status === 403) throw new RevenueError("permission", `Lemon Squeezy refused access to ${what}.`);
  if (status !== 200) throw new RevenueError("provider", `Lemon Squeezy returned an error (${status}). Try again later.`);
}

async function lsList<A>(
  key: string,
  path: string,
  params: Record<string, string>,
  fetchImpl: typeof fetch,
  stopWhen?: (item: JsonApiItem<A>) => boolean
): Promise<JsonApiItem<A>[]> {
  const out: JsonApiItem<A>[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const query = new URLSearchParams({ "page[size]": "100", "page[number]": String(page), ...params });
    const { status, body } = await fetchJson(`${API}${path}?${query}`, { headers: headers(key) }, fetchImpl);
    check(status, path.replace("/", ""));
    const list = body as JsonApiList<A>;
    out.push(...list.data);
    if (stopWhen && list.data.some(stopWhen)) break;
    const last = list.meta?.page?.lastPage ?? page;
    if (page >= last || list.data.length === 0) break;
  }
  return out;
}

export async function fetchLemonSqueezyRevenue(
  key: string,
  { now = new Date(), fetchImpl = fetch }: { now?: Date; fetchImpl?: typeof fetch } = {}
): Promise<RevenueSnapshot> {
  checkLemonSqueezyKeyFormat(key);
  const trimmed = key.trim();
  const { keys, start } = monthWindow(now);

  // Store currency as a fallback, and a cheap check that the key works.
  const { status: storeStatus, body: storeBody } = await fetchJson(`${API}/stores`, { headers: headers(trimmed) }, fetchImpl);
  check(storeStatus, "stores");
  const storeCurrency =
    ((storeBody as JsonApiList<{ currency?: string }>).data?.[0]?.attributes?.currency || "USD").toUpperCase();

  // MRR from active subscriptions; prices are looked up once per price id.
  const subscriptions = await lsList<Subscription>(trimmed, "/subscriptions", {}, fetchImpl);
  const counted = subscriptions.filter((s) => s.attributes.status === "active" || s.attributes.status === "past_due");

  const priceCache = new Map<number, Price | null>();
  async function price(id: number): Promise<Price | null> {
    if (priceCache.has(id)) return priceCache.get(id)!;
    const { status, body } = await fetchJson(`${API}/prices/${id}`, { headers: headers(trimmed) }, fetchImpl);
    const value = status === 200 ? (body as { data: JsonApiItem<Price> }).data.attributes : null;
    priceCache.set(id, value);
    return value;
  }

  let mrrMinor = 0;
  let customers = 0;
  for (const sub of counted) {
    const item = sub.attributes.first_subscription_item;
    if (!item?.price_id) continue;
    const p = await price(item.price_id);
    if (!p || p.category !== "subscription") continue;
    const unit = p.unit_price ?? (p.unit_price_decimal ? Number(p.unit_price_decimal) : 0);
    const amount = unit * (item.quantity ?? 1) * monthlyFactor(p.renewal_interval_unit, p.renewal_interval_quantity ?? 1);
    if (amount <= 0) continue;
    mrrMinor += amount;
    customers++;
  }

  // Monthly revenue = paid orders (first payments and one-time sales) +
  // paid renewal invoices. Initial invoices are skipped: their money is
  // already in the order. Both lists are newest first, so stop paging once
  // we're past the 12-month window.
  const before = (iso: string) => new Date(iso).getTime() < start.getTime();
  const orders = await lsList<Order>(trimmed, "/orders", {}, fetchImpl, (o) => before(o.attributes.created_at));
  const renewals = await lsList<SubscriptionInvoice>(
    trimmed,
    "/subscription-invoices",
    {},
    fetchImpl,
    (i) => before(i.attributes.created_at)
  );

  const perCurrency = new Map<string, Map<string, number>>();
  const totals = new Map<string, number>();
  function add(currency: string, createdAt: string, minor: number) {
    if (minor <= 0) return;
    const month = monthKey(new Date(createdAt));
    if (!keys.includes(month)) return;
    const c = currency.toUpperCase();
    const months = perCurrency.get(c) ?? new Map<string, number>();
    months.set(month, (months.get(month) ?? 0) + minor);
    perCurrency.set(c, months);
    totals.set(c, (totals.get(c) ?? 0) + minor);
  }

  for (const { attributes: o } of orders) {
    if (o.status !== "paid" && o.status !== "partial_refund") continue;
    add(o.currency, o.created_at, o.total - (o.refunded_amount ?? 0));
  }
  for (const { attributes: inv } of renewals) {
    if (inv.billing_reason !== "renewal") continue;
    if (inv.status !== "paid" && inv.status !== "partial_refund") continue;
    add(inv.currency, inv.created_at, inv.total - (inv.refunded_amount ?? 0));
  }

  const currency = mrrMinor > 0 ? storeCurrency : dominantCurrency(totals, storeCurrency);
  const months = perCurrency.get(currency) ?? new Map<string, number>();

  return {
    mrr: round2(toMajor(mrrMinor, currency)),
    currency,
    revenue: keys.map((month) => round2(toMajor(months.get(month) ?? 0, currency))),
    revenueStart: keys[0],
    customers,
  };
}
