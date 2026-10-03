// Pages listed on /discover: real, filled-in pages whose owners didn't turn
// listing off, with what makes each worth a click.

import { publicPage } from "@/app/lib/public-page";
import type { Proof } from "@/app/lib/profile-summary";
import { createPublicClient, getVerifiedRevenue, toProfileData } from "@/app/lib/supabase/profiles";
import { isPlaceholderUsername } from "@/app/lib/usernames";
import type { BlockContent } from "@/app/lib/types";

export type DiscoverRole = "developer" | "designer" | "founder" | "creator";

export interface DiscoverProfile {
  username: string;
  name: string;
  headline: string;
  location: string;
  // A URL the browser can load (data: pictures go through /api/avatar).
  avatar: string | null;
  isPro: boolean;
  proof: Proof | null;
  verifiedRevenue: boolean;
  openToWork: boolean;
  roles: DiscoverRole[];
  blocks: number;
}

const ROLE_WORDS: [DiscoverRole, RegExp][] = [
  ["developer", /\b(develop|engineer|programm|software|front[- ]?end|back[- ]?end|full[- ]?stack|devops|web dev|mobile dev|coder|data scien|ml |ai engineer)/i],
  ["designer", /\b(design|ux|ui\b|ui\/|brand|illustrat|art director|creative director|motion)/i],
  ["founder", /\b(founder|co-?founder|ceo|indie ?hacker|maker|bootstrap|building|solopreneur|entrepreneur)/i],
  ["creator", /\b(creator|writer|youtuber|content|podcast|photograph|video|artist|musician|streamer)/i],
];

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function rolesOf(words: string): DiscoverRole[] {
  return ROLE_WORDS.filter(([, pattern]) => pattern.test(words)).map(([role]) => role);
}

function isOpenToWork(blocks: BlockContent[]): boolean {
  for (const block of blocks) {
    if (block.type === "availability") {
      if (block.data.forHire || block.data.status === "available") return true;
    }
    if (block.type === "identity") {
      const status = text(block.data.availability) || text(block.data.eyebrow);
      if (status && !/\b(not|no longer|booked|busy|unavailable)\b/i.test(status)) return true;
    }
  }
  return false;
}

function avatarUrl(username: string, src: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("data:image/")) return `/api/avatar/${encodeURIComponent(username)}`;
  if (/^https?:\/\//i.test(src) || src.startsWith("/")) return src;
  return null;
}

export async function getDiscoverProfiles(limit = 120): Promise<DiscoverProfile[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return [];
  try {
    const { data, error } = await createPublicClient()
      .from("profiles")
      .select("*")
      .not("content", "is", null)
      .order("updated_at", { ascending: false })
      .limit(400);
    if (error || !data) return [];

    const rows = data.filter(
      (row) => row.username && row.discoverable !== false && !isPlaceholderUsername(row.username) && Array.isArray(row.layout) && row.layout.length > 0
    );

    const profiles = await Promise.all(
      rows.map(async (row): Promise<(DiscoverProfile & { updatedAt: number }) | null> => {
        const profile = toProfileData(row);
        const hasSaas = Object.values(profile.content || {}).some((block) => block?.type === "saas");
        const verified = hasSaas ? await getVerifiedRevenue(profile.id) : [];
        const { blocks, summary } = publicPage(profile, verified);
        if (!summary.hasName || !summary.headline || blocks.length < 3) return null;

        const identity = blocks.find((block) => block.type === "identity");
        const words =
          identity?.type === "identity"
            ? `${text(identity.data.title)} ${text(identity.data.headline)} ${text(identity.data.bio)}`
            : summary.headline;
        const verifiedRevenue = summary.proofs.some((proof) => proof.verified);

        return {
          username: profile.username,
          name: summary.name,
          headline: summary.headline,
          location: summary.location,
          avatar: avatarUrl(profile.username, summary.avatar),
          isPro: profile.isPro,
          proof: summary.proofs[0] ?? null,
          verifiedRevenue,
          openToWork: isOpenToWork(blocks),
          roles: rolesOf(words),
          blocks: blocks.length,
          updatedAt: row.updated_at ? Date.parse(row.updated_at) : 0,
        };
      })
    );

    return profiles
      .filter((profile): profile is DiscoverProfile & { updatedAt: number } => Boolean(profile))
      // Verified revenue and Pro pages first, then fuller pages, then recent.
      .sort(
        (a, b) =>
          Number(b.verifiedRevenue) - Number(a.verifiedRevenue) ||
          Number(b.isPro) - Number(a.isPro) ||
          Math.min(b.blocks, 8) - Math.min(a.blocks, 8) ||
          b.updatedAt - a.updatedAt
      )
      .slice(0, limit)
      .map(({ updatedAt: _updatedAt, ...profile }) => profile);
  } catch {
    return [];
  }
}
