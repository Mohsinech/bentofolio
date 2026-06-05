import { createClient } from "@/app/lib/supabase/server";
import { recordReferralSignup } from "@/app/lib/referrals";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/editor";
  const referralCode = searchParams.get("ref");

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
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to error page or login
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
