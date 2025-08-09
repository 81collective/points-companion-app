-- Add dashboard_preferences JSONB column to profiles for per-user dashboard customization
DO $$ BEGIN
  ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS dashboard_preferences JSONB NOT NULL DEFAULT '{}'::jsonb;
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table profiles does not exist. Ensure profiles table is created before running this migration.';
END $$;

-- Optional: ensure RLS policy allows users to update their own preferences
DO $$
BEGIN
  -- This policy name may already exist in some projects; ignore if duplicate
  CREATE POLICY "update_own_profile_preferences" ON profiles
  FOR UPDATE TO authenticated
  USING ( id = auth.uid() )
  WITH CHECK ( id = auth.uid() );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
