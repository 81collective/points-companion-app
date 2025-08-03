#!/usr/bin/env node

/**
 * Script to update credit card database with latest card data
 * Run with: node scripts/update-cards.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced credit card database with 2025 cards
const latestCreditCards = [
  // Chase Cards
  {
    id: 'chase-sapphire-preferred-2025',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    nickname: 'CSP',
    image: '/card-logos/chase-sapphire-preferred.png',
    rewards: [
      { category: 'travel', multiplier: 2 },
      { category: 'dining', multiplier: 2 },
      { category: 'streaming', multiplier: 2 },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 95,
    bonusOffer: '60,000 points after $4,000 spend in 3 months',
  },
  {
    id: 'chase-sapphire-reserve-2025',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    nickname: 'CSR',
    image: '/card-logos/chase-sapphire-reserve.png',
    rewards: [
      { category: 'travel', multiplier: 3 },
      { category: 'dining', multiplier: 3 },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 550,
    bonusOffer: '70,000 points after $4,000 spend in 3 months',
  },
  {
    id: 'chase-freedom-unlimited-2025',
    name: 'Chase Freedom Unlimited',
    issuer: 'Chase',
    nickname: 'CFU',
    image: '/card-logos/chase-freedom-unlimited.png',
    rewards: [
      { category: 'everything_else', multiplier: 1.5 },
      { category: 'dining', multiplier: 3 },
      { category: 'drugstores', multiplier: 3 },
    ],
    popular: true,
    annualFee: 0,
    bonusOffer: '$200 after $500 spend in 3 months',
  },
  
  // American Express Cards
  {
    id: 'amex-platinum-2025',
    name: 'The Platinum Card® from American Express',
    issuer: 'Amex',
    nickname: 'Amex Platinum',
    image: '/card-logos/amex-platinum.png',
    rewards: [
      { category: 'flights', multiplier: 5 },
      { category: 'hotels', multiplier: 5 },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 695,
    bonusOffer: '80,000 points after $6,000 spend in 6 months',
  },
  {
    id: 'amex-gold-2025',
    name: 'American Express® Gold Card',
    issuer: 'Amex',
    nickname: 'Amex Gold',
    image: '/card-logos/amex-gold.png',
    rewards: [
      { category: 'dining', multiplier: 4 },
      { category: 'supermarkets', multiplier: 4, cap: '$25,000/year' },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 250,
    bonusOffer: '60,000 points after $4,000 spend in 6 months',
  },
  
  // Capital One Cards
  {
    id: 'capital-one-venture-x-2025',
    name: 'Capital One Venture X Rewards Credit Card',
    issuer: 'CapitalOne',
    nickname: 'Venture X',
    image: '/card-logos/capital-one-venture-x.png',
    rewards: [
      { category: 'travel', multiplier: 10, notes: 'Hotels and rental cars booked through Capital One Travel' },
      { category: 'everything_else', multiplier: 2 },
    ],
    popular: true,
    annualFee: 395,
    bonusOffer: '75,000 miles after $4,000 spend in 3 months',
  },
  {
    id: 'capital-one-savor-2025',
    name: 'Capital One Savor Cash Rewards Credit Card',
    issuer: 'CapitalOne',
    nickname: 'Savor',
    image: '/card-logos/capital-one-savor.png',
    rewards: [
      { category: 'dining', multiplier: 4 },
      { category: 'entertainment', multiplier: 4 },
      { category: 'streaming', multiplier: 4 },
      { category: 'groceries', multiplier: 2 },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 95,
    bonusOffer: '$300 after $3,000 spend in 3 months',
  },
  
  // Citi Cards
  {
    id: 'citi-double-cash-2025',
    name: 'Citi Double Cash Card',
    issuer: 'Citi',
    image: '/card-logos/citi-double-cash.png',
    rewards: [
      { category: 'everything_else', multiplier: 2, notes: '1% purchase + 1% payment' },
    ],
    popular: true,
    annualFee: 0,
    bonusOffer: '$200 after $1,500 spend in 6 months',
  },
  {
    id: 'citi-premier-2025',
    name: 'Citi Premier® Card',
    issuer: 'Citi',
    nickname: 'Citi Premier',
    image: '/card-logos/citi-premier.png',
    rewards: [
      { category: 'travel', multiplier: 3 },
      { category: 'dining', multiplier: 3 },
      { category: 'supermarkets', multiplier: 3 },
      { category: 'gas', multiplier: 3 },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 95,
    bonusOffer: '80,000 points after $4,000 spend in 3 months',
  },
  
  // Discover Cards
  {
    id: 'discover-it-cash-back-2025',
    name: 'Discover it® Cash Back',
    issuer: 'Discover',
    image: '/card-logos/discover-it-cash-back.png',
    rewards: [
      { category: 'rotating', multiplier: 5, notes: 'Rotating quarterly categories, up to $1,500 quarterly limit' },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 0,
    bonusOffer: 'Cashback Match™ - Discover will match all the cash back you earn in your first year',
  },
  
  // Bank of America Cards
  {
    id: 'boa-customized-cash-rewards-2025',
    name: 'Bank of America® Customized Cash Rewards Credit Card',
    issuer: 'BankOfAmerica',
    image: '/card-logos/boa-customized-cash.png',
    rewards: [
      { category: 'gas', multiplier: 3, notes: 'Choose your 3% category' },
      { category: 'groceries', multiplier: 2 },
      { category: 'wholesale', multiplier: 2 },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 0,
    bonusOffer: '$200 after $1,000 spend in 3 months',
  },
  
  // Wells Fargo Cards
  {
    id: 'wells-fargo-active-cash-2025',
    name: 'Wells Fargo Active Cash® Card',
    issuer: 'WellsFargo',
    image: '/card-logos/wells-fargo-active-cash.png',
    rewards: [
      { category: 'everything_else', multiplier: 2 },
    ],
    popular: true,
    annualFee: 0,
    bonusOffer: '$200 after $1,000 spend in 3 months',
  },
  {
    id: 'wells-fargo-autograph-2025',
    name: 'Wells Fargo Autograph℠ Card',
    issuer: 'WellsFargo',
    nickname: 'Autograph',
    image: '/card-logos/wells-fargo-autograph.png',
    rewards: [
      { category: 'travel', multiplier: 3 },
      { category: 'dining', multiplier: 3 },
      { category: 'gas', multiplier: 3 },
      { category: 'fitness', multiplier: 3 },
      { category: 'streaming', multiplier: 3 },
      { category: 'cell_phone', multiplier: 3 },
      { category: 'ev_charging', multiplier: 3 },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 0,
    bonusOffer: '$300 after $1,500 spend in 3 months',
  },
  
  // New 2025 Cards
  {
    id: 'apple-card-2025',
    name: 'Apple Card',
    issuer: 'Apple',
    image: '/card-logos/apple-card.png',
    rewards: [
      { category: 'apple_purchases', multiplier: 3 },
      { category: 'apple_pay', multiplier: 2 },
      { category: 'digital_wallets', multiplier: 2 },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 0,
    bonusOffer: 'Daily Cash earned on every purchase',
  },
  {
    id: 'bilt-mastercard-2025',
    name: 'Bilt Mastercard',
    issuer: 'Other',
    nickname: 'Bilt',
    image: '/card-logos/bilt-mastercard.png',
    rewards: [
      { category: 'dining', multiplier: 3 },
      { category: 'travel', multiplier: 2 },
      { category: 'fitness', multiplier: 2 },
      { category: 'subscription', multiplier: 2 },
      { category: 'everything_else', multiplier: 1 },
      { category: 'other', multiplier: 1, notes: 'Rent payments (no fee)' },
    ],
    popular: true,
    annualFee: 0,
    bonusOffer: 'Earn points on rent with no transaction fees',
  },
  {
    id: 'usbank-altitude-connect-2025',
    name: 'U.S. Bank Altitude® Connect Visa Signature® Card',
    issuer: 'Other',
    nickname: 'Altitude Connect',
    image: '/card-logos/usbank-altitude-connect.png',
    rewards: [
      { category: 'travel', multiplier: 4 },
      { category: 'streaming', multiplier: 4 },
      { category: 'digital_wallets', multiplier: 4 },
      { category: 'gas', multiplier: 2 },
      { category: 'groceries', multiplier: 2 },
      { category: 'ev_charging', multiplier: 4 },
      { category: 'healthcare', multiplier: 2 },
      { category: 'everything_else', multiplier: 1 },
    ],
    popular: true,
    annualFee: 0,
    bonusOffer: '50,000 bonus points after $2,000 spend in 3 months',
  },
];

// Categories mapping for the frontend
const categoryMapping = {
  travel: { icon: '✈️', label: 'Travel' },
  dining: { icon: '🍽️', label: 'Dining' },
  groceries: { icon: '🛒', label: 'Groceries' },
  gas: { icon: '⛽', label: 'Gas' },
  streaming: { icon: '📺', label: 'Streaming' },
  fitness: { icon: '💪', label: 'Fitness' },
  entertainment: { icon: '🎬', label: 'Entertainment' },
  cell_phone: { icon: '📱', label: 'Cell Phone' },
  everything_else: { icon: '💳', label: 'Everything Else' },
};

async function updateCreditCardDatabase() {
  try {
    console.log('🔄 Updating credit card database...');
    
    // Generate the TypeScript file content with proper formatting
    const generateCardObject = (card) => {
      const issuerName = card.issuer.charAt(0).toUpperCase() + card.issuer.slice(1);
      const rewards = card.rewards.map(reward => {
        // Special mapping for enum names that don't follow simple camelCase
        const specialMappings = {
          'ev_charging': 'ElectricVehicleCharging',
          'digital_wallets': 'DigitalWallets',
          'cell_phone': 'CellPhone',
          'apple_purchases': 'ApplePurchases',
          'apple_pay': 'ApplePay',
          'everything_else': 'EverythingElse',
          'public_transportation': 'PublicTransportation',
          'rental_cars': 'RentalCars',
          'online_shopping_others': 'OnlineShoppingOthers',
          'home_improvement': 'HomeImprovement',
          'department_stores': 'Department_stores'
        };
        
        const categoryName = specialMappings[reward.category] || 
          reward.category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join('');
        
        let rewardObj = `      { category: RewardCategory.${categoryName}, multiplier: ${reward.multiplier}`;
        if (reward.cap) rewardObj += `, cap: '${reward.cap}'`;
        if (reward.notes) rewardObj += `, notes: '${reward.notes.replace(/'/g, "\\'")}'`;
        rewardObj += ' },';
        return rewardObj;
      }).join('\n');

      return `  {
    id: '${card.id}',
    name: '${card.name}',
    issuer: CardIssuer.${issuerName},
    ${card.nickname ? `nickname: '${card.nickname}',` : ''}
    ${card.image ? `image: '${card.image}',` : ''}
    rewards: [
${rewards}
    ],
    ${card.popular ? 'popular: true,' : ''}
    ${card.business ? 'business: true,' : ''}
    ${card.annualFee !== undefined ? `annualFee: ${card.annualFee},` : ''}
    ${card.bonusOffer ? `bonusOffer: '${card.bonusOffer.replace(/'/g, "\\'")}',` : ''}
  },`;
    };

    const cardsCode = latestCreditCards.map(generateCardObject).join('\n');
    
    const fileContent = `import { CreditCardTemplate, CardIssuer, RewardCategory } from '@/types/creditCards';

// Updated credit card database - Generated on ${new Date().toISOString()}
export const creditCardDatabase: CreditCardTemplate[] = [
${cardsCode}
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
`;

    // Write to the database file
    const dbPath = path.join(__dirname, '../src/data/creditCardDatabase.ts');
    await fs.writeFile(dbPath, fileContent, 'utf8');
    
    console.log('✅ Credit card database updated successfully!');
    console.log(`📊 Added ${latestCreditCards.length} credit cards`);
    console.log(`📍 Database location: ${dbPath}`);
    
  } catch (error) {
    console.error('❌ Error updating credit card database:', error);
    process.exit(1);
  }
}

// Run the update
updateCreditCardDatabase();
