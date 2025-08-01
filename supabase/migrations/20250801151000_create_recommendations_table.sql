-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_details JSONB NOT NULL,
  recommended_card TEXT NOT NULL,
  actual_card_used TEXT,
  points_earned NUMERIC,
  feedback TEXT,
  feedback_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS: Enable row-level security
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- RLS: Only allow users to access their own recommendations
CREATE POLICY "User can view own recommendations" ON recommendations
  FOR SELECT USING (auth.uid()::uuid = user_id);
CREATE POLICY "User can insert own recommendations" ON recommendations
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);
CREATE POLICY "User can update own recommendations" ON recommendations
  FOR UPDATE USING (auth.uid()::uuid = user_id);
CREATE POLICY "User can delete own recommendations" ON recommendations
  FOR DELETE USING (auth.uid()::uuid = user_id);
