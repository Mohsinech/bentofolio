import { emailTemplates, sendEmail } from "@/app/lib/email";
import { createAdminClient } from "@/app/lib/supabase/admin";

const REFERRAL_REWARD_THRESHOLD = 5;

function normalizeReferralCode(code?: string | null) {
  return code?.trim().toUpperCase() || "";
}

function createRewardCode(username?: string | null) {
  const prefix = username
    ? username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()
    : "BENTO";
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Math.random().toString(36).slice(2, 10).toUpperCase();

  return `COUPON100-${prefix}-${suffix}`;
}

export async function recordReferralSignup({
  referralCode,
  referredUserId,
  referredEmail,
}: {
  referralCode?: string | null;
  referredUserId: string;
  referredEmail?: string | null;
}) {
  const normalizedCode = normalizeReferralCode(referralCode);

  if (!normalizedCode) {
    return { tracked: false };
  }

  const supabase = createAdminClient();
  const { data: invite, error: inviteError } = await supabase
    .from("referral_invites")
    .select("id, inviter_id, email")
    .eq("referral_code", normalizedCode)
    .maybeSingle();

  if (inviteError || !invite) {
    if (inviteError) {
      console.error("Referral invite lookup failed:", inviteError);
    }
    return { tracked: false };
  }

  if (invite.inviter_id === referredUserId) {
    return { tracked: false };
  }

  const { error: signupError } = await supabase
    .from("referral_signups")
    .upsert(
      {
        invite_id: invite.id,
        inviter_id: invite.inviter_id,
        referred_user_id: referredUserId,
        referred_email: referredEmail || null,
      },
      {
        onConflict: "referred_user_id",
        ignoreDuplicates: true,
      }
    );

  if (signupError) {
    console.error("Referral signup insert failed:", signupError);
    return { tracked: false };
  }

  const { count } = await supabase
    .from("referral_signups")
    .select("id", { count: "exact", head: true })
    .eq("inviter_id", invite.inviter_id);

  if (!count || count < REFERRAL_REWARD_THRESHOLD) {
    return { tracked: true, count: count || 0 };
  }

  const { data: existingReward } = await supabase
    .from("referral_reward_codes")
    .select("code, sent_at")
    .eq("user_id", invite.inviter_id)
    .maybeSingle();

  if (existingReward) {
    return { tracked: true, count, rewardCode: existingReward.code };
  }

  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", invite.inviter_id)
    .single();

  const {
    data: { user: inviterUser },
  } = await supabase.auth.admin.getUserById(invite.inviter_id);

  const rewardCode = createRewardCode(inviterProfile?.username);
  const { data: reward, error: rewardError } = await supabase
    .from("referral_reward_codes")
    .insert({
      user_id: invite.inviter_id,
      code: rewardCode,
      threshold: REFERRAL_REWARD_THRESHOLD,
    })
    .select("id, code")
    .single();

  if (rewardError || !reward) {
    console.error("Referral reward insert failed:", rewardError);
    return { tracked: true, count };
  }

  if (inviterUser?.email) {
    const template = emailTemplates.referralReward({
      username: inviterProfile?.username || "builder",
      code: reward.code,
      count,
    });
    const result = await sendEmail({
      to: inviterUser.email,
      subject: template.subject,
      html: template.html,
    });

    if ("success" in result) {
      await supabase
        .from("referral_reward_codes")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", reward.id);
    }
  }

  return { tracked: true, count, rewardCode: reward.code };
}

export { REFERRAL_REWARD_THRESHOLD };
