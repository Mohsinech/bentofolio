-- Usernames: rules, reserved names, and a 30-day hold with redirects.
-- Run this in the Supabase SQL Editor after 011.
--
-- Rules are enforced here (not only in the app) because users can update
-- their own profile row directly with the public anon key.
--
--  * 3–30 characters: lowercase letters, numbers, "-" and "_", starting and
--    ending with a letter or number. Stored lowercase.
--  * Reserved names (app routes and common words) can't be taken.
--  * After a change, the old name redirects to the new one for 30 days and
--    nobody else can take it during that time.
--  * A profile can hold at most 3 old names at once, so names can't be
--    squatted by changing repeatedly.
--  * At signup an unusable name never blocks account creation: it falls
--    back to user_xxxxxxxx and the editor asks the person to pick a name.

-- ---------------------------------------------------------------------------
-- Reserved names
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reserved_usernames (
  username TEXT PRIMARY KEY CHECK (username = lower(username))
);

ALTER TABLE reserved_usernames ENABLE ROW LEVEL SECURITY;

INSERT INTO reserved_usernames (username) VALUES
  -- app routes (add new top-level routes here)
  ('api'), ('auth'), ('editor'), ('discover'), ('pricing'), ('contact'),
  ('invite'), ('v2-preview'), ('sitemap.xml'), ('robots.txt'), ('favicon.ico'),
  ('_next'), ('settings'), ('templates'), ('analytics'), ('webhooks'),
  ('preview'), ('onboarding'), ('checkout'), ('upgrade'), ('billing'),
  -- accounts and auth
  ('login'), ('logout'), ('signin'), ('signup'), ('register'), ('account'),
  ('accounts'), ('profile'), ('profiles'), ('user'), ('users'), ('me'),
  ('dashboard'), ('admin'), ('administrator'), ('root'), ('system'),
  -- company and support
  ('bentofolio'), ('bento'), ('about'), ('blog'), ('docs'), ('help'),
  ('support'), ('status'), ('security'), ('privacy'), ('terms'), ('legal'),
  ('careers'), ('jobs'), ('press'), ('team'), ('pro'), ('premium'),
  ('home'), ('explore'), ('search'), ('new'), ('app'), ('www'), ('mail'),
  ('email'), ('static'), ('assets'), ('public'), ('null'), ('undefined')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Old names: redirect and hold for 30 days
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS username_redirects (
  old_username TEXT PRIMARY KEY CHECK (old_username = lower(old_username)),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_username_redirects_profile
  ON username_redirects(profile_id);

-- No policies: read through resolve_username_redirect() only.
ALTER TABLE username_redirects ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Checking a name
-- ---------------------------------------------------------------------------

-- Returns 'ok', 'invalid', 'reserved', 'taken' or 'held'.
-- p_profile_id is the person asking: their own current and old names count
-- as available to them.
CREATE OR REPLACE FUNCTION check_username(p_username TEXT, p_profile_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  v_name TEXT := lower(trim(coalesce(p_username, '')));
BEGIN
  IF v_name !~ '^[a-z0-9]([a-z0-9_-]{1,28})[a-z0-9]$' THEN
    RETURN 'invalid';
  END IF;

  IF EXISTS (SELECT 1 FROM reserved_usernames WHERE username = v_name) THEN
    RETURN 'reserved';
  END IF;

  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE lower(username) = v_name
      AND id IS DISTINCT FROM p_profile_id
  ) THEN
    RETURN 'taken';
  END IF;

  IF EXISTS (
    SELECT 1 FROM username_redirects
    WHERE old_username = v_name
      AND expires_at > NOW()
      AND profile_id IS DISTINCT FROM p_profile_id
  ) THEN
    RETURN 'held';
  END IF;

  RETURN 'ok';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION check_username(TEXT, UUID) TO anon, authenticated, service_role;

-- Current username for an old one, while its redirect is active.
CREATE OR REPLACE FUNCTION resolve_username_redirect(p_username TEXT)
RETURNS TEXT AS $$
  SELECT p.username
  FROM username_redirects r
  JOIN profiles p ON p.id = r.profile_id
  WHERE r.old_username = lower(trim(p_username))
    AND r.expires_at > NOW()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION resolve_username_redirect(TEXT) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Enforcing the rules on every write
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION enforce_username_rules()
RETURNS TRIGGER AS $$
DECLARE
  v_status TEXT;
  v_fallback TEXT;
  v_held INTEGER;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.username IS NOT DISTINCT FROM OLD.username THEN
    RETURN NEW;
  END IF;

  NEW.username := lower(trim(NEW.username));
  v_status := check_username(NEW.username, NEW.id);

  IF TG_OP = 'INSERT' THEN
    -- Never block account creation: fall back to a placeholder the editor
    -- will ask the person to replace.
    IF v_status <> 'ok' THEN
      v_fallback := 'user_' || left(replace(NEW.id::text, '-', ''), 8);
      IF check_username(v_fallback, NEW.id) <> 'ok' THEN
        v_fallback := 'user_' || left(replace(NEW.id::text, '-', ''), 16);
      END IF;
      NEW.username := v_fallback;
    END IF;
    RETURN NEW;
  END IF;

  IF v_status <> 'ok' THEN
    RAISE EXCEPTION 'username_unavailable:%', v_status USING ERRCODE = 'P0001';
  END IF;

  -- Real names (not placeholders) are held after a change; cap how many.
  IF lower(OLD.username) !~ '^user_[0-9a-f]{8,16}$'
     AND lower(OLD.username) <> NEW.username THEN
    SELECT count(*) INTO v_held
    FROM username_redirects
    WHERE profile_id = NEW.id
      AND expires_at > NOW()
      AND old_username <> NEW.username;
    IF v_held >= 3 THEN
      RAISE EXCEPTION 'username_unavailable:limit' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS enforce_username_rules ON profiles;
CREATE TRIGGER enforce_username_rules
  BEFORE INSERT OR UPDATE OF username ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_username_rules();

CREATE OR REPLACE FUNCTION record_username_change()
RETURNS TRIGGER AS $$
BEGIN
  IF lower(OLD.username) = lower(NEW.username) THEN
    RETURN NEW;
  END IF;

  -- Taking back one of your own old names ends its redirect.
  DELETE FROM username_redirects WHERE old_username = lower(NEW.username);

  -- Placeholders were never shared, so they don't need a redirect.
  IF lower(OLD.username) !~ '^user_[0-9a-f]{8,16}$' THEN
    INSERT INTO username_redirects (old_username, profile_id, expires_at)
    VALUES (lower(OLD.username), NEW.id, NOW() + INTERVAL '30 days')
    ON CONFLICT (old_username)
    DO UPDATE SET profile_id = EXCLUDED.profile_id, expires_at = EXCLUDED.expires_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS record_username_change ON profiles;
CREATE TRIGGER record_username_change
  AFTER UPDATE OF username ON profiles
  FOR EACH ROW EXECUTE FUNCTION record_username_change();

-- ---------------------------------------------------------------------------
-- Case-insensitive uniqueness
-- ---------------------------------------------------------------------------
-- Existing names keep their case; new and changed names are lowercase.
-- The index is only created when no two existing names differ by case alone;
-- otherwise a notice lists them so they can be renamed first.

DO $$
DECLARE
  v_dupes TEXT;
BEGIN
  SELECT string_agg(lname, ', ') INTO v_dupes
  FROM (
    SELECT lower(username) AS lname FROM profiles
    GROUP BY lower(username) HAVING count(*) > 1
  ) d;

  IF v_dupes IS NULL THEN
    CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
      ON profiles (lower(username));
  ELSE
    RAISE NOTICE 'Not adding case-insensitive index; rename these first: %', v_dupes;
  END IF;
END $$;
