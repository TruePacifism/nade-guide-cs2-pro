
-- Fix 1: Restrict grenade_throws SELECT to public throws or owner's own
DROP POLICY "Public throws are viewable by everyone" ON grenade_throws;

CREATE POLICY "Throws visible by owner or if public"
  ON grenade_throws
  FOR SELECT
  USING (
    is_public = true
    OR auth.uid() = user_id
  );

-- Fix 2: Prevent users from self-verifying by preserving is_verified value
DROP POLICY "Users can update own throws" ON grenade_throws;

CREATE POLICY "Users can update own throws"
  ON grenade_throws
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND is_verified = false
  );
