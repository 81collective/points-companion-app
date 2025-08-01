export interface Transaction {
  id: string
  amount: number
  date: string
  merchant: string
  category: string
}

export interface CreditCard {
  id: string
  name: string
  last4: string
  rewards: string[]
}

export interface Recommendation {
  cardId: string
  cardName: string
  reason: string
  score: number
}

export interface RecommendationRequest {
  transactions: Transaction[]
  cards: CreditCard[]
}

export interface RecommendationResponse {
  recommendations: Recommendation[]
}
