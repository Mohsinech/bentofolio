import { NextResponse } from "next/server";
import {
  ensureReferralRewardForInviter,
  REFERRAL_REWARD_THRESHOLD,
} from "@/app/lib/referrals";
import { createClient } from "@/app/lib/supabase/server";

function normalizeEmail(email: unknown) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function createReferralCode(username?: string | null) {
  const prefix = username
    ? username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()
    : "BENTO";
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();

  return `REF-${prefix}-${suffix}`;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "You must be signed in" },
      { status: 401 }
    );
  }

  await ensureReferralRewardForInviter(user.id);

  const [{ data: invites }, { data: signups }, { data: reward }] =
    await Promise.all([
      supabase
        .from("referral_invites")
        .select("id, email, referral_code, created_at")
        .eq("inviter_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("referral_signups")
        .select("id, referred_email, created_at")
        .eq("inviter_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("referral_reward_codes")
        .select("code, sent_at, used_at, created_at")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  return NextResponse.json({
    invites: invites || [],
    signups: signups || [],
    reward,
    threshold: REFERRAL_REWARD_THRESHOLD,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "You must be signed in" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body.email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address" },
      { status: 400 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const referralCode = createReferralCode(profile?.username);
  const { data: invite, error } = await supabase
    .from("referral_invites")
    .insert({
      inviter_id: user.id,
      email,
      referral_code: referralCode,
    })
    .select("id, email, referral_code, created_at")
    .single();

  if (error || !invite) {
    console.error("Referral invite create failed:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }

  return NextResponse.json({ invite });
}
