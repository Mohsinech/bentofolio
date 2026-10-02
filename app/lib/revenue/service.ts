import { createAdminClient } from "@/app/lib/supabase/admin";
import { RevenueError, type RevenueProvider, type RevenueSnapshot } from "./common";
import { decryptSecret, encryptSecret, keyHint } from "./crypto";
import { fetchStripeRevenue } from "./stripe";
import { fetchLemonSqueezyRevenue } from "./lemonsqueezy";

// Server-only: everything here uses the service role and handles API keys.

export const CONNECTION_FIELDS =
  "block_id, provider, key_hint, status, last_error, mrr, currency, revenue, revenue_start, customers, synced_at";

export function isProvider(value: unknown): value is RevenueProvider {
  return value === "stripe" || value === "lemonsqueezy";
}

// accountRef: the Lemon Squeezy store id for this block (unused for Stripe,
// where a key belongs to one account).
export async function fetchSnapshot(
  provider: RevenueProvider,
  key: string,
  accountRef?: string | null
): Promise<RevenueSnapshot & { accountRef: string | null }> {
  if (provider === "stripe") return { ...(await fetchStripeRevenue(key)), accountRef: null };
  const snapshot = await fetchLemonSqueezyRevenue(key, { storeId: accountRef });
  return { ...snapshot, accountRef: snapshot.storeId };
}

// The block must be a SaaS block on this person's draft or live page.
export async function ownsSaasBlock(profileId: string, blockId: string): Promise<boolean> {
  const admin = createAdminClient();
  const [{ data: live }, { data: draft }] = await Promise.all([
    admin.from("profiles").select("content").eq("id", profileId).maybeSingle(),
    admin.from("profile_drafts").select("content").eq("profile_id", profileId).maybeSingle(),
  ]);
  const isSaas = (content: unknown) =>
    Boolean(content && typeof content === "object" && (content as Record<string, { type?: string }>)[blockId]?.type === "saas");
  return isSaas(draft?.content) || isSaas(live?.content);
}

function snapshotColumns(snapshot: RevenueSnapshot) {
  return {
    status: "ok",
    last_error: null,
    mrr: snapshot.mrr,
    currency: snapshot.currency,
    revenue: snapshot.revenue,
    revenue_start: snapshot.revenueStart,
    customers: snapshot.customers,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function connectRevenue(
  profileId: string,
  blockId: string,
  provider: RevenueProvider,
  apiKey: string,
  accountRef?: string | null
) {
  // Fetching first doubles as validation: a key that can't read the data is
  // never stored.
  const snapshot = await fetchSnapshot(provider, apiKey, accountRef);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("revenue_connections")
    .upsert(
      {
        profile_id: profileId,
        block_id: blockId,
        provider,
        encrypted_key: encryptSecret(apiKey.trim()),
        key_hint: keyHint(apiKey),
        account_ref: snapshot.accountRef,
        ...snapshotColumns(snapshot),
      },
      { onConflict: "profile_id,block_id" }
    )
    .select(CONNECTION_FIELDS)
    .single();
  if (error) throw new RevenueError("provider", "Couldn't save the connection. Try again.");
  return data;
}

interface StoredConnection {
  profile_id: string;
  block_id: string;
  provider: RevenueProvider;
  encrypted_key: string;
  account_ref?: string | null;
}

// Re-reads one connection. On failure the last good numbers stay visible and
// the error is recorded for the owner.
export async function syncConnection(row: StoredConnection) {
  const admin = createAdminClient();
  try {
    const snapshot = await fetchSnapshot(row.provider, decryptSecret(row.encrypted_key), row.account_ref);
    const { data } = await admin
      .from("revenue_connections")
      .update(snapshotColumns(snapshot))
      .eq("profile_id", row.profile_id)
      .eq("block_id", row.block_id)
      .select(CONNECTION_FIELDS)
      .single();
    return { ok: true as const, data };
  } catch (error) {
    const message = error instanceof RevenueError ? error.message : "Sync failed. We'll try again tomorrow.";
    await admin
      .from("revenue_connections")
      .update({ status: "error", last_error: message, updated_at: new Date().toISOString() })
      .eq("profile_id", row.profile_id)
      .eq("block_id", row.block_id);
    return { ok: false as const, message };
  }
}

export async function loadConnection(profileId: string, blockId: string): Promise<(StoredConnection & { synced_at: string | null }) | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("revenue_connections")
    .select("profile_id, block_id, provider, encrypted_key, account_ref, synced_at")
    .eq("profile_id", profileId)
    .eq("block_id", blockId)
    .maybeSingle();
  return (data as (StoredConnection & { synced_at: string | null }) | null) ?? null;
}

export async function listConnections(profileId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("revenue_connections").select(CONNECTION_FIELDS).eq("profile_id", profileId);
  return data ?? [];
}

export async function disconnectRevenue(profileId: string, blockId: string) {
  const admin = createAdminClient();
  await admin.from("revenue_connections").delete().eq("profile_id", profileId).eq("block_id", blockId);
}

export async function syncAllConnections(limit = 500) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("revenue_connections")
    .select("profile_id, block_id, provider, encrypted_key, account_ref")
    .order("synced_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  let ok = 0;
  let failed = 0;
  for (const row of (data ?? []) as StoredConnection[]) {
    const result = await syncConnection(row);
    if (result.ok) ok++;
    else failed++;
  }
  return { ok, failed };
}
