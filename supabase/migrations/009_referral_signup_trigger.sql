-- Record referral signups at the database level.
-- This makes Invite & Earn reliable even if the auth callback URL loses ?ref=.

CREATE OR REPLACE FUNCTION record_auth_referral_signup()
RETURNS TRIGGER AS $$
DECLARE
  referral_code_value TEXT;
BEGIN
  referral_code_value := UPPER(TRIM(NEW.raw_user_meta_data->>'referral_code'));

  IF referral_code_value IS NULL OR referral_code_value = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO referral_signups (
    invite_id,
    inviter_id,
    referred_user_id,
    referred_email
  )
  SELECT
    referral_invites.id,
    referral_invites.inviter_id,
    NEW.id,
    NEW.email
  FROM referral_invites
  WHERE referral_invites.referral_code = referral_code_value
    AND referral_invites.inviter_id <> NEW.id
  ON CONFLICT (referred_user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS zzz_record_auth_referral_signup ON auth.users;

CREATE TRIGGER zzz_record_auth_referral_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION record_auth_referral_signup();

-- Backfill any users who already signed up with referral metadata before this
-- trigger existed.
INSERT INTO referral_signups (
  invite_id,
  inviter_id,
  referred_user_id,
  referred_email
)
SELECT
  referral_invites.id,
  referral_invites.inviter_id,
  auth.users.id,
  auth.users.email
FROM auth.users
JOIN referral_invites
  ON referral_invites.referral_code =
    UPPER(TRIM(auth.users.raw_user_meta_data->>'referral_code'))
WHERE auth.users.raw_user_meta_data->>'referral_code' IS NOT NULL
  AND referral_invites.inviter_id <> auth.users.id
ON CONFLICT (referred_user_id) DO NOTHING;
