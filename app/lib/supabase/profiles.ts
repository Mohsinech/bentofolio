import { createClient } from "@/app/lib/supabase/server";
import { BlockLayout, BlockContent, ThemeId } from "@/app/lib/types";

export interface ProfileData {
  id: string;
  username: string;
  theme: ThemeId;
  layout: BlockLayout[];
  content: Record<string, BlockContent>;
  isPro: boolean;
}

export async function getProfileByUsername(
  username: string
): Promise<ProfileData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    theme: data.theme || "dark",
    layout: data.layout || [],
    content: data.content || {},
    isPro: data.is_pro || false,
  };
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
    theme: data.theme || "dark",
    layout: data.layout || [],
    content: data.content || {},
    isPro: data.is_pro || false,
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
