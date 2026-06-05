-- Invite & Earn referral system
-- Run this in Supabase SQL Editor after the existing profile migrations.

CREATE TABLE IF NOT EXISTS referral_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  referral_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_id UUID NOT NULL REFERENCES referral_invites(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (referred_user_id)
);

CREATE TABLE IF NOT EXISTS referral_reward_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  threshold INTEGER DEFAULT 5,
  sent_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_invites_inviter_id
  ON referral_invites(inviter_id);

CREATE INDEX IF NOT EXISTS idx_referral_invites_referral_code
  ON referral_invites(referral_code);

CREATE INDEX IF NOT EXISTS idx_referral_signups_inviter_id
  ON referral_signups(inviter_id);

CREATE INDEX IF NOT EXISTS idx_referral_reward_codes_user_id
  ON referral_reward_codes(user_id);

ALTER TABLE referral_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_reward_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral invites"
  ON referral_invites FOR SELECT
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create own referral invites"
  ON referral_invites FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can read own referral signups"
  ON referral_signups FOR SELECT
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can read own referral reward codes"
  ON referral_reward_codes FOR SELECT
  USING (auth.uid() = user_id);
