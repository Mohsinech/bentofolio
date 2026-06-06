import { createClient } from "@/app/lib/supabase/server";
import { activateBetaFreeProCode } from "@/app/lib/beta-codes";
import { recordReferralSignup } from "@/app/lib/referrals";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/editor";
  const referralCode = searchParams.get("ref");
  const couponCode = searchParams.get("coupon");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/complete`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.id) {
        await recordReferralSignup({
          referralCode: referralCode || user.user_metadata?.referral_code,
          referredUserId: user.id,
          referredEmail: user.email,
        });

        await activateBetaFreeProCode({
          userId: user.id,
          code: couponCode || user.user_metadata?.beta_coupon_code,
          username:
            user.user_metadata?.username ||
            user.user_metadata?.preferred_username ||
            user.user_metadata?.user_name,
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to error page or login
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
