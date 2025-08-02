// Location and GPS related types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp?: string;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  rating?: number;
  price_level?: number;
  phone_number?: string;
  website?: string;
  distance?: number; // Distance from user in meters
  created_at?: string;
  updated_at?: string;
}

export interface CardReward {
  id: string;
  card_name: string;
  issuer: string;
  category: string;
  reward_rate: number;
  reward_type: 'points' | 'cashback' | 'miles';
  annual_fee: number;
  bonus_offer?: string;
  terms?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  card_id?: string;
  business_id?: string;
  amount: number;
  category: string;
  merchant: string;
  description?: string;
  date: string;
  location_lat?: number;
  location_lng?: number;
  points_earned?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserLocation {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp: string;
  created_at?: string;
}

// Card recommendation types
export interface CardRecommendation {
  card: CardReward;
  business?: Business;
  estimated_points: number;
  annual_value: number;
  match_score: number;
  reasons: string[];
}

export interface LocationPermissionState {
  granted: boolean;
  denied: boolean;
  loading: boolean;
  error?: string;
}

// Google Maps types
export interface MapInstance {
  map: google.maps.Map;
  markers: google.maps.Marker[];
  userMarker?: google.maps.Marker;
}

// Analytics types
export interface SpendingInsight {
  category: string;
  total_spent: number;
  transaction_count: number;
  average_transaction: number;
  top_merchant: string;
  recommended_card?: CardReward;
  potential_points: number;
  current_points: number;
  optimization_opportunity: number;
}

export interface AnalyticsData {
  monthly_spending: Array<{
    month: string;
    amount: number;
    points: number;
  }>;
  category_breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  card_performance: Array<{
    card_name: string;
    spending: number;
    points_earned: number;
    efficiency_score: number;
  }>;
  insights: SpendingInsight[];
}

// API Response types
export interface NearbyBusinessesResponse {
  businesses: Business[];
  user_location: Location;
  success: boolean;
  error?: string;
}

export interface CardRecommendationsResponse {
  recommendations: CardRecommendation[];
  business?: Business;
  category?: string;
  success: boolean;
  error?: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total_count: number;
  page: number;
  page_size: number;
  success: boolean;
  error?: string;
}

export interface AnalyticsResponse {
  data: AnalyticsData;
  period: string;
  success: boolean;
  error?: string;
}
