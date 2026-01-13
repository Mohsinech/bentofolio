-- Add Pro and Analytics fields to profiles table
-- Run this migration in Supabase SQL Editor

-- Add Pro status columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lemon_squeezy_order_id TEXT;

-- Create analytics table
CREATE TABLE IF NOT EXISTS profile_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'click', etc.
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster analytics queries
CREATE INDEX IF NOT EXISTS idx_profile_analytics_profile_id ON profile_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_created_at ON profile_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_event_type ON profile_analytics(event_type);

-- Enable Row Level Security
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own analytics
CREATE POLICY "Users can read own analytics" ON profile_analytics
  FOR SELECT
  USING (profile_id = auth.uid());

-- Policy: Anyone can insert analytics (for tracking views)
CREATE POLICY "Anyone can insert analytics" ON profile_analytics
  FOR INSERT
  WITH CHECK (true);

-- Add is_public column to profiles for discover feature
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Create index for public profiles
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public) WHERE is_public = true;
