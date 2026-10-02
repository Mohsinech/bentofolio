import { createClient } from "@supabase/supabase-js";
import { isPlaceholderUsername } from "@/app/lib/usernames";

export interface FeaturedProfile {
  username: string;
  name: string;
  title: string;
  avatar: string | null;
  isPro: boolean;
}

// Published pages to show on the landing page: real names, more blocks
// first, Pro pages ahead. Uses the public (anon) key and no cookies so the
// landing page can be cached.
export async function getFeaturedProfiles(limit = 4): Promise<FeaturedProfile[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("profiles")
      .select("username, content, is_pro")
      .not("content", "is", null)
      .order("updated_at", { ascending: false })
      .limit(80);
    if (error || !data) return [];

    return data
      .map((row) => {
        const content = (row.content ?? {}) as Record<string, { type?: string; data?: Record<string, unknown> }>;
        const blocks = Object.values(content);
        const identity = blocks.find((block) => block?.type === "identity")?.data ?? {};
        const name = typeof identity.name === "string" ? identity.name.trim() : "";
        const title = typeof identity.title === "string" ? identity.title.trim() : "";
        const avatar = typeof identity.avatar === "string" && identity.avatar.startsWith("http") ? identity.avatar : null;
        return { username: row.username as string, name, title, avatar, isPro: Boolean(row.is_pro), blocks: blocks.length };
      })
      .filter((p) => p.username && !isPlaceholderUsername(p.username) && p.name && p.title && p.blocks >= 4)
      .sort((a, b) => Number(b.isPro) - Number(a.isPro) || b.blocks - a.blocks)
      .slice(0, limit)
      .map(({ username, name, title, avatar, isPro }) => ({ username, name, title, avatar, isPro }));
  } catch {
    return [];
  }
}
