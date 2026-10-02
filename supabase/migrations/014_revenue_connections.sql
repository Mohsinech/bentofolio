-- Verified revenue: connect Stripe or Lemon Squeezy to a SaaS block.
-- Run this in the Supabase SQL Editor after 013.
--
-- The provider API key is stored encrypted (AES-256-GCM, key in the
-- REVENUE_ENCRYPTION_KEY server variable), in a table only the server can
-- read. The page never sees the key.
--
-- Public pages read the synced numbers through public_verified_revenue(),
-- never from the page's own content, so a "Verified" badge can't be faked by
-- editing the page data.

CREATE TABLE IF NOT EXISTS revenue_connections (
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'lemonsqueezy')),
  encrypted_key TEXT NOT NULL,
  key_hint TEXT NOT NULL,              -- e.g. "rk_live_…a1b2", safe to show
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'error')),
  last_error TEXT,
  mrr NUMERIC,                          -- monthly recurring revenue, major units
  currency TEXT,
  revenue JSONB NOT NULL DEFAULT '[]'::jsonb,  -- monthly revenue, oldest first
  revenue_start TEXT,                   -- "YYYY-MM" of revenue[0]
  customers INTEGER,                    -- active subscriptions
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (profile_id, block_id)
);

-- Which store a Lemon Squeezy key reads (a key sees every store on the
-- account). Added separately so re-running this file upgrades older copies.
ALTER TABLE revenue_connections ADD COLUMN IF NOT EXISTS account_ref TEXT;

-- RLS on with no policies: only the server (service role) can touch it.
ALTER TABLE revenue_connections ENABLE ROW LEVEL SECURITY;

-- Synced numbers for one page, without keys or errors. Safe for anyone.
CREATE OR REPLACE FUNCTION public_verified_revenue(p_profile_id UUID)
RETURNS TABLE (
  block_id TEXT,
  provider TEXT,
  mrr NUMERIC,
  currency TEXT,
  revenue JSONB,
  revenue_start TEXT,
  customers INTEGER,
  synced_at TIMESTAMPTZ
) AS $$
  SELECT block_id, provider, mrr, currency, revenue, revenue_start, customers, synced_at
  FROM revenue_connections
  WHERE profile_id = p_profile_id
    AND synced_at IS NOT NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public_verified_revenue(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public_verified_revenue(UUID) TO anon, authenticated, service_role;
