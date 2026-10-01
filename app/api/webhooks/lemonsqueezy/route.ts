import { NextResponse } from "next/server";
import { createAdminClient } from "@/app/lib/supabase/admin";
import crypto from "crypto";
import { sendEmail, emailTemplates } from "@/app/lib/email";

// Service-role client, created on first use. Creating it when the module
// loads would run at build time and fail the whole build whenever the
// Supabase variables are missing (for example in Preview deployments).
let adminClient: ReturnType<typeof createAdminClient> | null = null;
function getAdmin() {
  adminClient ??= createAdminClient();
  return adminClient;
}

// Verify webhook signature from Lemon Squeezy
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  const digestBuffer = Buffer.from(digest, "hex");

  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("X-Signature");

    // Verify signature
    const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Webhook secret not configured");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    if (
      !signature ||
      !verifyWebhookSignature(payload, signature, webhookSecret)
    ) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(payload);
    const eventName = event.meta.event_name;

    console.log(`Received Lemon Squeezy event: ${eventName}`);

    // Handle order completed event
    if (eventName === "order_created") {
      const customData = event.meta.custom_data;
      const userId = customData?.user_id;

      if (!userId) {
        console.error("No user_id in webhook custom data");
        return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
      }

      // Get order details
      const orderStatus = event.data.attributes.status;
      const orderId = event.data.id;
      const customerEmail = event.data.attributes.user_email;
      const orderTotal = event.data.attributes.total_formatted;

      console.log(
        `Order ${orderId} - Status: ${orderStatus}, User: ${userId}, Email: ${customerEmail}, Total: ${orderTotal}`
      );

      // Only upgrade if order is paid
      if (orderStatus === "paid") {
        // Update user to Pro
        const { error } = await getAdmin()
          .from("profiles")
          .update({
            is_pro: true,
            upgraded_at: new Date().toISOString(),
            lemon_squeezy_order_id: orderId,
          })
          .eq("id", userId);

        if (error) {
          console.error("Error updating profile:", error);
          return NextResponse.json(
            { error: "Failed to upgrade user" },
            { status: 500 }
          );
        }

        console.log(`User ${userId} upgraded to Pro successfully`);

        // Get user profile to send welcome email
        const { data: profile } = await getAdmin()
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .single();

        if (profile && customerEmail) {
          const emailTemplate = emailTemplates.welcomePro(profile.username);
          await sendEmail({
            to: customerEmail,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
          console.log(`Welcome email sent to ${customerEmail}`);
        }
      }
    }

    // Handle subscription/payment refunded (if needed later)
    if (eventName === "order_refunded") {
      const customData = event.meta.custom_data;
      const userId = customData?.user_id;

      if (userId) {
        // Optionally downgrade user on refund
        const { error } = await getAdmin()
          .from("profiles")
          .update({
            is_pro: false,
            upgraded_at: null,
            lemon_squeezy_order_id: null,
          })
          .eq("id", userId);

        if (error) {
          console.error("Error downgrading profile:", error);
        } else {
          console.log(`User ${userId} downgraded due to refund`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Lemon Squeezy uses POST for webhooks
export async function GET() {
  return NextResponse.json({ message: "Webhook endpoint active" });
}
