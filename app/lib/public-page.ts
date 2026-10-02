// A public page as visitors see it: verified numbers applied, Pro-only and
// empty blocks removed, in reading order, plus its one-glance summary.

import { publicLayout, resolveLayout } from "@/app/components/bento/grid-layout";
import { applyVerifiedRevenue, type VerifiedRevenue } from "@/app/lib/revenue/overlay";
import { summarizeProfile, type ProfileSummary } from "@/app/lib/profile-summary";
import type { ProfileData } from "@/app/lib/supabase/profiles";
import type { BlockContent } from "@/app/lib/types";

export function publicPage(profile: ProfileData, verified: VerifiedRevenue[]) {
  const content = applyVerifiedRevenue(profile.content, verified);
  const visible = publicLayout(resolveLayout(profile.layout, profile.layoutVersion), content, profile.isPro);
  const blocks = [...visible]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((item) => content[item.id])
    .filter((block): block is BlockContent => Boolean(block));
  const summary: ProfileSummary = summarizeProfile(profile.username, blocks, profile.avatarUrl);
  return { content, blocks, summary };
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://bentofolio.dev").replace(/\/$/, "");

export function appUrl(path = ""): string {
  return `${APP_URL}${path}`;
}

// The page's one address for search engines. Always bentofolio.dev/name: a
// custom domain is saved before its DNS works, so it can't be trusted here,
// and pages on custom domains point back to it.
export function canonicalUrl(profile: Pick<ProfileData, "username">): string {
  return appUrl(`/${profile.username}`);
}
