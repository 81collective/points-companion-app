-- Create businesses table for GPS-found businesses
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  place_id TEXT UNIQUE,
  rating DECIMAL(2, 1),
  price_level INTEGER,
  phone_number TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create card_rewards table for credit card reward rates
CREATE TABLE card_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  category TEXT NOT NULL,
  reward_rate DECIMAL(3, 2) NOT NULL, -- e.g., 3.00 for 3x points
  reward_type TEXT DEFAULT 'points', -- points, cashback, miles
  annual_fee INTEGER DEFAULT 0,
  bonus_offer TEXT,
  terms TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table for user transaction history
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID REFERENCES credit_cards(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  merchant TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_locations table for GPS location history
CREATE TABLE user_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_businesses_location ON businesses USING GIST (ST_Point(longitude, latitude));
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_card_rewards_category ON card_rewards(category);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_user_locations_user_timestamp ON user_locations(user_id, timestamp DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Businesses: Public read access
CREATE POLICY "Public read access for businesses" ON businesses
  FOR SELECT USING (true);

-- Card rewards: Public read access
CREATE POLICY "Public read access for card_rewards" ON card_rewards
  FOR SELECT USING (true);

-- Transactions: Users can only access their own
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- User locations: Users can only access their own
CREATE POLICY "Users can view own locations" ON user_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own locations" ON user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own locations" ON user_locations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own locations" ON user_locations
  FOR DELETE USING (auth.uid() = user_id);

-- Insert sample card rewards data
INSERT INTO card_rewards (card_name, issuer, category, reward_rate, reward_type, annual_fee, bonus_offer) VALUES
('Chase Sapphire Preferred', 'Chase', 'dining', 3.00, 'points', 95, '60,000 bonus points'),
('Chase Sapphire Preferred', 'Chase', 'travel', 3.00, 'points', 95, '60,000 bonus points'),
('Chase Sapphire Preferred', 'Chase', 'general', 1.00, 'points', 95, '60,000 bonus points'),
('American Express Gold Card', 'American Express', 'dining', 4.00, 'points', 250, '60,000 bonus points'),
('American Express Gold Card', 'American Express', 'groceries', 4.00, 'points', 250, '60,000 bonus points'),
('American Express Gold Card', 'American Express', 'general', 1.00, 'points', 250, '60,000 bonus points'),
('Chase Freedom Unlimited', 'Chase', 'general', 1.50, 'cashback', 0, '$200 bonus'),
('Chase Freedom Flex', 'Chase', 'rotating', 5.00, 'cashback', 0, '$200 bonus'),
('Capital One Venture', 'Capital One', 'travel', 2.00, 'miles', 95, '75,000 bonus miles'),
('Capital One Venture', 'Capital One', 'general', 2.00, 'miles', 95, '75,000 bonus miles'),
('Citi Double Cash', 'Citi', 'general', 2.00, 'cashback', 0, 'No bonus offer'),
('Chase Sapphire Reserve', 'Chase', 'dining', 3.00, 'points', 550, '60,000 bonus points'),
('Chase Sapphire Reserve', 'Chase', 'travel', 3.00, 'points', 550, '60,000 bonus points'),
('Discover it Cash Back', 'Discover', 'rotating', 5.00, 'cashback', 0, 'Match first year'),
('Blue Cash Preferred', 'American Express', 'groceries', 6.00, 'cashback', 95, '$300 bonus'),
('Blue Cash Preferred', 'American Express', 'gas', 3.00, 'cashback', 95, '$300 bonus'),
('Chase Ink Business Preferred', 'Chase', 'office', 3.00, 'points', 95, '100,000 bonus points'),
('Chase Ink Business Preferred', 'Chase', 'internet', 3.00, 'points', 95, '100,000 bonus points'),
('Hotel Credit Cards', 'Various', 'hotels', 5.00, 'points', 95, 'Hotel status'),
('Airline Credit Cards', 'Various', 'airlines', 3.00, 'miles', 99, 'Airline status');

-- Sample businesses removed - using real business data from Google Places API
