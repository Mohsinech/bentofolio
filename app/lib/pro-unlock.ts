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

// Reads an order from Lemon Squeezy and checks it's a paid order for Pro in
// our store. Returns null when it isn't (or can't be checked).
export async function fetchPaidOrder(orderId: string): Promise<PaidOrder | null> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
  if (!apiKey || !storeId || !/^\d+$/.test(orderId)) return null;

  try {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${orderId}`, {
      headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const json = await response.json();
    const attributes = json?.data?.attributes ?? {};
    if (String(attributes.store_id) !== String(storeId)) return null;
    if (attributes.status !== "paid") return null;
    const orderVariant = attributes.first_order_item?.variant_id;
    if (variantId && orderVariant != null && String(orderVariant) !== String(variantId)) return null;
    return {
      id: String(json.data.id),
      orderNumber: attributes.order_number != null ? String(attributes.order_number) : null,
      email: typeof attributes.user_email === "string" ? attributes.user_email : null,
      total: typeof attributes.total_formatted === "string" ? attributes.total_formatted : null,
      createdAt: typeof attributes.created_at === "string" ? attributes.created_at : null,
    };
  } catch {
    return null;
  }
}
