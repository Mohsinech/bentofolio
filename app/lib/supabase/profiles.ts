import { createClient } from "@/app/lib/supabase/server";
import { BlockLayout, BlockContent, ThemeId } from "@/app/lib/types";
import type { VerifiedRevenue } from "@/app/lib/revenue/overlay";

function normalizeTheme(theme: unknown): ThemeId {
  return theme === "light" ? "light" : "dark";
}

export interface ProfileData {
  id: string;
  username: string;
  avatarUrl?: string | null;
  theme: ThemeId;
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  // 1 = old fixed template (order only), 2 = bento grid positions.
  layoutVersion: number;
  isPro: boolean;
  customDomain?: string | null;
}

export async function getProfileByUsername(
  username: string
): Promise<ProfileData | null> {
  const supabase = await createClient();

  // Case-insensitive: /Mira and /mira are the same page. ilike treats "_"
  // and "%" as wildcards, so escape them to match the name exactly.
  const pattern = username.trim().replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .ilike("username", pattern)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    avatarUrl: data.avatar_url || null,
    theme: normalizeTheme(data.theme),
    layout: data.layout || [],
    content: data.content || {},
    layoutVersion: typeof data.layout_version === "number" ? data.layout_version : 1,
    isPro: data.is_pro || false,
    customDomain: data.custom_domain || null,
  };
}

// Current username for an old one that was changed in the last 30 days.
export async function resolveUsernameRedirect(
  username: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resolve_username_redirect", {
    p_username: username,
  });
  if (error || typeof data !== "string" || !data) return null;
  return data;
}

// Verified revenue for a page's SaaS blocks, from the server's own records.
export async function getVerifiedRevenue(profileId: string): Promise<VerifiedRevenue[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_verified_revenue", { p_profile_id: profileId });
  if (error || !Array.isArray(data)) return [];
  return data as VerifiedRevenue[];
}

export async function getCurrentUserProfile(): Promise<ProfileData | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    avatarUrl: data.avatar_url || null,
    theme: normalizeTheme(data.theme),
    layout: data.layout || [],
    content: data.content || {},
    layoutVersion: typeof data.layout_version === "number" ? data.layout_version : 1,
    isPro: data.is_pro || false,
    customDomain: data.custom_domain || null,
  };
}

export async function updateProfile(
  profileId: string,
  updates: Partial<
    Pick<ProfileData, "theme" | "layout" | "content" | "username">
  >
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  return !data;
}
