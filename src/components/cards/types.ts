// Credit card types for cards components
export interface RewardsStructure {
  [key: string]: string | number | boolean | null | RewardsStructure | RewardsStructure[]
}

export interface CreditCard {
  id: string
  userId: string
  name: string
  issuer?: string | null
  network?: string | null
  last4: string
  rewards: string[]
  createdAt: string
  updatedAt: string
}
