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

// Reads MRR and the last 12 months of revenue from Stripe with a restricted,
// read-only key. Needs Read access to Subscriptions and Invoices (prices come
// embedded in subscriptions).

const API = "https://api.stripe.com/v1";
const MAX_PAGES = 40; // 4,000 objects per list, plenty for an indie SaaS

export function checkStripeKeyFormat(key: string): void {
  const trimmed = key.trim();
  if (/^sk_(live|test)_/.test(trimmed)) {
    throw new RevenueError(
      "not_read_only",
      "That's a secret key with full access. Create a restricted key (it starts with rk_live_) with Read-only permissions instead."
    );
  }
  if (!/^rk_(live|test)_[A-Za-z0-9]{10,}$/.test(trimmed)) {
    throw new RevenueError("invalid_key", "Paste a Stripe restricted key. It starts with rk_live_.");
  }
}

interface StripeList<T> {
  data: T[];
  has_more: boolean;
}

interface StripePrice {
  unit_amount: number | null;
  unit_amount_decimal: string | null;
  currency: string;
  recurring: { interval: string; interval_count: number } | null;
}

interface StripeSubscription {
  id: string;
  status: string;
  currency: string;
  items: { data: { price: StripePrice; quantity?: number | null }[] };
  discount?: { coupon?: { percent_off?: number | null } | null } | null;
  discounts?: unknown[];
}

interface StripeInvoice {
  id: string;
  amount_paid: number;
  currency: string;
  created: number;
  status_transitions?: { paid_at?: number | null } | null;
}

async function stripeList<T extends { id: string }>(
  key: string,
  path: string,
  params: Record<string, string>,
  fetchImpl: typeof fetch
): Promise<T[]> {
  const out: T[] = [];
  let startingAfter: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const query = new URLSearchParams({ limit: "100", ...params });
    if (startingAfter) query.set("starting_after", startingAfter);
    const { status, body } = await fetchJson(
      `${API}${path}?${query}`,
      { headers: { Authorization: `Bearer ${key}`, "Stripe-Version": "2024-06-20" } },
      fetchImpl
    );
    if (status === 401) throw new RevenueError("invalid_key", "Stripe didn't accept that key. Check it was copied fully.");
    if (status === 403) {
      throw new RevenueError(
        "permission",
        `The key needs Read access to ${path.includes("invoices") ? "Invoices" : "Subscriptions"}. Edit the key in Stripe and set it to Read.`
      );
    }
    if (status !== 200) throw new RevenueError("provider", `Stripe returned an error (${status}). Try again later.`);
    const list = body as StripeList<T>;
    out.push(...list.data);
    if (!list.has_more || list.data.length === 0) break;
    startingAfter = list.data[list.data.length - 1].id;
  }
  return out;
}

function subscriptionMonthly(sub: StripeSubscription): { amount: number; currency: string } {
  let minor = 0;
  for (const item of sub.items?.data ?? []) {
    const price = item.price;
    if (!price?.recurring) continue;
    const unit = price.unit_amount ?? (price.unit_amount_decimal ? Number(price.unit_amount_decimal) : 0);
    minor += unit * (item.quantity ?? 1) * monthlyFactor(price.recurring.interval, price.recurring.interval_count);
  }
  const percentOff = sub.discount?.coupon?.percent_off;
  if (typeof percentOff === "number" && percentOff > 0) minor *= 1 - percentOff / 100;
  return { amount: minor, currency: (sub.currency || sub.items?.data?.[0]?.price?.currency || "usd").toUpperCase() };
}

export async function fetchStripeRevenue(
  key: string,
  { now = new Date(), fetchImpl = fetch }: { now?: Date; fetchImpl?: typeof fetch } = {}
): Promise<RevenueSnapshot> {
  checkStripeKeyFormat(key);
  const trimmed = key.trim();
  const { keys } = monthWindow(now);

  // Subscriptions: the default list leaves out canceled ones.
  const subscriptions = await stripeList<StripeSubscription>(
    trimmed,
    "/subscriptions",
    {},
    fetchImpl
  );
  const counted = subscriptions.filter((sub) => sub.status === "active" || sub.status === "past_due");

  const mrrByCurrency = new Map<string, number>();
  const customersByCurrency = new Map<string, number>();
  for (const sub of counted) {
    const { amount, currency } = subscriptionMonthly(sub);
    if (amount <= 0) continue;
    mrrByCurrency.set(currency, (mrrByCurrency.get(currency) ?? 0) + amount);
    customersByCurrency.set(currency, (customersByCurrency.get(currency) ?? 0) + 1);
  }

  // All paid invoices (newest first): the last 12 months feed the chart and
  // every one counts toward the all-time total.
  const invoices = await stripeList<StripeInvoice>(trimmed, "/invoices", { status: "paid" }, fetchImpl);
  const allTime = new Map<string, number>();

  const revenueByCurrency = new Map<string, Map<string, number>>();
  const revenueTotals = new Map<string, number>();
  for (const invoice of invoices) {
    if (!invoice.amount_paid) continue;
    const currency = invoice.currency.toUpperCase();
    allTime.set(currency, (allTime.get(currency) ?? 0) + invoice.amount_paid);
    const paidAt = invoice.status_transitions?.paid_at ?? invoice.created;
    const month = monthKey(new Date(paidAt * 1000));
    if (!keys.includes(month)) continue;
    const perMonth = revenueByCurrency.get(currency) ?? new Map<string, number>();
    perMonth.set(month, (perMonth.get(month) ?? 0) + invoice.amount_paid);
    revenueByCurrency.set(currency, perMonth);
    revenueTotals.set(currency, (revenueTotals.get(currency) ?? 0) + invoice.amount_paid);
  }

  const currency = dominantCurrency(
    mrrByCurrency.size ? mrrByCurrency : revenueTotals,
    [...revenueTotals.keys()][0] ?? "USD"
  );
  const months = revenueByCurrency.get(currency) ?? new Map<string, number>();

  return {
    mrr: round2(toMajor(mrrByCurrency.get(currency) ?? 0, currency)),
    currency,
    revenue: keys.map((month) => round2(toMajor(months.get(month) ?? 0, currency))),
    revenueStart: keys[0],
    customers: customersByCurrency.get(currency) ?? 0,
    totalRevenue: round2(toMajor(allTime.get(currency) ?? 0, currency)),
  };
}
