-- Bento grid: remember which kind of layout a page has.
-- Run this in the Supabase SQL Editor after 012.
--
-- 1 = saved by the old fixed template (only block order mattered).
-- 2 = real grid positions (x, y, w, h).
--
-- Existing pages stay at 1 and are converted on the fly, in their block
-- order, every time they're shown, so nothing changes in the database until
-- the owner saves in the new editor. From then on they're saved as 2.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS layout_version SMALLINT NOT NULL DEFAULT 1;
ALTER TABLE profile_drafts ADD COLUMN IF NOT EXISTS layout_version SMALLINT NOT NULL DEFAULT 1;
