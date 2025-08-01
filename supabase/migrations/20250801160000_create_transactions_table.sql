-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  merchant_name TEXT NOT NULL,
  category TEXT NOT NULL,
  transaction_date TIMESTAMP NOT NULL,
  recommended_card_id UUID REFERENCES credit_cards(id),
  actual_card_used UUID REFERENCES credit_cards(id),
  points_earned INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- RLS policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);
