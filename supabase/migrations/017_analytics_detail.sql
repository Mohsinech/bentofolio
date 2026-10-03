-- Analytics dashboard: more useful detail per event, still privacy-friendly.
-- Run in the Supabase SQL Editor after 016. Safe to run more than once.

-- The table was first created by 003 or 005, with different columns
-- depending on which ran first. Make sure it exists and has them all.
CREATE TABLE IF NOT EXISTS profile_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;

-- Link clicks: the address that was clicked (missing when 003 made the table).
ALTER TABLE profile_analytics ADD COLUMN IF NOT EXISTS clicked_url TEXT;

-- Two-letter country from the visitor's IP (Vercel provides it); the IP
-- itself is never stored.
ALTER TABLE profile_analytics ADD COLUMN IF NOT EXISTS country TEXT;

-- Anonymous visitor id: a hash of IP + browser + day + a server secret.
-- Counts unique visitors per day without cookies; can't be reversed or
-- linked across days.
ALTER TABLE profile_analytics ADD COLUMN IF NOT EXISTS visitor_hash TEXT;

-- For link clicks: which block the link was in (github, social, link…).
ALTER TABLE profile_analytics ADD COLUMN IF NOT EXISTS block TEXT;

CREATE INDEX IF NOT EXISTS idx_analytics_profile_type_date
  ON profile_analytics (profile_id, event_type, created_at DESC);

NOTIFY pgrst, 'reload schema';
