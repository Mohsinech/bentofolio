-- Analytics dashboard: more useful detail per event, still privacy-friendly.
-- Run in the Supabase SQL Editor after 016. Safe to run more than once.

-- Two-letter country from the visitor's IP (Vercel provides it); the IP
-- itself is never stored.
ALTER TABLE profile_analytics ADD COLUMN IF NOT EXISTS country TEXT;

-- Anonymous visitor id: a hash of IP + browser + day + a server secret.
-- Counts unique visitors per day without cookies; can't be reversed or
-- linked across days.
ALTER TABLE profile_analytics ADD COLUMN IF NOT EXISTS visitor_hash TEXT;

-- For link clicks: which block the link was in (github, social, link…).
ALTER TABLE profile_analytics ADD COLUMN IF NOT EXISTS block TEXT;

-- clicked_url already exists (005) but was never filled in; nothing to add.

CREATE INDEX IF NOT EXISTS idx_analytics_profile_type_date
  ON profile_analytics (profile_id, event_type, created_at DESC);

NOTIFY pgrst, 'reload schema';
