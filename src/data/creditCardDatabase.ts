import { CreditCardTemplate, CardIssuer, RewardCategory } from '@/types/creditCards';

// Updated credit card database - Generated on 2025-08-03T18:33:10.762Z
export const creditCardDatabase: CreditCardTemplate[] = [
  {
    id: 'chase-sapphire-preferred-2025',
    name: 'Chase Sapphire Preferred',
    issuer: CardIssuer.Chase,
    nickname: 'CSP',
    image: '/card-logos/chase-sapphire-preferred.png',
    rewards: [
      { category: RewardCategory.Travel, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.Streaming, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 95,
    bonusOffer: '60,000 points after $4,000 spend in 3 months',
  },
  {
    id: 'chase-sapphire-reserve-2025',
    name: 'Chase Sapphire Reserve',
    issuer: CardIssuer.Chase,
    nickname: 'CSR',
    image: '/card-logos/chase-sapphire-reserve.png',
    rewards: [
      { category: RewardCategory.Travel, multiplier: 3 },
      { category: RewardCategory.Dining, multiplier: 3 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 550,
    bonusOffer: '70,000 points after $4,000 spend in 3 months',
  },
  {
    id: 'chase-freedom-unlimited-2025',
    name: 'Chase Freedom Unlimited',
    issuer: CardIssuer.Chase,
    nickname: 'CFU',
    image: '/card-logos/chase-freedom-unlimited.png',
    rewards: [
      { category: RewardCategory.EverythingElse, multiplier: 1.5 },
      { category: RewardCategory.Dining, multiplier: 3 },
      { category: RewardCategory.Drugstores, multiplier: 3 },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: '$200 after $500 spend in 3 months',
  },
  {
    id: 'amex-platinum-2025',
    name: 'The Platinum Card® from American Express',
    issuer: CardIssuer.Amex,
    nickname: 'Amex Platinum',
    image: '/card-logos/amex-platinum.png',
    rewards: [
      { category: RewardCategory.Flights, multiplier: 5 },
      { category: RewardCategory.Hotels, multiplier: 5 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 695,
    bonusOffer: '80,000 points after $6,000 spend in 6 months',
  },
  {
    id: 'amex-gold-2025',
    name: 'American Express® Gold Card',
    issuer: CardIssuer.Amex,
    nickname: 'Amex Gold',
    image: '/card-logos/amex-gold.png',
    rewards: [
      { category: RewardCategory.Dining, multiplier: 4 },
      { category: RewardCategory.Supermarkets, multiplier: 4, cap: '$25,000/year' },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 250,
    bonusOffer: '60,000 points after $4,000 spend in 6 months',
  },
  {
    id: 'capital-one-venture-x-2025',
    name: 'Capital One Venture X Rewards Credit Card',
    issuer: CardIssuer.CapitalOne,
    nickname: 'Venture X',
    image: '/card-logos/capital-one-venture-x.png',
    rewards: [
      { category: RewardCategory.Travel, multiplier: 10, notes: 'Hotels and rental cars booked through Capital One Travel' },
      { category: RewardCategory.EverythingElse, multiplier: 2 },
    ],
    popular: true,
    
    annualFee: 395,
    bonusOffer: '75,000 miles after $4,000 spend in 3 months',
  },
  {
    id: 'capital-one-savor-2025',
    name: 'Capital One Savor Cash Rewards Credit Card',
    issuer: CardIssuer.CapitalOne,
    nickname: 'Savor',
    image: '/card-logos/capital-one-savor.png',
    rewards: [
      { category: RewardCategory.Dining, multiplier: 4 },
      { category: RewardCategory.Entertainment, multiplier: 4 },
      { category: RewardCategory.Streaming, multiplier: 4 },
      { category: RewardCategory.Groceries, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 95,
    bonusOffer: '$300 after $3,000 spend in 3 months',
  },
  {
    id: 'citi-double-cash-2025',
    name: 'Citi Double Cash Card',
    issuer: CardIssuer.Citi,
    
    image: '/card-logos/citi-double-cash.png',
    rewards: [
      { category: RewardCategory.EverythingElse, multiplier: 2, notes: '1% purchase + 1% payment' },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: '$200 after $1,500 spend in 6 months',
  },
  {
    id: 'citi-premier-2025',
    name: 'Citi Premier® Card',
    issuer: CardIssuer.Citi,
    nickname: 'Citi Premier',
    image: '/card-logos/citi-premier.png',
    rewards: [
      { category: RewardCategory.Travel, multiplier: 3 },
      { category: RewardCategory.Dining, multiplier: 3 },
      { category: RewardCategory.Supermarkets, multiplier: 3 },
      { category: RewardCategory.Gas, multiplier: 3 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 95,
    bonusOffer: '80,000 points after $4,000 spend in 3 months',
  },
  {
    id: 'discover-it-cash-back-2025',
    name: 'Discover it® Cash Back',
    issuer: CardIssuer.Discover,
    
    image: '/card-logos/discover-it-cash-back.png',
    rewards: [
      { category: RewardCategory.Rotating, multiplier: 5, notes: 'Rotating quarterly categories, up to $1,500 quarterly limit' },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: 'Cashback Match™ - Discover will match all the cash back you earn in your first year',
  },
  {
    id: 'boa-customized-cash-rewards-2025',
    name: 'Bank of America® Customized Cash Rewards Credit Card',
    issuer: CardIssuer.BankOfAmerica,
    
    image: '/card-logos/boa-customized-cash.png',
    rewards: [
      { category: RewardCategory.Gas, multiplier: 3, notes: 'Choose your 3% category' },
      { category: RewardCategory.Groceries, multiplier: 2 },
      { category: RewardCategory.Wholesale, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: '$200 after $1,000 spend in 3 months',
  },
  {
    id: 'wells-fargo-active-cash-2025',
    name: 'Wells Fargo Active Cash® Card',
    issuer: CardIssuer.WellsFargo,
    
    image: '/card-logos/wells-fargo-active-cash.png',
    rewards: [
      { category: RewardCategory.EverythingElse, multiplier: 2 },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: '$200 after $1,000 spend in 3 months',
  },
  {
    id: 'wells-fargo-autograph-2025',
    name: 'Wells Fargo Autograph℠ Card',
    issuer: CardIssuer.WellsFargo,
    nickname: 'Autograph',
    image: '/card-logos/wells-fargo-autograph.png',
    rewards: [
      { category: RewardCategory.Travel, multiplier: 3 },
      { category: RewardCategory.Dining, multiplier: 3 },
      { category: RewardCategory.Gas, multiplier: 3 },
      { category: RewardCategory.Fitness, multiplier: 3 },
      { category: RewardCategory.Streaming, multiplier: 3 },
      { category: RewardCategory.CellPhone, multiplier: 3 },
      { category: RewardCategory.ElectricVehicleCharging, multiplier: 3 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: '$300 after $1,500 spend in 3 months',
  },
  {
    id: 'apple-card-2025',
    name: 'Apple Card',
    issuer: CardIssuer.Apple,
    
    image: '/card-logos/apple-card.png',
    rewards: [
      { category: RewardCategory.ApplePurchases, multiplier: 3 },
      { category: RewardCategory.ApplePay, multiplier: 2 },
      { category: RewardCategory.DigitalWallets, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: 'Daily Cash earned on every purchase',
  },
  {
    id: 'bilt-mastercard-2025',
    name: 'Bilt Mastercard',
    issuer: CardIssuer.Other,
    nickname: 'Bilt',
    image: '/card-logos/bilt-mastercard.png',
    rewards: [
      { category: RewardCategory.Dining, multiplier: 3 },
      { category: RewardCategory.Travel, multiplier: 2 },
      { category: RewardCategory.Fitness, multiplier: 2 },
      { category: RewardCategory.Subscription, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
      { category: RewardCategory.Other, multiplier: 1, notes: 'Rent payments (no fee)' },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: 'Earn points on rent with no transaction fees',
  },
  {
    id: 'usbank-altitude-connect-2025',
    name: 'U.S. Bank Altitude® Connect Visa Signature® Card',
    issuer: CardIssuer.Other,
    nickname: 'Altitude Connect',
    image: '/card-logos/usbank-altitude-connect.png',
    rewards: [
      { category: RewardCategory.Travel, multiplier: 4 },
      { category: RewardCategory.Streaming, multiplier: 4 },
      { category: RewardCategory.DigitalWallets, multiplier: 4 },
      { category: RewardCategory.Gas, multiplier: 2 },
      { category: RewardCategory.Groceries, multiplier: 2 },
      { category: RewardCategory.ElectricVehicleCharging, multiplier: 4 },
      { category: RewardCategory.Healthcare, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: '50,000 bonus points after $2,000 spend in 3 months',
  },
  // Hotel Award Credit Cards
  {
    id: 'marriott-boundless-2025',
    name: 'Chase Marriott Bonvoy Boundless',
    issuer: CardIssuer.Chase,
    nickname: 'Marriott Boundless',
    image: '/card-logos/marriott-boundless.png',
    rewards: [
      { category: RewardCategory.Marriott, multiplier: 6 },
      { category: RewardCategory.Hotels, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 2 },
    ],
    popular: true,
    
    annualFee: 95,
    bonusOffer: '100,000 bonus points after $5,000 spend in 3 months',
  },
  {
    id: 'marriott-bold-2025',
    name: 'Chase Marriott Bonvoy Bold',
    issuer: CardIssuer.Chase,
    nickname: 'Marriott Bold',
    image: '/card-logos/marriott-bold.png',
    rewards: [
      { category: RewardCategory.Marriott, multiplier: 4 },
      { category: RewardCategory.Hotels, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 2 },
    ],
    popular: false,
    
    annualFee: 0,
    bonusOffer: '50,000 bonus points after $1,000 spend in 3 months',
  },
  {
    id: 'hilton-honors-2025',
    name: 'Hilton Honors American Express Card',
    issuer: CardIssuer.Amex,
    nickname: 'Hilton Honors',
    image: '/card-logos/hilton-honors.png',
    rewards: [
      { category: RewardCategory.Hilton, multiplier: 7 },
      { category: RewardCategory.Hotels, multiplier: 3 },
      { category: RewardCategory.EverythingElse, multiplier: 3 },
    ],
    popular: true,
    
    annualFee: 0,
    bonusOffer: '80,000 Hilton Honors bonus points after $1,000 spend in 3 months',
  },
  {
    id: 'hilton-surpass-2025',
    name: 'Hilton Honors American Express Surpass Card',
    issuer: CardIssuer.Amex,
    nickname: 'Hilton Surpass',
    image: '/card-logos/hilton-surpass.png',
    rewards: [
      { category: RewardCategory.Hilton, multiplier: 12 },
      { category: RewardCategory.Hotels, multiplier: 6 },
      { category: RewardCategory.Dining, multiplier: 6 },
      { category: RewardCategory.Supermarkets, multiplier: 6, cap: '$6,000/year' },
      { category: RewardCategory.Gas, multiplier: 3 },
      { category: RewardCategory.EverythingElse, multiplier: 3 },
    ],
    popular: true,
    
    annualFee: 150,
    bonusOffer: '130,000 Hilton Honors bonus points after $2,000 spend in 3 months',
  },
  {
    id: 'hyatt-2025',
    name: 'Chase World of Hyatt Credit Card',
    issuer: CardIssuer.Chase,
    nickname: 'World of Hyatt',
    image: '/card-logos/world-of-hyatt.png',
    rewards: [
      { category: RewardCategory.Hyatt, multiplier: 4 },
      { category: RewardCategory.Hotels, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.Fitness, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    
    annualFee: 95,
    bonusOffer: '60,000 bonus points after $3,000 spend in 3 months',
  },
  {
    id: 'ihg-premier-2025',
    name: 'IHG One Rewards Premier Credit Card',
    issuer: CardIssuer.Chase,
    nickname: 'IHG Premier',
    image: '/card-logos/ihg-premier.png',
    rewards: [
      { category: RewardCategory.IHG, multiplier: 10 },
      { category: RewardCategory.Hotels, multiplier: 2 },
      { category: RewardCategory.Gas, multiplier: 2 },
      { category: RewardCategory.Groceries, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: false,
    
    annualFee: 89,
    bonusOffer: '140,000 bonus points after $3,000 spend in 3 months',
  },
  {
    id: 'wyndham-earner-2025',
    name: 'Wyndham Rewards Earner Card',
    issuer: CardIssuer.Other,
    nickname: 'Wyndham Earner',
    image: '/card-logos/wyndham-earner.png',
    rewards: [
      { category: RewardCategory.Wyndham, multiplier: 8 },
      { category: RewardCategory.Hotels, multiplier: 2 },
      { category: RewardCategory.Gas, multiplier: 4 },
      { category: RewardCategory.Groceries, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: false,
    
    annualFee: 75,
    bonusOffer: '45,000 bonus points after $1,000 spend in 3 months',
  },
  {
    id: 'choice-privileges-2025',
    name: 'Choice Privileges Visa Signature Card',
    issuer: CardIssuer.Other,
    nickname: 'Choice Privileges',
    image: '/card-logos/choice-privileges.png',
    rewards: [
      { category: RewardCategory.Choice, multiplier: 5 },
      { category: RewardCategory.Hotels, multiplier: 2 },
      { category: RewardCategory.Gas, multiplier: 2 },
      { category: RewardCategory.Groceries, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: false,
    
    annualFee: 0,
    bonusOffer: '60,000 bonus points after $1,000 spend in 3 months',
  },

  // === AIRLINE CREDIT CARDS ===
  {
    id: 'chase-united-explorer-2025',
    name: 'United℠ Explorer Card',
    issuer: CardIssuer.Chase,
    nickname: 'United Explorer',
    image: '/card-logos/chase-united-explorer.png',
    rewards: [
      { category: RewardCategory.United, multiplier: 2 },
      { category: RewardCategory.Travel, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    annualFee: 95,
    bonusOffer: '60,000 bonus miles after $3,000 spend in 3 months',
  },
  {
    id: 'chase-united-quest-2025',
    name: 'United Quest℠ Card',
    issuer: CardIssuer.Chase,
    nickname: 'United Quest',
    image: '/card-logos/chase-united-quest.png',
    rewards: [
      { category: RewardCategory.United, multiplier: 3 },
      { category: RewardCategory.Travel, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1.5 },
    ],
    popular: false,
    annualFee: 250,
    bonusOffer: '80,000 bonus miles after $5,000 spend in 3 months',
  },
  {
    id: 'amex-delta-gold-2025',
    name: 'Delta SkyMiles® Gold American Express Card',
    issuer: CardIssuer.Amex,
    nickname: 'Delta Gold',
    image: '/card-logos/amex-delta-gold.png',
    rewards: [
      { category: RewardCategory.Delta, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.Groceries, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    annualFee: 99,
    bonusOffer: '40,000 bonus miles after $2,000 spend in 3 months',
  },
  {
    id: 'amex-delta-platinum-2025',
    name: 'Delta SkyMiles® Platinum American Express Card',
    issuer: CardIssuer.Amex,
    nickname: 'Delta Platinum',
    image: '/card-logos/amex-delta-platinum.png',
    rewards: [
      { category: RewardCategory.Delta, multiplier: 3 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.Groceries, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: false,
    annualFee: 250,
    bonusOffer: '80,000 bonus miles after $3,000 spend in 3 months',
  },
  {
    id: 'citi-american-platinum-2025',
    name: 'Citi® / AAdvantage® Platinum Select® World Elite Mastercard®',
    issuer: CardIssuer.Citi,
    nickname: 'AA Platinum',
    image: '/card-logos/citi-american-platinum.png',
    rewards: [
      { category: RewardCategory.American, multiplier: 2 },
      { category: RewardCategory.Gas, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    annualFee: 99,
    bonusOffer: '50,000 bonus miles after $2,500 spend in 3 months',
  },
  {
    id: 'chase-southwest-priority-2025',
    name: 'Southwest Rapid Rewards® Priority Credit Card',
    issuer: CardIssuer.Chase,
    nickname: 'Southwest Priority',
    image: '/card-logos/chase-southwest-priority.png',
    rewards: [
      { category: RewardCategory.Southwest, multiplier: 3 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.Streaming, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: true,
    annualFee: 149,
    bonusOffer: '50,000 bonus points after $1,000 spend in 3 months',
  },
  {
    id: 'chase-southwest-plus-2025',
    name: 'Southwest Rapid Rewards® Plus Credit Card',
    issuer: CardIssuer.Chase,
    nickname: 'Southwest Plus',
    image: '/card-logos/chase-southwest-plus.png',
    rewards: [
      { category: RewardCategory.Southwest, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: false,
    annualFee: 69,
    bonusOffer: '40,000 bonus points after $1,000 spend in 3 months',
  },
  {
    id: 'jetblue-plus-2025',
    name: 'JetBlue Plus Card',
    issuer: CardIssuer.BankOfAmerica,
    nickname: 'JetBlue Plus',
    image: '/card-logos/jetblue-plus.png',
    rewards: [
      { category: RewardCategory.JetBlue, multiplier: 2 },
      { category: RewardCategory.Dining, multiplier: 2 },
      { category: RewardCategory.Groceries, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: false,
    annualFee: 99,
    bonusOffer: '40,000 bonus points after $1,000 spend in 3 months',
  },
  {
    id: 'alaska-visa-signature-2025',
    name: 'Alaska Airlines Visa Signature® Card',
    issuer: CardIssuer.BankOfAmerica,
    nickname: 'Alaska Visa',
    image: '/card-logos/alaska-visa.png',
    rewards: [
      { category: RewardCategory.Alaska, multiplier: 3 },
      { category: RewardCategory.Gas, multiplier: 2 },
      { category: RewardCategory.EverythingElse, multiplier: 1 },
    ],
    popular: false,
    annualFee: 95,
    bonusOffer: '40,000 bonus miles + $100 statement credit after $2,000 spend in 90 days',
  },
];

// Category metadata for UI
export const categoryMetadata = {
  travel: { icon: '✈️', label: 'Travel' },
  dining: { icon: '🍽️', label: 'Dining' },
  groceries: { icon: '🛒', label: 'Groceries' },
  gas: { icon: '⛽', label: 'Gas' },
  streaming: { icon: '📺', label: 'Streaming' },
  fitness: { icon: '💪', label: 'Fitness' },
  entertainment: { icon: '🎬', label: 'Entertainment' },
  cell_phone: { icon: '📱', label: 'Cell Phone' },
  everything_else: { icon: '💳', label: 'Everything Else' },
  flights: { icon: '🛫', label: 'Flights' },
  hotels: { icon: '🏨', label: 'Hotels' },
  // Hotel Brands
  marriott: { icon: '🏨', label: 'Marriott' },
  hilton: { icon: '🏨', label: 'Hilton' },
  hyatt: { icon: '🏨', label: 'Hyatt' },
  ihg: { icon: '🏨', label: 'IHG' },
  wyndham: { icon: '🏨', label: 'Wyndham' },
  choice: { icon: '🏨', label: 'Choice Hotels' },
  // Airline Brands
  united: { icon: '🛫', label: 'United Airlines' },
  delta: { icon: '🛫', label: 'Delta Air Lines' },
  american: { icon: '🛫', label: 'American Airlines' },
  southwest: { icon: '🛫', label: 'Southwest Airlines' },
  jetblue: { icon: '🛫', label: 'JetBlue Airways' },
  alaska: { icon: '🛫', label: 'Alaska Airlines' },
  supermarkets: { icon: '🏪', label: 'Supermarkets' },
  drugstores: { icon: '💊', label: 'Drugstores' },
  wholesale: { icon: '📦', label: 'Wholesale' },
  rotating: { icon: '🔄', label: 'Rotating Categories' },
  business: { icon: '💼', label: 'Business' },
  apple_purchases: { icon: '🍎', label: 'Apple Purchases' },
  apple_pay: { icon: '💳', label: 'Apple Pay' },
};

// Get cards by issuer
export function getCardsByIssuer(issuer: CardIssuer): CreditCardTemplate[] {
  return creditCardDatabase.filter(card => card.issuer === issuer);
}

// Get popular cards
export function getPopularCards(): CreditCardTemplate[] {
  return creditCardDatabase.filter(card => card.popular);
}

// Get cards by category
export function getCardsByCategory(category: RewardCategory): CreditCardTemplate[] {
  return creditCardDatabase.filter(card => 
    card.rewards.some(reward => reward.category === category)
  );
}

// Get best card for category
export function getBestCardForCategory(category: RewardCategory): CreditCardTemplate | null {
  const cardsWithCategory = getCardsByCategory(category);
  if (cardsWithCategory.length === 0) return null;
  
  return cardsWithCategory.reduce((best, current) => {
    const bestReward = best.rewards.find(r => r.category === category)?.multiplier || 0;
    const currentReward = current.rewards.find(r => r.category === category)?.multiplier || 0;
    return currentReward > bestReward ? current : best;
  });
}
