-- Analytics table for tracking profile views and clicks
CREATE TABLE IF NOT EXISTS profile_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'link_click')),
  referrer TEXT,
  user_agent TEXT,
  clicked_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_analytics_profile_id ON profile_analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON profile_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON profile_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_profile_date ON profile_analytics(profile_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE profile_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profile owners can read their own analytics
CREATE POLICY "Users can read their own analytics"
  ON profile_analytics FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()));

-- System can insert analytics (via service role)
CREATE POLICY "System can insert analytics"
  ON profile_analytics FOR INSERT
  WITH CHECK (true);

-- Optionally allow profile owners to delete their analytics
CREATE POLICY "Users can delete their own analytics"
  ON profile_analytics FOR DELETE
  USING (profile_id IN (SELECT id FROM profiles WHERE id = auth.uid()));
