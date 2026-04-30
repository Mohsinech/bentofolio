import { NextResponse } from "next/server";
import { PREMIUM_PRICE } from "@/app/lib/config";
import { createClient } from "@/app/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json(
        { error: "You must be signed in to upgrade" },
        { status: 401 }
      );
    }

    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

    if (!storeId || !variantId || !apiKey) {
      return NextResponse.json(
        { error: "Lemon Squeezy not configured" },
        { status: 500 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    // Create checkout URL with Lemon Squeezy API
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: user.email,
              custom: {
                user_id: user.id,
                username: profile?.username || "",
              },
            },
            checkout_options: {
              dark: true,
              embed: false,
              media: false,
              logo: true,
              button_color: "#8b5cf6",
            },
            product_options: {
              name: "BentoFolio Pro",
              description: `One-time payment of $${PREMIUM_PRICE} for lifetime custom domain access`,
              receipt_button_text: "Go to Dashboard",
              receipt_thank_you_note:
                "Thanks for upgrading to Pro! You can now connect your custom domain.",
              redirect_url: `${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/editor?upgraded=true`,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Lemon Squeezy error:", error);
      return NextResponse.json(
        { error: "Failed to create checkout" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const checkoutUrl = data.data.attributes.url;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
