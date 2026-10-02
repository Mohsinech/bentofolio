import type { MetadataRoute } from "next";
import { createPublicClient } from "@/app/lib/supabase/profiles";
import { isPlaceholderUsername } from "@/app/lib/usernames";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev").replace(/\/$/, "");

// Rebuilt at most hourly.
export const revalidate = 3600;

// Marketing pages plus every public profile that's listed (owners can turn
// listing off in Settings).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_URL}/discover`, changeFrequency: "daily", priority: 0.7 },
    { url: `${APP_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const { data, error } = await createPublicClient()
      .from("profiles")
      .select("username, updated_at, layout, discoverable")
      .order("updated_at", { ascending: false })
      .limit(5000);
    if (error || !data) return pages;
    for (const profile of data) {
      if (!profile.username || isPlaceholderUsername(profile.username) || profile.discoverable === false) continue;
      if (!Array.isArray(profile.layout) || profile.layout.length === 0) continue;
      pages.push({
        url: `${APP_URL}/${encodeURIComponent(profile.username)}`,
        lastModified: profile.updated_at ? new Date(profile.updated_at) : undefined,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // Without the database the sitemap still lists the marketing pages.
  }
  return pages;
}
