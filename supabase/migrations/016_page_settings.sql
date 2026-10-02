-- Settings page: display options for the public page.
-- Run in the Supabase SQL Editor after 015. Safe to run more than once.

-- Which view visitors see first: the bento grid or the CV.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_view TEXT NOT NULL DEFAULT 'grid';
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_default_view_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_default_view_check CHECK (default_view IN ('grid', 'cv'));

-- Listed on Discover and the landing page's "Made on bentofolio".
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discoverable BOOLEAN NOT NULL DEFAULT true;

-- Pro pages hide the "Made with bentofolio" tag unless the owner turns it
-- back on. Free pages always show it.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_made_with BOOLEAN NOT NULL DEFAULT false;

-- Custom domains are looked up on every request to a non-bentofolio host.
CREATE INDEX IF NOT EXISTS idx_profiles_custom_domain ON profiles (lower(custom_domain)) WHERE custom_domain IS NOT NULL;

NOTIFY pgrst, 'reload schema';
