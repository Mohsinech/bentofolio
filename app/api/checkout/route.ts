import { NextResponse } from "next/server";
import { PREMIUM_PRICE } from "@/app/lib/config";

export async function POST(request: Request) {
  try {
    const { userId, email, username } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "User ID and email are required" },
        { status: 400 }
      );
    }

    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;

    if (!storeId || !variantId) {
      return NextResponse.json(
        { error: "Lemon Squeezy not configured" },
        { status: 500 }
      );
    }

    // Create checkout URL with Lemon Squeezy API
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email,
              custom: {
                user_id: userId,
                username: username || "",
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
              description: `One-time payment of $${PREMIUM_PRICE} for lifetime access`,
              receipt_button_text: "Go to Dashboard",
              receipt_thank_you_note:
                "Thanks for upgrading to Pro! Enjoy all premium features.",
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
