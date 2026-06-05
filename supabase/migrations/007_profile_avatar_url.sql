-- Add workspace avatar image for the editor/sidebar profile.
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;
