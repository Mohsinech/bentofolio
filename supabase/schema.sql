-- BentoFolio Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (stores user portfolio data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT NULL,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  layout JSONB DEFAULT '[]'::jsonb,
  content JSONB DEFAULT '{}'::jsonb,
  is_pro BOOLEAN DEFAULT false,
  custom_domain TEXT UNIQUE DEFAULT NULL,
  upgraded_at TIMESTAMPTZ,
  lemon_squeezy_order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast username lookups (public profiles)
CREATE INDEX idx_profiles_username ON profiles(username);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can read profiles (for public profile pages)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can only delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || LEFT(NEW.id::text, 8)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Optional: Function to check username availability
CREATE OR REPLACE FUNCTION is_username_available(requested_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM profiles WHERE username = requested_username
  );
END;
$$ LANGUAGE plpgsql;

-- Invite & Earn referral tables
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
