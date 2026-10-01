import { createAdminClient } from "@/app/lib/supabase/admin";

// Beta codes live in the `beta_codes` table (see
// supabase/migrations/010_secure_pro_and_beta_codes.sql). Never list codes in
// this file: anything here ships in the public repo.

export type BetaCodeStatus =
  | "activated"
  | "already_redeemed"
  | "invalid"
  | "expired"
  | "used_up"
  | "no_profile";

export function normalizeCouponCode(code?: unknown) {
  return typeof code === "string" ? code.trim().toUpperCase() : "";
}

export async function activateBetaFreeProCode({
  userId,
  code,
  username,
}: {
  userId: string;
  code?: unknown;
  username?: unknown;
}): Promise<{
  activated: boolean;
  status?: BetaCodeStatus;
  code?: string;
  error?: unknown;
}> {
  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode) {
    return { activated: false, status: "invalid" };
  }

  const admin = createAdminClient();

  // Make sure a profile row exists before redeeming. Only insert when it is
  // missing, so existing layouts and content are never overwritten.
  const { data: existing, error: lookupError } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (lookupError) {
    console.error("Beta code: profile lookup failed:", lookupError);
    return { activated: false, error: lookupError };
  }

  if (!existing) {
    const fallbackUsername =
      typeof username === "string" && username.trim().length >= 3
        ? username.trim().toLowerCase()
        : `user_${userId.slice(0, 8)}`;

    const { error: insertError } = await admin.from("profiles").insert({
      id: userId,
      username: fallbackUsername,
      theme: "dark",
      layout: [],
      content: {},
    });

    if (insertError) {
      console.error("Beta code: profile creation failed:", insertError);
      return { activated: false, error: insertError };
    }
  }

  const { data: status, error } = await admin.rpc("redeem_beta_code", {
    p_code: normalizedCode,
    p_user_id: userId,
  });

  if (error) {
    console.error("Beta code redemption failed:", error);
    return { activated: false, error };
  }

  const result = status as BetaCodeStatus;
  return {
    activated: result === "activated" || result === "already_redeemed",
    status: result,
    code: normalizedCode,
  };
}
