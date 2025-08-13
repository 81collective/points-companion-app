export interface AIAssistantProps {
  mode: 'quick' | 'planning';
  userLocation?: Coordinates;
  userCards?: UserCard[];
  isAuthenticated: boolean;
  businessContext?: DetectedBusiness;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserCard {
  id: string;
  name: string;
  issuer: string;
  annualFee?: number;
}

export interface DetectedBusiness {
  id?: string;
  name: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  suggestions?: string[];
}

export interface CardInfo {
  card_name: string;
  issuer: string;
  annual_fee: number;
}

export interface CardRecommendation {
  card: CardInfo;
  reasoning: string;
  earnedPoints?: number;
  earnedValue?: number;
  alternatives?: CardInfo[];
  educationalContext?: string;
}

export interface ConversationState {
  context: 'in-store' | 'planning' | 'general';
  businessType?: string;
  userIntent?: string;
  recommendations: CardRecommendation[];
  followUpSuggestions: string[];
  conversationHistory: Message[];
}

export interface ChatContext {
  mode: 'quick' | 'planning';
  userLocation?: { lat: number; lng: number };
  userCards?: UserCard[];
  isAuthenticated: boolean;
  businessContext?: DetectedBusiness;
  conversationHistory?: Message[];
}

export interface ChatResponse {
  content: string;
  suggestions?: string[];
}
