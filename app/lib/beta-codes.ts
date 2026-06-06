import { createAdminClient } from "@/app/lib/supabase/admin";

const builtInBetaFreeCodes = ["NAOUMI100", "OUAZINI100"];

export function normalizeCouponCode(code?: unknown) {
  return typeof code === "string" ? code.trim().toUpperCase() : "";
}

export function isBetaFreeProCode(code?: unknown) {
  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode) return false;

  const configuredCodes = (process.env.BETA_FREE_PRO_CODES || "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  return [...builtInBetaFreeCodes, ...configuredCodes].includes(
    normalizedCode
  );
}

export async function activateBetaFreeProCode({
  userId,
  code,
  username,
}: {
  userId: string;
  code?: unknown;
  username?: unknown;
}) {
  const normalizedCode = normalizeCouponCode(code);

  if (!isBetaFreeProCode(normalizedCode)) {
    return { activated: false };
  }

  const admin = createAdminClient();
  const updatePayload = {
    is_pro: true,
    upgraded_at: new Date().toISOString(),
    lemon_squeezy_order_id: `beta-free:${normalizedCode}`,
  };
  const { data: updatedProfile, error: updateError } = await admin
    .from("profiles")
    .update(updatePayload)
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (!updateError && updatedProfile?.id) {
    return { activated: true, code: normalizedCode };
  }

  const normalizedUsername =
    typeof username === "string" && username.trim().length >= 3
      ? username.trim().toLowerCase()
      : `user_${userId.slice(0, 8)}`;

  const { error } = await admin.from("profiles").upsert(
    {
      id: userId,
      username: normalizedUsername,
      theme: "dark",
      layout: [],
      content: {},
      ...updatePayload,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("Beta free code activation failed:", error);
    return { activated: false, error };
  }

  return { activated: true, code: normalizedCode };
}
