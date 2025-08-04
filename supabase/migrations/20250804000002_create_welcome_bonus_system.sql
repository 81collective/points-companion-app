-- Welcome Bonus Management System Database Schema
-- Points Companion - Phase 1, Prompt 3 Implementation

-- Create welcome_bonuses table for tracking bonus requirements
CREATE TABLE welcome_bonuses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    card_name TEXT NOT NULL,
    card_issuer TEXT NOT NULL,
    required_spend DECIMAL(10,2) NOT NULL CHECK (required_spend > 0),
    deadline DATE NOT NULL,
    bonus_amount INTEGER NOT NULL CHECK (bonus_amount > 0),
    bonus_type TEXT NOT NULL CHECK (bonus_type IN ('points', 'miles', 'cashback', 'statement_credit')),
    bonus_description TEXT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    application_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'paused')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    estimated_value DECIMAL(8,2) NOT NULL DEFAULT 0,
    notes TEXT,
    completed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bonus_progress table for tracking spending progress
CREATE TABLE bonus_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bonus_id UUID NOT NULL REFERENCES welcome_bonuses(id) ON DELETE CASCADE,
    current_spend DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (current_spend >= 0),
    last_transaction_date DATE,
    progress_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN (SELECT required_spend FROM welcome_bonuses WHERE id = bonus_id) > 0 
            THEN LEAST(100, (current_spend / (SELECT required_spend FROM welcome_bonuses WHERE id = bonus_id)) * 100)
            ELSE 0
        END
    ) STORED,
    sync_enabled BOOLEAN DEFAULT false,
    sync_frequency TEXT DEFAULT 'manual' CHECK (sync_frequency IN ('manual', 'daily', 'weekly', 'monthly')),
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status TEXT DEFAULT 'disconnected' CHECK (sync_status IN ('connected', 'error', 'pending', 'disconnected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bonus_id)
);

-- Create bonus_milestones table for tracking intermediate rewards
CREATE TABLE bonus_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bonus_id UUID NOT NULL REFERENCES welcome_bonuses(id) ON DELETE CASCADE,
    threshold DECIMAL(10,2) NOT NULL CHECK (threshold > 0),
    reward TEXT NOT NULL,
    achieved BOOLEAN DEFAULT false,
    achieved_date DATE,
    points_value INTEGER,
    cash_value DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spending_recommendations table for AI-generated suggestions
CREATE TABLE spending_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bonus_id UUID REFERENCES welcome_bonuses(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    suggested_merchants JSONB DEFAULT '[]',
    points_impact INTEGER NOT NULL DEFAULT 0,
    urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
    reasoning TEXT,
    estimated_completion_date DATE,
    alternative_options JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    accepted BOOLEAN DEFAULT false,
    accepted_date TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bonus_notifications table for alerts and reminders
CREATE TABLE bonus_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bonus_id UUID REFERENCES welcome_bonuses(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('milestone', 'deadline_warning', 'completion', 'expiration', 'opportunity')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    action_required BOOLEAN DEFAULT false,
    action_url TEXT,
    read BOOLEAN DEFAULT false,
    dismissed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bonus_achievements table for gamification
CREATE TABLE bonus_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    category TEXT NOT NULL CHECK (category IN ('completion', 'speed', 'value', 'efficiency', 'streak')),
    criteria JSONB NOT NULL,
    earned BOOLEAN DEFAULT false,
    earned_date TIMESTAMP WITH TIME ZONE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    rewards JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create spending_transactions table for transaction tracking
CREATE TABLE spending_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bonus_id UUID REFERENCES welcome_bonuses(id) ON DELETE SET NULL,
    transaction_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    merchant TEXT NOT NULL,
    category TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    contributes_to_bonus BOOLEAN DEFAULT true,
    verified BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'bank_sync', 'credit_monitoring')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_welcome_bonuses_user_id ON welcome_bonuses(user_id);
CREATE INDEX idx_welcome_bonuses_status ON welcome_bonuses(status);
CREATE INDEX idx_welcome_bonuses_deadline ON welcome_bonuses(deadline);
CREATE INDEX idx_welcome_bonuses_priority ON welcome_bonuses(priority);

CREATE INDEX idx_bonus_progress_bonus_id ON bonus_progress(bonus_id);
CREATE INDEX idx_bonus_progress_sync_status ON bonus_progress(sync_status);

CREATE INDEX idx_bonus_milestones_bonus_id ON bonus_milestones(bonus_id);
CREATE INDEX idx_bonus_milestones_achieved ON bonus_milestones(achieved);

CREATE INDEX idx_spending_recommendations_user_id ON spending_recommendations(user_id);
CREATE INDEX idx_spending_recommendations_bonus_id ON spending_recommendations(bonus_id);
CREATE INDEX idx_spending_recommendations_urgency ON spending_recommendations(urgency);
CREATE INDEX idx_spending_recommendations_expires_at ON spending_recommendations(expires_at);

CREATE INDEX idx_bonus_notifications_user_id ON bonus_notifications(user_id);
CREATE INDEX idx_bonus_notifications_read ON bonus_notifications(read);
CREATE INDEX idx_bonus_notifications_type ON bonus_notifications(type);

CREATE INDEX idx_bonus_achievements_user_id ON bonus_achievements(user_id);
CREATE INDEX idx_bonus_achievements_earned ON bonus_achievements(earned);
CREATE INDEX idx_bonus_achievements_category ON bonus_achievements(category);

CREATE INDEX idx_spending_transactions_user_id ON spending_transactions(user_id);
CREATE INDEX idx_spending_transactions_bonus_id ON spending_transactions(bonus_id);
CREATE INDEX idx_spending_transactions_date ON spending_transactions(transaction_date);
CREATE INDEX idx_spending_transactions_category ON spending_transactions(category);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_welcome_bonuses_updated_at BEFORE UPDATE ON welcome_bonuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bonus_progress_updated_at BEFORE UPDATE ON bonus_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bonus_milestones_updated_at BEFORE UPDATE ON bonus_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spending_recommendations_updated_at BEFORE UPDATE ON spending_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bonus_notifications_updated_at BEFORE UPDATE ON bonus_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bonus_achievements_updated_at BEFORE UPDATE ON bonus_achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spending_transactions_updated_at BEFORE UPDATE ON spending_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update bonus progress when milestones are achieved
CREATE OR REPLACE FUNCTION update_milestone_achievement()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if milestone should be marked as achieved
    IF NOT OLD.achieved AND NEW.achieved THEN
        NEW.achieved_date = CURRENT_DATE;
    END IF;
    
    -- Update bonus completion status if all spending requirement is met
    UPDATE welcome_bonuses 
    SET status = 'completed', completed_date = CURRENT_DATE
    WHERE id = NEW.bonus_id 
    AND status = 'active'
    AND (
        SELECT current_spend 
        FROM bonus_progress 
        WHERE bonus_id = NEW.bonus_id
    ) >= required_spend;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER milestone_achievement_trigger 
    BEFORE UPDATE ON bonus_milestones 
    FOR EACH ROW 
    EXECUTE FUNCTION update_milestone_achievement();

-- Create function to update progress when spending is added
CREATE OR REPLACE FUNCTION update_bonus_progress_from_spending()
RETURNS TRIGGER AS $$
DECLARE
    bonus_record RECORD;
    new_progress DECIMAL(5,2);
BEGIN
    -- Get bonus information
    SELECT * INTO bonus_record 
    FROM welcome_bonuses 
    WHERE id = NEW.bonus_id;
    
    -- Update last transaction date
    UPDATE bonus_progress 
    SET last_transaction_date = NEW.transaction_date,
        updated_at = NOW()
    WHERE bonus_id = NEW.bonus_id;
    
    -- Calculate new progress percentage
    SELECT progress_percentage INTO new_progress
    FROM bonus_progress 
    WHERE bonus_id = NEW.bonus_id;
    
    -- Check and update milestones
    UPDATE bonus_milestones 
    SET achieved = true, achieved_date = CURRENT_DATE
    WHERE bonus_id = NEW.bonus_id 
    AND threshold <= (
        SELECT current_spend 
        FROM bonus_progress 
        WHERE bonus_id = NEW.bonus_id
    )
    AND NOT achieved;
    
    -- Create notification if bonus is completed
    IF new_progress >= 100 AND bonus_record.status = 'active' THEN
        INSERT INTO bonus_notifications (user_id, bonus_id, type, title, message, severity)
        VALUES (
            NEW.user_id, 
            NEW.bonus_id, 
            'completion',
            'Bonus Completed!',
            'Congratulations! You have completed the welcome bonus for ' || bonus_record.card_name,
            'success'
        );
        
        UPDATE welcome_bonuses 
        SET status = 'completed', completed_date = CURRENT_DATE
        WHERE id = NEW.bonus_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER spending_transaction_trigger 
    AFTER INSERT ON spending_transactions 
    FOR EACH ROW 
    WHEN (NEW.contributes_to_bonus = true AND NEW.bonus_id IS NOT NULL)
    EXECUTE FUNCTION update_bonus_progress_from_spending();

-- Create function to automatically update current_spend in bonus_progress
CREATE OR REPLACE FUNCTION calculate_bonus_current_spend()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_spend based on all transactions for this bonus
    UPDATE bonus_progress 
    SET current_spend = (
        SELECT COALESCE(SUM(amount), 0)
        FROM spending_transactions 
        WHERE bonus_id = NEW.bonus_id 
        AND contributes_to_bonus = true
        AND verified = true
    )
    WHERE bonus_id = NEW.bonus_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_current_spend_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON spending_transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION calculate_bonus_current_spend();

-- Row Level Security (RLS) Policies
ALTER TABLE welcome_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for welcome_bonuses
CREATE POLICY "Users can view their own bonuses" ON welcome_bonuses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bonuses" ON welcome_bonuses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bonuses" ON welcome_bonuses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bonuses" ON welcome_bonuses
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for bonus_progress
CREATE POLICY "Users can view progress for their bonuses" ON bonus_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM welcome_bonuses 
            WHERE id = bonus_progress.bonus_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert progress for their bonuses" ON bonus_progress
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM welcome_bonuses 
            WHERE id = bonus_progress.bonus_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update progress for their bonuses" ON bonus_progress
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM welcome_bonuses 
            WHERE id = bonus_progress.bonus_id 
            AND user_id = auth.uid()
        )
    );

