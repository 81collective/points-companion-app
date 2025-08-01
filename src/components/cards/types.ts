// Credit card types for cards components
export interface RewardsStructure {
  [key: string]: string | number | boolean | null | RewardsStructure | RewardsStructure[]
}

export interface CreditCard {
  id: string
  user_id: string
  name: string
  last4: string
  rewards: string[]
  created_at: string
  updated_at: string
}
