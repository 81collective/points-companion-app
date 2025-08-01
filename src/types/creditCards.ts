export enum CardIssuer {
  Chase = 'Chase',
  Amex = 'American Express',
  Citi = 'Citi',
  Discover = 'Discover',
  CapitalOne = 'Capital One',
  BankOfAmerica = 'Bank of America',
  WellsFargo = 'Wells Fargo',
  Apple = 'Apple',
  Other = 'Other',
}

export enum RewardCategory {
  Travel = 'travel',
  Dining = 'dining',
  Groceries = 'groceries',
  Gas = 'gas',
  Drugstores = 'drugstores',
  Flights = 'flights',
  Hotels = 'hotels',
  Supermarkets = 'supermarkets',
  ApplePurchases = 'apple_purchases',
  ApplePay = 'apple_pay',
  Wholesale = 'wholesale',
  Rotating = 'rotating',
  EverythingElse = 'everything_else',
  Business = 'business',
  Other = 'other',
}

export interface RewardStructure {
  category: RewardCategory;
  multiplier: number;
  cap?: string; // e.g. "$25k/year"
  notes?: string;
  promo?: string;
}

export interface CreditCardTemplate {
  id: string;
  name: string;
  issuer: CardIssuer;
  image?: string;
  nickname?: string;
  rewards: RewardStructure[];
  popular?: boolean;
  business?: boolean;
  version?: string;
}
