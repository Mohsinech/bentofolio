-- Allow the current BentoFolio theme set.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_theme_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_theme_check
  CHECK (theme IN ('dark', 'light'));
