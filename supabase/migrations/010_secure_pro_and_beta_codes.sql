-- Secure Pro status and move beta codes into the database.
-- Run this in the Supabase SQL Editor.
--
-- 1. Users could previously set is_pro on their own profile row from the
--    browser (the update policy allows any column). A trigger now keeps the
--    billing columns unchanged unless the change comes from the server
--    (service role) or the SQL editor.
-- 2. Beta "free Pro" codes used to be hard-coded in the app (and are now
--    public). They live in beta_codes, with usage limits, and are redeemed
--    through a single function so each code counts its uses correctly.

-- ---------------------------------------------------------------------------
-- 1. Protect billing columns on profiles
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION protect_profile_billing_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.is_pro := false;
      NEW.upgraded_at := NULL;
      NEW.lemon_squeezy_order_id := NULL;
    ELSE
      NEW.is_pro := OLD.is_pro;
      NEW.upgraded_at := OLD.upgraded_at;
      NEW.lemon_squeezy_order_id := OLD.lemon_squeezy_order_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS protect_profile_billing_columns ON profiles;
CREATE TRIGGER protect_profile_billing_columns
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_billing_columns();

-- ---------------------------------------------------------------------------
-- 2. Beta codes
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS beta_codes (
  code TEXT PRIMARY KEY CHECK (code = upper(trim(code))),
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0), -- NULL = unlimited
  used_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS beta_code_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL REFERENCES beta_codes(code) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (code, user_id)
);

-- RLS on, no policies: only the server (service role) can read or write.
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_code_redemptions ENABLE ROW LEVEL SECURITY;

-- Returns one of: 'activated', 'already_redeemed', 'invalid', 'expired',
-- 'used_up', 'no_profile'.
CREATE OR REPLACE FUNCTION redeem_beta_code(p_code TEXT, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT := upper(trim(coalesce(p_code, '')));
  v_row beta_codes%ROWTYPE;
BEGIN
  IF v_code = '' THEN
    RETURN 'invalid';
  END IF;

  SELECT * INTO v_row FROM beta_codes WHERE code = v_code FOR UPDATE;

  IF NOT FOUND OR NOT v_row.active THEN
    RETURN 'invalid';
  END IF;

  IF v_row.expires_at IS NOT NULL AND v_row.expires_at < NOW() THEN
    RETURN 'expired';
  END IF;

  IF EXISTS (
    SELECT 1 FROM beta_code_redemptions
    WHERE code = v_code AND user_id = p_user_id
  ) THEN
    RETURN 'already_redeemed';
  END IF;

  IF v_row.max_uses IS NOT NULL AND v_row.used_count >= v_row.max_uses THEN
    RETURN 'used_up';
  END IF;

  UPDATE profiles
  SET is_pro = true,
      upgraded_at = COALESCE(upgraded_at, NOW()),
      lemon_squeezy_order_id = COALESCE(lemon_squeezy_order_id, 'beta-free:' || v_code)
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN 'no_profile';
  END IF;

  INSERT INTO beta_code_redemptions (code, user_id) VALUES (v_code, p_user_id);
  UPDATE beta_codes SET used_count = used_count + 1 WHERE code = v_code;

  RETURN 'activated';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION redeem_beta_code(TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION redeem_beta_code(TEXT, UUID) TO service_role;

-- Add new codes like this (pick fresh ones; the old built-in codes are public):
-- INSERT INTO beta_codes (code, max_uses, note) VALUES ('YOURNEWCODE', 20, 'Beta friends');
--
-- Turn a code off:
-- UPDATE beta_codes SET active = false WHERE code = 'YOURNEWCODE';
--
-- See who used what:
-- SELECT r.code, p.username, r.redeemed_at
-- FROM beta_code_redemptions r JOIN profiles p ON p.id = r.user_id
-- ORDER BY r.redeemed_at DESC;
