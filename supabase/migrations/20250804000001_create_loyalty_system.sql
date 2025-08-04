-- Enhanced Loyalty Program Tracking System - Database Schema
-- Points Companion - Phase 1, Prompt 2 Implementation

-- Enable RLS (Row Level Security)
-- This migration creates the complete database schema for loyalty program tracking

-- Create loyalty_programs table (reference data)
CREATE TABLE IF NOT EXISTS loyalty_programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('airline', 'hotel', 'credit_card', 'dining', 'shopping', 'other')),
    points_name TEXT NOT NULL DEFAULT 'points',
    logo_url TEXT,
    website TEXT,
    expiration_rules JSONB,
    elite_program JSONB,
    elite_tiers TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_accounts table (user data)
CREATE TABLE IF NOT EXISTS loyalty_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id TEXT NOT NULL REFERENCES loyalty_programs(id),
    account_number TEXT NOT NULL,
    account_name TEXT,
    balance_current INTEGER NOT NULL DEFAULT 0,
    balance_pending INTEGER DEFAULT 0,
    balance_lifetime INTEGER DEFAULT 0,
    expiration_date TIMESTAMP WITH TIME ZONE,
    expiring_points JSONB DEFAULT '[]'::jsonb,
    elite_status JSONB,
    sync_enabled BOOLEAN DEFAULT false,
    sync_frequency TEXT DEFAULT 'manual' CHECK (sync_frequency IN ('manual', 'daily', 'weekly', 'monthly')),
    credentials_encrypted TEXT,
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'disconnected' CHECK (sync_status IN ('connected', 'error', 'pending', 'disconnected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, program_id, account_number)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS loyalty_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    certificate_type TEXT NOT NULL CHECK (certificate_type IN ('free-night', 'companion', 'upgrade', 'lounge-access', 'other')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    restrictions TEXT[] DEFAULT '{}',
    estimated_value INTEGER DEFAULT 0,
    category TEXT,
    usage_instructions TEXT,
    transferable BOOLEAN DEFAULT false,
    used BOOLEAN DEFAULT false,
    used_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_insights table
CREATE TABLE IF NOT EXISTS loyalty_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('expiration_warning', 'optimization_tip', 'certificate_reminder', 'elite_progress', 'value_alert')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    action_required BOOLEAN DEFAULT false,
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    account_id UUID REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_goals table
CREATE TABLE IF NOT EXISTS loyalty_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('elite_status', 'award_redemption', 'certificate_earning', 'point_accumulation')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    current_progress INTEGER DEFAULT 0,
    target_date TIMESTAMP WITH TIME ZONE NOT NULL,
    associated_accounts UUID[] DEFAULT '{}',
    strategies TEXT[] DEFAULT '{}',
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_trends table (for analytics)
CREATE TABLE IF NOT EXISTS loyalty_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    trend_date DATE NOT NULL,
    balance INTEGER NOT NULL,
    points_earned INTEGER DEFAULT 0,
    points_redeemed INTEGER DEFAULT 0,
    points_expired INTEGER DEFAULT 0,
    activity_summary JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(account_id, trend_date)
);

-- Create sync_logs table (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS loyalty_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'automatic', 'bulk')),
    sync_status TEXT NOT NULL CHECK (sync_status IN ('started', 'completed', 'failed', 'partial')),
    changes_detected JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    sync_duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_user_id ON loyalty_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_program_id ON loyalty_accounts(program_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_sync_status ON loyalty_accounts(sync_status);
CREATE INDEX IF NOT EXISTS idx_loyalty_certificates_account_id ON loyalty_certificates(account_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_certificates_expiration ON loyalty_certificates(expiration_date);
CREATE INDEX IF NOT EXISTS idx_loyalty_insights_user_id ON loyalty_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_insights_dismissed ON loyalty_insights(dismissed);
CREATE INDEX IF NOT EXISTS idx_loyalty_goals_user_id ON loyalty_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_trends_account_date ON loyalty_trends(account_id, trend_date);
CREATE INDEX IF NOT EXISTS idx_loyalty_sync_logs_account_id ON loyalty_sync_logs(account_id);

-- Create RLS policies

-- Loyalty Accounts - Users can only see their own accounts
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty accounts" ON loyalty_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loyalty accounts" ON loyalty_accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loyalty accounts" ON loyalty_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loyalty accounts" ON loyalty_accounts
    FOR DELETE USING (auth.uid() = user_id);

-- Loyalty Certificates - Users can only see certificates for their accounts
ALTER TABLE loyalty_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty certificates" ON loyalty_certificates
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM loyalty_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert certificates for own accounts" ON loyalty_certificates
    FOR INSERT WITH CHECK (
        account_id IN (
            SELECT id FROM loyalty_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update certificates for own accounts" ON loyalty_certificates
    FOR UPDATE USING (
        account_id IN (
            SELECT id FROM loyalty_accounts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete certificates for own accounts" ON loyalty_certificates
    FOR DELETE USING (
        account_id IN (
            SELECT id FROM loyalty_accounts WHERE user_id = auth.uid()
        )
    );

-- Loyalty Insights - Users can only see their own insights
ALTER TABLE loyalty_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty insights" ON loyalty_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own loyalty insights" ON loyalty_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- Loyalty Goals - Users can only see their own goals
ALTER TABLE loyalty_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty goals" ON loyalty_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loyalty goals" ON loyalty_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loyalty goals" ON loyalty_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loyalty goals" ON loyalty_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Loyalty Trends - Users can only see trends for their accounts
ALTER TABLE loyalty_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trends for own accounts" ON loyalty_trends
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM loyalty_accounts WHERE user_id = auth.uid()
        )
    );

-- Loyalty Programs - Public read access (reference data)
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view loyalty programs" ON loyalty_programs
    FOR SELECT USING (true);

-- Sync Logs - Users can only see logs for their accounts
ALTER TABLE loyalty_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sync logs for own accounts" ON loyalty_sync_logs
    FOR SELECT USING (
        account_id IN (
            SELECT id FROM loyalty_accounts WHERE user_id = auth.uid()
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON loyalty_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_accounts_updated_at BEFORE UPDATE ON loyalty_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_certificates_updated_at BEFORE UPDATE ON loyalty_certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_insights_updated_at BEFORE UPDATE ON loyalty_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_goals_updated_at BEFORE UPDATE ON loyalty_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
