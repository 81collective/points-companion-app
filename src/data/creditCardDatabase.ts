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
