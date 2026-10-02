-- Verified revenue: all-time total, shown when a product has no MRR
-- (one-time sales) and next to MRR otherwise. Run after 014.

-- 014 gained this column after it was first shared; make sure it's here.
ALTER TABLE revenue_connections ADD COLUMN IF NOT EXISTS account_ref TEXT;
ALTER TABLE revenue_connections ADD COLUMN IF NOT EXISTS total_revenue NUMERIC;

-- The return type changes, so the function is dropped and recreated.
DROP FUNCTION IF EXISTS public_verified_revenue(UUID);

CREATE FUNCTION public_verified_revenue(p_profile_id UUID)
RETURNS TABLE (
  block_id TEXT,
  provider TEXT,
  mrr NUMERIC,
  currency TEXT,
  revenue JSONB,
  revenue_start TEXT,
  customers INTEGER,
  total_revenue NUMERIC,
  synced_at TIMESTAMPTZ
) AS $$
  SELECT block_id, provider, mrr, currency, revenue, revenue_start, customers, total_revenue, synced_at
  FROM revenue_connections
  WHERE profile_id = p_profile_id
    AND synced_at IS NOT NULL;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public_verified_revenue(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public_verified_revenue(UUID) TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';
