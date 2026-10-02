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
  variant_id?: number | null;
  ends_at?: string | null;
  first_subscription_item?: { price_id?: number | null; quantity?: number | null } | null;
}

interface Variant {
  price: number | null;
  is_subscription: boolean;
  interval: string | null;
  interval_count: number | null;
}

interface Price {
  unit_price: number | null;
  unit_price_decimal: string | null;
  tiers?: { unit_price?: number | null; unit_price_decimal?: string | null }[] | null;
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
  {
    now = new Date(),
    fetchImpl = fetch,
    storeId,
  }: { now?: Date; fetchImpl?: typeof fetch; storeId?: string | null } = {}
): Promise<RevenueSnapshot & { storeId: string }> {
  checkLemonSqueezyKeyFormat(key);
  const trimmed = key.trim();
  const { keys, start } = monthWindow(now);

  // A key sees every store on the account. Each SaaS block shows one store,
  // so with several stores the person picks which.
  const { status: storeStatus, body: storeBody } = await fetchJson(`${API}/stores`, { headers: headers(trimmed) }, fetchImpl);
  check(storeStatus, "stores");
  const stores = ((storeBody as JsonApiList<{ name?: string; currency?: string; total_revenue?: number | null }>).data ?? []).map(
    (s) => ({
      id: String(s.id),
      name: s.attributes?.name || `Store ${s.id}`,
      currency: (s.attributes?.currency || "USD").toUpperCase(),
      // All-time revenue in cents, as on the Lemon Squeezy dashboard.
      totalRevenue: typeof s.attributes?.total_revenue === "number" ? s.attributes.total_revenue : null,
    })
  );
  if (stores.length === 0) throw new RevenueError("provider", "This Lemon Squeezy account has no stores yet.");
  const store = storeId ? stores.find((s) => s.id === String(storeId)) : stores.length === 1 ? stores[0] : undefined;
  if (!store) {
    throw new RevenueError(
      storeId ? "provider" : "choose_store",
      storeId ? "That store isn't on this Lemon Squeezy account any more." : "This key has several stores. Pick the one for this product.",
      { stores: stores.map(({ id, name }) => ({ id, name })) }
    );
  }
  const storeCurrency = store.currency;
  const inStore = { "filter[store_id]": store.id };

  // MRR from subscriptions that are still paying: active, past due, and
  // cancelled ones whose paid period hasn't ended yet (they count until they
  // end, like Stripe's cancel-at-period-end). Prices are looked up once per id.
  const subscriptions = await lsList<Subscription>(trimmed, "/subscriptions", inStore, fetchImpl);
  const nowMs = now.getTime();
  const counted = subscriptions.filter(({ attributes: s }) => {
    if (s.status === "active" || s.status === "past_due") return true;
    return s.status === "cancelled" && Boolean(s.ends_at) && new Date(s.ends_at!).getTime() > nowMs;
  });

  const priceCache = new Map<number, Price | null>();
  async function price(id: number): Promise<Price | null> {
    if (priceCache.has(id)) return priceCache.get(id)!;
    const { status, body } = await fetchJson(`${API}/prices/${id}`, { headers: headers(trimmed) }, fetchImpl);
    const value = status === 200 ? (body as { data: JsonApiItem<Price> }).data.attributes : null;
    priceCache.set(id, value);
    return value;
  }
  const variantCache = new Map<number, Variant | null>();
  async function variant(id: number): Promise<Variant | null> {
    if (variantCache.has(id)) return variantCache.get(id)!;
    const { status, body } = await fetchJson(`${API}/variants/${id}`, { headers: headers(trimmed) }, fetchImpl);
    const value = status === 200 ? (body as { data: JsonApiItem<Variant> }).data.attributes : null;
    variantCache.set(id, value);
    return value;
  }

  // Monthly amount in cents for one subscription. Uses the subscription's
  // price, falling back to its variant when the price can't be read.
  async function monthlyMinor(sub: Subscription): Promise<number> {
    const item = sub.first_subscription_item;
    const quantity = item?.quantity ?? 1;
    const p = item?.price_id ? await price(item.price_id) : null;
    if (p && p.category === "subscription") {
      const tier = p.tiers?.[0];
      const unit =
        p.unit_price ??
        (p.unit_price_decimal ? Number(p.unit_price_decimal) : null) ??
        tier?.unit_price ??
        (tier?.unit_price_decimal ? Number(tier.unit_price_decimal) : 0);
      const amount = unit * quantity * monthlyFactor(p.renewal_interval_unit, p.renewal_interval_quantity ?? 1);
      if (amount > 0) return amount;
    }
    const v = sub.variant_id ? await variant(sub.variant_id) : null;
    if (v?.is_subscription && v.price) {
      return v.price * quantity * monthlyFactor(v.interval, v.interval_count ?? 1);
    }
    return 0;
  }

  let mrrMinor = 0;
  let customers = 0;
  for (const { attributes: sub } of counted) {
    const amount = await monthlyMinor(sub);
    if (amount <= 0) continue;
    mrrMinor += amount;
    customers++;
  }

  // Monthly revenue = paid orders (first payments and one-time sales) +
  // paid renewal invoices. Initial invoices are skipped: their money is
  // already in the order. Both lists are newest first, so stop paging once
  // we're past the 12-month window.
  const before = (iso: string) => new Date(iso).getTime() < start.getTime();
  const orders = await lsList<Order>(trimmed, "/orders", inStore, fetchImpl, (o) => before(o.attributes.created_at));
  const renewals = await lsList<SubscriptionInvoice>(
    trimmed,
    "/subscription-invoices",
    inStore,
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

  // All-time total from the store (what the dashboard shows). If the store
  // has no total or reports in another currency, use the 12-month sum.
  const windowTotal = totals.get(currency) ?? 0;
  const totalMinor =
    store.totalRevenue !== null && currency === storeCurrency ? Math.max(store.totalRevenue, windowTotal) : windowTotal;

  return {
    mrr: round2(toMajor(mrrMinor, currency)),
    totalRevenue: round2(toMajor(totalMinor, currency)),
    currency,
    revenue: keys.map((month) => round2(toMajor(months.get(month) ?? 0, currency))),
    revenueStart: keys[0],
    customers,
    storeId: store.id,
  };
}
