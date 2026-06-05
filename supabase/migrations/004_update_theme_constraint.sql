-- Migration: Update theme constraint to include all themes
-- Run this in your Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_theme_check;

-- Add new constraint with all theme options
ALTER TABLE profiles ADD CONSTRAINT profiles_theme_check 
  CHECK (theme IN ('dark', 'light'));
