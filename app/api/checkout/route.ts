import { NextResponse } from "next/server";
import {
  activateBetaFreeProCode,
  normalizeCouponCode,
} from "@/app/lib/beta-codes";
import { PREMIUM_PRICE } from "@/app/lib/config";
import { createAdminClient } from "@/app/lib/supabase/admin";
import { createClient } from "@/app/lib/supabase/server";

function appendDiscountCode(checkoutUrl: string, discountCode: string) {
  if (!discountCode) {
    return checkoutUrl;
  }

  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("checkout[discount_code]", discountCode);
    return url.toString();
  } catch {
    const separator = checkoutUrl.includes("?") ? "&" : "?";
    return `${checkoutUrl}${separator}checkout%5Bdiscount_code%5D=${encodeURIComponent(
      discountCode
    )}`;
  }
}

// The site's address for links Lemon Squeezy sends people back to. It must
// be a full public https URL, so a setting without "https://", with spaces
// or pointing at localhost falls back to the address this request came in on,
// then to bentofolio.dev.
let requestOrigin = "";

function publicOrigin(value: string | undefined): string | null {
  const raw = (value || "").trim();
  if (!raw) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (/^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(url.hostname) || !url.hostname.includes(".")) return null;
    return `https://${url.host}`;
  } catch {
    return null;
  }
}

function getAppUrl() {
  return publicOrigin(process.env.NEXT_PUBLIC_APP_URL) || publicOrigin(requestOrigin) || "https://bentofolio.dev";
}

export async function POST(request: Request) {
  try {
    requestOrigin = new URL(request.url).origin;
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

    // Already Pro (a second tab, a double click): nothing to buy.
    const { data: current } = await supabase.from("profiles").select("is_pro").eq("id", user.id).maybeSingle();
    if (current?.is_pro) {
      return NextResponse.json({ upgraded: true, url: `${getAppUrl()}/upgrade/success` });
    }

    const body = await request.json().catch(() => ({}));
    const discountCode = normalizeCouponCode(body.discountCode);
    // true when the browser opens checkout on top of the page (lemon.js).
    const embed = body.embed === true;

    const betaActivation = await activateBetaFreeProCode({
      userId: user.id,
      code: discountCode,
    });

    if (betaActivation.activated || betaActivation.error) {
      if (betaActivation.error) {
        return NextResponse.json(
          { error: "Failed to activate beta code" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        upgraded: true,
        url: `${getAppUrl()}/upgrade/success`,
      });
    }

    if (betaActivation.status === "used_up" || betaActivation.status === "expired") {
      return NextResponse.json(
        {
          error:
            betaActivation.status === "used_up"
              ? "This code has been fully used."
              : "This code has expired.",
        },
        { status: 400 }
      );
    }

    if (discountCode) {
      const admin = createAdminClient();
      const { data: rewardCode } = await admin
        .from("referral_reward_codes")
        .select("id, used_at")
        .eq("user_id", user.id)
        .eq("code", discountCode)
        .maybeSingle();

      if (rewardCode && !rewardCode.used_at) {
        const now = new Date().toISOString();
        const [{ error: profileError }, { error: rewardError }] =
          await Promise.all([
            admin
              .from("profiles")
              .update({
                is_pro: true,
                upgraded_at: now,
                lemon_squeezy_order_id: `referral-reward:${discountCode}`,
              })
              .eq("id", user.id),
            admin
              .from("referral_reward_codes")
              .update({ used_at: now })
              .eq("id", rewardCode.id),
          ]);

        if (profileError || rewardError) {
          console.error("Referral reward activation failed:", {
            profileError,
            rewardError,
          });
          return NextResponse.json(
            { error: "Failed to activate reward code" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          upgraded: true,
          url: `${getAppUrl()}/upgrade/success`,
        });
      }
    }

    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
    const betaPaymentLink = process.env.NEXT_PUBLIC_BETA_PAYMENT_LINK || "";

    if (
      !storeId ||
      !variantId ||
      !apiKey ||
      storeId.startsWith("your_") ||
      variantId.startsWith("your_") ||
      apiKey.startsWith("your_")
    ) {
      if (betaPaymentLink) {
        return NextResponse.json({
          url: appendDiscountCode(betaPaymentLink, discountCode),
        });
      }

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
              discount_code: discountCode || undefined,
              custom: {
                user_id: user.id,
                username: profile?.username || "",
                discount_code: discountCode || "",
              },
            },
            checkout_options: {
              dark: false,
              embed,
              media: false,
              logo: true,
              button_color: "#2b44ff",
            },
            product_options: {
              name: "bentofolio Pro",
              description: `One payment of $${PREMIUM_PRICE}, yours for good: custom domain, analytics, media blocks, the verified badge and CV as PDF.`,
              receipt_button_text: "Open bentofolio",
              receipt_link_url: `${getAppUrl()}/upgrade/success`,
              receipt_thank_you_note: "Thanks for going Pro. Everything is unlocked on your account.",
              // Full-page checkout comes back here; the page confirms the order.
              redirect_url: `${getAppUrl()}/upgrade/success`,
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
      const raw = await response.text();
      console.error("Lemon Squeezy error:", response.status, raw);
      const problems = lemonErrors(raw);
      // A code Lemon Squeezy doesn't know (or that ran out) is the usual cause:
      // say so instead of a generic failure.
      if (discountCode && problems.some((problem) => /discount/i.test(`${problem.pointer} ${problem.detail}`))) {
        return NextResponse.json(
          { error: `The code ${discountCode} isn't valid or has expired. Check it, or continue without a code.` },
          { status: 400 }
        );
      }
      const detail = problems.map((problem) => problem.detail).filter(Boolean)[0];
      return NextResponse.json(
        {
          error: detail
            ? `Checkout couldn't start: ${detail}`
            : "Checkout couldn't start. Please try again in a moment.",
        },
        { status: response.status >= 400 && response.status < 500 ? 502 : 500 }
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

// Lemon Squeezy answers errors as JSON:API: { errors: [{ detail, source: { pointer } }] }.
function lemonErrors(raw: string): { detail: string; pointer: string }[] {
  try {
    const body = JSON.parse(raw) as { errors?: { detail?: string; title?: string; source?: { pointer?: string } }[] };
    return (body.errors || []).map((error) => ({
      detail: String(error.detail || error.title || ""),
      pointer: String(error.source?.pointer || ""),
    }));
  } catch {
    return [];
  }
}
