export interface Transaction {
  id: string
  amount: number
  date: string
  merchant: string
  category: string
}

export interface CardRewardCategory {
  category: string
  pointsPerDollar: number
  cap?: number // Optional spending cap for bonus categories
  promo?: boolean // Is this a special promotion?
}

export interface CardRewardsStructure {
  baseRate: number
  categories: CardRewardCategory[]
}

export interface CreditCard {
  id: string
  name: string
  last4: string
  rewardsStructure: CardRewardsStructure
}

export interface PointsCalculationResult {
  cardId: string
  cardName: string
  transactionId: string
  pointsEarned: number
  categoryMatched: string
  bonusApplied: boolean
  capReached: boolean
  details: string
}

export interface CardRecommendation {
  cardId: string
  cardName: string
  pointsEarned: number
  reason: string
}

export interface PointsPotential {
  cardId: string
  cardName: string
  estimatedAnnualPoints: number
  details: string
}
