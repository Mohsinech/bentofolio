import { cache } from "react";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
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
  // Settings (migration 016); defaults when the columns don't exist yet.
  defaultView: "grid" | "cv";
  showMadeWith: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProfileData(data: any): ProfileData {
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
    defaultView: data.default_view === "cv" ? "cv" : "grid",
    showMadeWith: Boolean(data.show_made_with),
  };
}

// Cookie-free client for public reads (profile pages, link previews,
// sitemap): no session work, and the result can be cached.
let publicClient: SupabaseClient | null = null;
export function createPublicClient(): SupabaseClient {
  publicClient ??= createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return publicClient;
}

async function findProfile(supabase: SupabaseClient, username: string): Promise<ProfileData | null> {
  // Case-insensitive: /Mira and /mira are the same page. ilike treats "_"
  // and "%" as wildcards, so escape them to match the name exactly.
  const pattern = username.trim().replace(/[\\%_]/g, (c) => `\\${c}`);
  const { data, error } = await supabase.from("profiles").select("*").ilike("username", pattern).maybeSingle();
  if (error || !data) return null;
  return toProfileData(data);
}

// A public page's profile. Cookie-free on purpose: public pages don't touch
// the visitor's session (the middleware skips them, so a server-side token
// refresh here could never be saved). Cached per request, so the page, its
// metadata and its link preview share one query.
export const getProfileByUsername = cache(async (username: string): Promise<ProfileData | null> => {
  return findProfile(createPublicClient(), username);
});

// Current username for an old one that was changed in the last 30 days.
export async function resolveUsernameRedirect(username: string): Promise<string | null> {
  const { data, error } = await createPublicClient().rpc("resolve_username_redirect", {
    p_username: username,
  });
  if (error || typeof data !== "string" || !data) return null;
  return data;
}

// Verified revenue for a page's SaaS blocks, from the server's own records.
export const getVerifiedRevenue = cache(async (profileId: string): Promise<VerifiedRevenue[]> => {
  const { data, error } = await createPublicClient().rpc("public_verified_revenue", { p_profile_id: profileId });
  if (error || !Array.isArray(data)) return [];
  return data as VerifiedRevenue[];
});

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

  return toProfileData(data);
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