-- Policies for bonus_milestones
CREATE POLICY "Users can view milestones for their bonuses" ON bonus_milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM welcome_bonuses 
            WHERE id = bonus_milestones.bonus_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage milestones for their bonuses" ON bonus_milestones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM welcome_bonuses 
            WHERE id = bonus_milestones.bonus_id 
            AND user_id = auth.uid()
        )
    );

-- Policies for spending_recommendations
CREATE POLICY "Users can view their own recommendations" ON spending_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recommendations" ON spending_recommendations
    FOR ALL USING (auth.uid() = user_id);

-- Policies for bonus_notifications
CREATE POLICY "Users can view their own notifications" ON bonus_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON bonus_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for bonus_achievements
CREATE POLICY "Users can view their own achievements" ON bonus_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own achievements" ON bonus_achievements
    FOR ALL USING (auth.uid() = user_id);

-- Policies for spending_transactions
CREATE POLICY "Users can view their own transactions" ON spending_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions" ON spending_transactions
    FOR ALL USING (auth.uid() = user_id);

-- Create a view for bonus analytics
CREATE OR REPLACE VIEW bonus_analytics AS
SELECT 
    wb.user_id,
    COUNT(*) FILTER (WHERE wb.status = 'active') as active_bonuses,
    COUNT(*) FILTER (WHERE wb.status = 'completed') as completed_bonuses,
    COUNT(*) FILTER (WHERE wb.status = 'expired') as expired_bonuses,
    SUM(wb.estimated_value) FILTER (WHERE wb.status = 'active') as total_potential_value,
    SUM(wb.estimated_value) FILTER (WHERE wb.status = 'completed') as total_earned_value,
    SUM(wb.required_spend - COALESCE(bp.current_spend, 0)) FILTER (WHERE wb.status = 'active') as total_remaining_spend,
    AVG(bp.progress_percentage) FILTER (WHERE wb.status = 'active') as average_progress,
    COUNT(*) FILTER (WHERE wb.status = 'active' AND wb.deadline - CURRENT_DATE <= 7) as urgent_bonuses
FROM welcome_bonuses wb
LEFT JOIN bonus_progress bp ON wb.id = bp.bonus_id
GROUP BY wb.user_id;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
