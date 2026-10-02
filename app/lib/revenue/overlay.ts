import type { BlockContent } from "@/app/lib/types";
import type { RevenueProvider } from "./common";

// Numbers synced from a payment provider for one SaaS block. This is what
// public pages and the editor are allowed to see (never the key).
export interface VerifiedRevenue {
  block_id: string;
  provider: RevenueProvider;
  mrr: number | string | null;
  currency: string | null;
  revenue: number[] | null;
  revenue_start: string | null;
  customers: number | null;
  total_revenue?: number | string | null;
  synced_at: string | null;
}

// Puts verified numbers into the matching SaaS blocks and removes any
// "verified" flag from blocks without a live connection, so the badge can only
// come from the server's own records, never from edited page data.
export function applyVerifiedRevenue(
  content: Record<string, BlockContent>,
  rows: VerifiedRevenue[] | null | undefined
): Record<string, BlockContent> {
  const byBlock = new Map((rows ?? []).filter((row) => row.synced_at).map((row) => [row.block_id, row]));
  let changed = false;
  const next: Record<string, BlockContent> = {};

  for (const [id, block] of Object.entries(content)) {
    if (block?.type !== "saas") {
      next[id] = block;
      continue;
    }
    const row = byBlock.get(id);
    if (!row) {
      if (block.data.verified) {
        const data = { ...block.data };
        delete data.verified;
        next[id] = { ...block, data };
        changed = true;
      } else {
        next[id] = block;
      }
      continue;
    }
    next[id] = {
      ...block,
      data: {
        ...block.data,
        mrr: Number(row.mrr ?? 0),
        currency: row.currency ?? block.data.currency,
        revenue: Array.isArray(row.revenue) ? row.revenue.map(Number) : [],
        revenueStart: row.revenue_start ?? undefined,
        customers: row.customers ?? undefined,
        totalRevenue: row.total_revenue == null ? undefined : Number(row.total_revenue),
        verified: { provider: row.provider, syncedAt: row.synced_at! },
      },
    };
    changed = true;
  }

  return changed ? next : content;
}
