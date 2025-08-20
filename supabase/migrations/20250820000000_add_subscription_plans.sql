-- Add subscription and plan information to profiles table
-- This enables plan-based access to different AI models

-- Add subscription plan column to profiles table
DO $$ BEGIN
  ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free' 
    CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise'));
EXCEPTION WHEN undefined_table THEN
  RAISE NOTICE 'Table profiles does not exist. Ensure profiles table is created before running this migration.';
END $$;

-- Add subscription expiry date
DO $$ BEGIN
  ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- Add subscription status
DO $$ BEGIN
  ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'expired', 'cancelled', 'paused'));
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- Create index for plan queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- Create a view for active subscriptions
CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  id,
  email,
  subscription_plan,
  subscription_status,
  subscription_expires_at,
  CASE 
    WHEN subscription_status = 'active' AND 
         (subscription_expires_at IS NULL OR subscription_expires_at > NOW()) 
    THEN true 
    ELSE false 
  END as is_subscription_active
FROM profiles;

-- Enable RLS on the view
ALTER VIEW active_subscriptions OWNER TO postgres;

-- Grant appropriate permissions
GRANT SELECT ON active_subscriptions TO authenticated;

-- Create RLS policy for the view 
CREATE POLICY "Users can view their own subscription status" ON profiles
  FOR SELECT USING (auth.uid() = id);