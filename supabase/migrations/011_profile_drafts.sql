-- Draft and publish.
-- Run this in the Supabase SQL Editor.
--
-- profiles.layout / content / theme stay the PUBLISHED page: public profile
-- pages, Discover and custom domains keep reading them unchanged.
-- Editor saves go to profile_drafts instead, which only the owner can read
-- (profiles is readable by everyone, so drafts must not live there).
-- Publishing copies the draft into profiles and removes the draft.

CREATE TABLE IF NOT EXISTS profile_drafts (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profile_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read their draft"
  ON profile_drafts FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Owners can create their draft"
  ON profile_drafts FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Owners can update their draft"
  ON profile_drafts FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Owners can delete their draft"
  ON profile_drafts FOR DELETE
  USING (auth.uid() = profile_id);

-- When the live page was last published.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
