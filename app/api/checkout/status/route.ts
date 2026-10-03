import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";
import { fetchPaidOrder, findPaidOrderByEmail, grantPro } from "@/app/lib/pro-unlock";

// GET ?order=<id>: is Pro on yet? The order (or, without an id, the newest
// paid order for the account's email) is checked with Lemon Squeezy and Pro
// turned on right away, without waiting for the webhook.
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("is_pro, username").eq("id", user.id).maybeSingle();
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    if (profile.is_pro) return NextResponse.json({ pro: true, username: profile.username });

    // With the order id from the checkout popup, check that order; without
    // one (checkout opened as a full page), look up a paid order made with
    // this account's email. Either way Pro doesn't wait on the webhook.
    const orderId = new URL(request.url).searchParams.get("order")?.trim() ?? "";
    const order =
      (orderId ? await fetchPaidOrder(orderId) : null) ?? (user.email ? await findPaidOrderByEmail(user.email) : null);
    // Only for the buyer's own email; anything else waits for the webhook,
    // which knows the account from the checkout itself.
    if (!order || !order.email || !user.email || order.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ pro: false });
    }

    const result = await grantPro(admin, user.id, order);
    if (result.error || result.conflict) console.error("Checkout confirm:", result.error ?? "order on another account");
    const { data: after } = await admin.from("profiles").select("is_pro").eq("id", user.id).maybeSingle();
    return NextResponse.json({ pro: Boolean(after?.is_pro), username: profile.username });
  } catch (error) {
    console.error("Checkout status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
