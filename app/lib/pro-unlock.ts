// Turning Pro on after a payment. Two paths reach this: the Lemon Squeezy
// webhook, and the thank-you page confirming the order straight away (so
// buyers don't wait for the webhook). Whichever comes first does the work;
// the other finds Pro already on and does nothing, so the receipt email is
// sent once.

import { createAdminClient } from "@/app/lib/supabase/admin";
import { emailTemplates, sendEmail } from "@/app/lib/email";

export interface PaidOrder {
  id: string;
  orderNumber: string | null;
  email: string | null;
  total: string | null;
  createdAt: string | null;
}

type Admin = ReturnType<typeof createAdminClient>;

// Pro on for this account, if it wasn't already. Returns true when this call
// made the change (and sent the receipt).
export async function grantPro(
  admin: Admin,
  userId: string,
  order: PaidOrder
): Promise<{ granted: boolean; error?: string; conflict?: boolean }> {
  // Another account already holds this order: never move it.
  const { data: holder } = await admin
    .from("profiles")
    .select("id")
    .eq("lemon_squeezy_order_id", order.id)
    .neq("id", userId)
    .maybeSingle();
  if (holder) return { granted: false, conflict: true };

  const { data, error } = await admin
    .from("profiles")
    .update({ is_pro: true, upgraded_at: new Date().toISOString(), lemon_squeezy_order_id: order.id })
    .eq("id", userId)
    .or("is_pro.is.null,is_pro.eq.false")
    .select("username");
  if (error) return { granted: false, error: error.message };
  if (!data?.length) return { granted: false };

  if (order.email) {
    const template = emailTemplates.proReceipt({
      username: data[0].username,
      orderNumber: order.orderNumber,
      total: order.total,
      date: order.createdAt,
    });
    // A failed email never undoes the upgrade.
    await sendEmail({ to: order.email, subject: template.subject, html: template.html }).catch(() => null);
  }
  return { granted: true };
}

type LemonOrder = { id?: string | number; attributes?: Record<string, any> };

// A paid order for Pro in our store, or null.
function paidOrder(order: LemonOrder | undefined): PaidOrder | null {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
  const attributes = order?.attributes ?? {};
  if (!order?.id || String(attributes.store_id) !== String(storeId)) return null;
  if (attributes.status !== "paid") return null;
  const orderVariant = attributes.first_order_item?.variant_id;
  if (variantId && orderVariant != null && String(orderVariant) !== String(variantId)) return null;
  return {
    id: String(order.id),
    orderNumber: attributes.order_number != null ? String(attributes.order_number) : null,
    email: typeof attributes.user_email === "string" ? attributes.user_email : null,
    total: typeof attributes.total_formatted === "string" ? attributes.total_formatted : null,
    createdAt: typeof attributes.created_at === "string" ? attributes.created_at : null,
  };
}

async function lemonGet(path: string): Promise<any | null> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  if (!apiKey || !process.env.LEMON_SQUEEZY_STORE_ID) return null;
  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/${path}`, {
      headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Lemon Squeezy lookup failed:", response.status, path.split("?")[0]);
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

// Reads an order from Lemon Squeezy and checks it's a paid order for Pro in
// our store. Returns null when it isn't (or can't be checked).
export async function fetchPaidOrder(orderId: string): Promise<PaidOrder | null> {
  if (!/^\d+$/.test(orderId)) return null;
  const json = await lemonGet(`orders/${orderId}`);
  return paidOrder(json?.data);
}

// The newest paid Pro order made with this email in our store. Used when the
// thank-you page has no order id (checkout opened as a full page) so a buyer
// never depends on the webhook alone.
export async function findPaidOrderByEmail(email: string): Promise<PaidOrder | null> {
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  if (!email || !storeId) return null;
  const query = `orders?filter[store_id]=${encodeURIComponent(storeId)}&filter[user_email]=${encodeURIComponent(email)}&page[size]=10`;
  const json = await lemonGet(query);
  const orders: LemonOrder[] = Array.isArray(json?.data) ? json.data : [];
  return (
    orders
      .map(paidOrder)
      .filter((order): order is PaidOrder => Boolean(order))
      .sort((a, b) => Date.parse(b.createdAt || "") - Date.parse(a.createdAt || ""))[0] ?? null
  );
}
