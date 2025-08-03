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
  // Hotel Brand Specific Categories
  Marriott = 'marriott',
  Hilton = 'hilton',
  Hyatt = 'hyatt',
  IHG = 'ihg',
  Wyndham = 'wyndham',
  Choice = 'choice',
  // Airline Brand Specific Categories
  United = 'united',
  Delta = 'delta',
  American = 'american',
  Southwest = 'southwest',
  JetBlue = 'jetblue',
  Alaska = 'alaska',
  Supermarkets = 'supermarkets',
  ApplePurchases = 'apple_purchases',
  ApplePay = 'apple_pay',
  Wholesale = 'wholesale',
  Rotating = 'rotating',
  EverythingElse = 'everything_else',
  Business = 'business',
  // New 2025 categories
  Streaming = 'streaming',
  Fitness = 'fitness',
  Healthcare = 'healthcare',
  PublicTransportation = 'public_transportation',
  RentalCars = 'rental_cars',
  OnlineShoppingOthers = 'online_shopping_others',
  HomeImprovement = 'home_improvement',
  Entertainment = 'entertainment',
  Utilities = 'utilities',
  CellPhone = 'cell_phone',
  Internet = 'internet',
  Insurance = 'insurance',
  Parking = 'parking',
  Tolls = 'tolls',
  ElectricVehicleCharging = 'ev_charging',
  DigitalWallets = 'digital_wallets',
  Subscription = 'subscription',
  Department_stores = 'department_stores',
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
  annualFee?: number;
  bonusOffer?: string;
}
