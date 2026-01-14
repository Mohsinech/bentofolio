-- Add custom domain support for Pro users
-- Run this in your Supabase SQL Editor

-- Add custom_domain column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS custom_domain TEXT DEFAULT NULL;

-- Add unique constraint for custom domains
ALTER TABLE profiles
ADD CONSTRAINT profiles_custom_domain_unique UNIQUE (custom_domain);

-- Index for fast custom domain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON profiles(custom_domain);

-- Comment for documentation
COMMENT ON COLUMN profiles.custom_domain IS 'Custom domain for Pro users (e.g., john.dev)';
