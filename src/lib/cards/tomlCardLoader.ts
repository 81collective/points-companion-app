/**
 * TOML Card Database Loader
 * 
 * Loads credit card data from TOML configuration files and merges
 * with current offers/promotions for real-time accuracy.
 * 
 * @module lib/cards/tomlCardLoader
 */

import * as fs from 'fs';
import * as path from 'path';
import TOML from 'toml';
import type { CreditCardTemplate, RewardStructure, CardIssuer, RewardCategory } from '@/types/creditCards';
import logger from '@/lib/logger';

const log = logger.child({ component: 'toml-card-loader' });

// ============================================================
// TYPES
// ============================================================

export interface TOMLCardConfig {
  id: string;
  name: string;
  nickname?: string;
  network: string;
  annual_fee: number;
  credit_required: string;
  foreign_transaction_fee: boolean;
  popular?: boolean;
  business?: boolean;
  card_type?: 'credit' | 'charge';
  requires_membership?: string;
  requires_prime?: boolean;
  rewards: Record<string, number>;
  rewards_caps?: Record<string, { annual_limit?: number; quarterly_limit?: number; monthly_limit?: number; then_rate?: number }>;
  bonus?: {
    amount: number;
    type: string;
    spend_required?: number;
    time_months?: number;
    expires?: string;
    description?: string;
  };
  benefits?: Record<string, unknown>;
  rotating_categories?: {
    current_quarter: string;
    categories: string[];
    next_quarter?: string;
    next_categories?: string[];
  };
}

export interface TOMLIssuerFile {
  meta: {
    issuer: string;
    issuer_code: string;
    last_updated: string;
    currency: string;
    point_value_cents: number;
  };
  cards: Record<string, TOMLCardConfig>;
}

export interface ElevatedBonus {
  card_id: string;
  bonus_amount: number;
  bonus_type: string;
  spend_required?: number;
  time_months?: number;
  start_date: string;
  end_date: string;
  offer_url?: string;
  notes?: string;
  via_referral?: boolean;
}

export interface SpendingPromo {
  card_id: string;
  category: string;
  multiplier: number;
  start_date: string;
  end_date: string;
  max_spend?: number;
  notes?: string;
  requires_enrollment?: boolean;
}

export interface MerchantOffer {
  merchant: string;
  merchant_mcc?: number[];
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  max_discount?: number;
  min_spend?: number;
  start_date: string;
  end_date: string;
  eligible_cards: string[];
  notes?: string;
}

export interface TransferBonus {
  program_from: string;
  program_to: string;
  bonus_percentage: number;
  ratio: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface CurrentOffersConfig {
  meta: {
    last_updated: string;
    next_update?: string;
    source?: string;
  };
  elevated_bonuses?: Record<string, ElevatedBonus>;
  spending_promos?: Record<string, SpendingPromo>;
  amex_offers?: Record<string, MerchantOffer>;
  chase_offers?: Record<string, MerchantOffer>;
  referral_bonuses?: Record<string, unknown>;
  retention_offers?: Record<string, unknown>;
  transfer_bonuses?: Record<string, TransferBonus>;
  seasonal?: Record<string, unknown>;
}

export interface LoadedCard extends CreditCardTemplate {
  pointValueCents?: number;
  currency?: string;
  network?: string;
  creditRequired?: string;
  foreignTransactionFee?: boolean;
  cardType?: 'credit' | 'charge';
  requiresMembership?: string;
  benefits?: Record<string, unknown>;
  rotatingCategories?: {
    currentQuarter: string;
    categories: string[];
    nextQuarter?: string;
    nextCategories?: string[];
  };
  // Current offers merged
  hasElevatedBonus?: boolean;
  elevatedBonusExpires?: string;
  activeSpendingPromos?: SpendingPromo[];
  activeMerchantOffers?: MerchantOffer[];
}

// ============================================================
// CATEGORY MAPPING
// ============================================================

const TOML_TO_REWARD_CATEGORY: Record<string, RewardCategory> = {
  // Travel
  travel: 'travel' as RewardCategory,
  flights: 'flights' as RewardCategory,
  hotels: 'hotels' as RewardCategory,
  rental_cars: 'rental_cars' as RewardCategory,
  
  // Dining & Food
  dining: 'dining' as RewardCategory,
  restaurants: 'dining' as RewardCategory,
  groceries: 'groceries' as RewardCategory,
  supermarkets: 'supermarkets' as RewardCategory,
  
  // Transportation
  gas: 'gas' as RewardCategory,
  ev_charging: 'ev_charging' as RewardCategory,
  transit: 'public_transportation' as RewardCategory,
  public_transportation: 'public_transportation' as RewardCategory,
  
  // Shopping
  online_shopping: 'online_shopping_others' as RewardCategory,
  online_groceries: 'groceries' as RewardCategory,
  online_retail: 'online_shopping_others' as RewardCategory,
  wholesale: 'wholesale' as RewardCategory,
  drugstores: 'drugstores' as RewardCategory,
  department_stores: 'department_stores' as RewardCategory,
  home_improvement: 'home_improvement' as RewardCategory,
  
  // Tech & Digital
  streaming: 'streaming' as RewardCategory,
  phone: 'cell_phone' as RewardCategory,
  cell_phone: 'cell_phone' as RewardCategory,
  internet: 'internet' as RewardCategory,
  mobile_wallets: 'digital_wallets' as RewardCategory,
  apple_pay: 'apple_pay' as RewardCategory,
  digital_wallets: 'digital_wallets' as RewardCategory,
  
  // Lifestyle
  fitness: 'fitness' as RewardCategory,
  entertainment: 'entertainment' as RewardCategory,
  
  // Business
  office_supplies: 'business' as RewardCategory,
  shipping: 'business' as RewardCategory,
  advertising: 'business' as RewardCategory,
  technology: 'business' as RewardCategory,
  computer_hardware: 'business' as RewardCategory,
  
  // Hotel Brands
  marriott: 'marriott' as RewardCategory,
  hilton: 'hilton' as RewardCategory,
  hyatt: 'hyatt' as RewardCategory,
  ihg: 'ihg' as RewardCategory,
  wyndham: 'wyndham' as RewardCategory,
  choice: 'choice' as RewardCategory,
  
  // Airline Brands
  united: 'united' as RewardCategory,
  delta: 'delta' as RewardCategory,
  american: 'american' as RewardCategory,
  southwest: 'southwest' as RewardCategory,
  jetblue: 'jetblue' as RewardCategory,
  alaska: 'alaska' as RewardCategory,
  
  // Retailers
  amazon: 'other' as RewardCategory,
  whole_foods: 'groceries' as RewardCategory,
  costco: 'wholesale' as RewardCategory,
  walmart: 'other' as RewardCategory,
  walmart_online: 'online_shopping_others' as RewardCategory,
  walmart_store: 'other' as RewardCategory,
  target: 'other' as RewardCategory,
  apple: 'apple_purchases' as RewardCategory,
  paypal: 'digital_wallets' as RewardCategory,
  
  // Special
  rotating: 'rotating' as RewardCategory,
  top_category: 'rotating' as RewardCategory,
  choice_category: 'rotating' as RewardCategory,
  rent: 'other' as RewardCategory,
  physical_card: 'everything_else' as RewardCategory,
  everything_else: 'everything_else' as RewardCategory,
};

const ISSUER_CODE_TO_ENUM: Record<string, CardIssuer> = {
  chase: 'Chase' as CardIssuer,
  amex: 'American Express' as CardIssuer,
  citi: 'Citi' as CardIssuer,
  capital_one: 'Capital One' as CardIssuer,
  discover: 'Discover' as CardIssuer,
  bofa: 'Bank of America' as CardIssuer,
  wells_fargo: 'Wells Fargo' as CardIssuer,
  usbank: 'Other' as CardIssuer,
  bilt: 'Other' as CardIssuer,
  apple: 'Apple' as CardIssuer,
  synchrony: 'Other' as CardIssuer,
  pnc: 'Other' as CardIssuer,
};

// ============================================================
// LOADER FUNCTIONS
// ============================================================

/**
 * Load a single TOML file
 */
function loadTOMLFile<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return TOML.parse(content) as T;
  } catch (error) {
    log.error('Error loading TOML file', { filePath, error });
    return null;
  }
}

/**
 * Check if a date range is currently active
 */
function isDateActive(startDate: string, endDate: string): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
}

/**
 * Convert TOML rewards to RewardStructure array
 */
function convertRewards(
  rewards: Record<string, number>,
  caps?: Record<string, { annual_limit?: number; quarterly_limit?: number; monthly_limit?: number; then_rate?: number }>
): RewardStructure[] {
  const result: RewardStructure[] = [];
  
  for (const [category, multiplier] of Object.entries(rewards)) {
    const rewardCategory = TOML_TO_REWARD_CATEGORY[category];
    if (!rewardCategory) {
      log.warn('Unknown reward category', { category });
      continue;
    }
    
    const reward: RewardStructure = {
      category: rewardCategory,
      multiplier,
    };
    
    // Add cap information if present
    if (caps && caps[category]) {
      const cap = caps[category];
      if (cap.annual_limit) {
        reward.cap = `$${cap.annual_limit.toLocaleString()}/year`;
      } else if (cap.quarterly_limit) {
        reward.cap = `$${cap.quarterly_limit.toLocaleString()}/quarter`;
      } else if (cap.monthly_limit) {
        reward.cap = `$${cap.monthly_limit.toLocaleString()}/month`;
      }
      if (cap.then_rate !== undefined) {
        reward.notes = `Then ${cap.then_rate}x`;
      }
    }
    
    result.push(reward);
  }
  
  return result;
}

/**
 * Convert a TOML card config to CreditCardTemplate
 */
function convertCard(
  cardKey: string,
  config: TOMLCardConfig,
  issuerCode: string,
  meta: TOMLIssuerFile['meta']
): LoadedCard {
  const issuer = ISSUER_CODE_TO_ENUM[issuerCode] || ('Other' as CardIssuer);
  
  const card: LoadedCard = {
    id: config.id || `${issuerCode}-${cardKey}`,
    name: config.name,
    issuer,
    nickname: config.nickname,
    image: `/card-logos/${config.id || cardKey}.png`,
    rewards: convertRewards(config.rewards, config.rewards_caps),
    popular: config.popular ?? false,
    business: config.business ?? false,
    annualFee: config.annual_fee,
    bonusOffer: config.bonus 
      ? `${config.bonus.amount.toLocaleString()} ${config.bonus.type} after $${config.bonus.spend_required?.toLocaleString() || '0'} spend in ${config.bonus.time_months || 0} months`
      : undefined,
    // Extended fields
    pointValueCents: meta.point_value_cents,
    currency: meta.currency,
    network: config.network,
    creditRequired: config.credit_required,
    foreignTransactionFee: config.foreign_transaction_fee,
    cardType: config.card_type,
    requiresMembership: config.requires_membership,
    benefits: config.benefits,
  };
  
  if (config.rotating_categories) {
    card.rotatingCategories = {
      currentQuarter: config.rotating_categories.current_quarter,
      categories: config.rotating_categories.categories,
      nextQuarter: config.rotating_categories.next_quarter,
      nextCategories: config.rotating_categories.next_categories,
    };
  }
  
  return card;
}

/**
 * Load all card files from the config/cards directory
 */
export function loadAllCards(configDir: string = path.join(process.cwd(), 'config', 'cards')): LoadedCard[] {
  const cards: LoadedCard[] = [];
  
  try {
    const files = fs.readdirSync(configDir).filter(f => f.endsWith('.toml'));
    
    for (const file of files) {
      const filePath = path.join(configDir, file);
      const data = loadTOMLFile<TOMLIssuerFile>(filePath);
      
      if (!data || !data.meta || !data.cards) {
        // Handle files with multiple issuers (like other-issuers.toml)
        const multiIssuerData = loadTOMLFile<Record<string, unknown>>(filePath);
        if (multiIssuerData) {
          // Process cards that have issuer field directly
          for (const [key, value] of Object.entries(multiIssuerData)) {
            if (key.startsWith('cards.') || (typeof value === 'object' && value && 'rewards' in value)) {
              const cardConfig = value as TOMLCardConfig & { issuer?: string };
              if (cardConfig.name && cardConfig.rewards) {
                const issuerCode = cardConfig.issuer?.toLowerCase().replace(/ /g, '_') || 'other';
                const mockMeta = {
                  issuer: cardConfig.issuer || 'Other',
                  issuer_code: issuerCode,
                  last_updated: new Date().toISOString(),
                  currency: 'Points',
                  point_value_cents: 1.0,
                };
                cards.push(convertCard(key.replace('cards.', ''), cardConfig, issuerCode, mockMeta));
              }
            }
          }
        }
        continue;
      }
      
      const issuerCode = data.meta.issuer_code;
      
      for (const [cardKey, cardConfig] of Object.entries(data.cards)) {
        cards.push(convertCard(cardKey, cardConfig, issuerCode, data.meta));
      }
    }
  } catch (error) {
    log.error('Error loading card files', { error });
  }
  
  return cards;
}

/**
 * Load current offers and merge with cards
 */
export function loadCurrentOffers(
  configDir: string = path.join(process.cwd(), 'config', 'offers')
): CurrentOffersConfig | null {
  const offersPath = path.join(configDir, 'current-offers.toml');
  return loadTOMLFile<CurrentOffersConfig>(offersPath);
}

/**
 * Merge elevated bonuses into cards
 */
export function mergeOffersIntoCards(
  cards: LoadedCard[],
  offers: CurrentOffersConfig | null
): LoadedCard[] {
  if (!offers) return cards;
  
  const cardMap = new Map(cards.map(c => [c.id, c]));
  
  // Merge elevated bonuses
  if (offers.elevated_bonuses) {
    for (const bonus of Object.values(offers.elevated_bonuses)) {
      if (!isDateActive(bonus.start_date, bonus.end_date)) continue;
      
      const card = cardMap.get(bonus.card_id);
      if (card) {
        card.bonusOffer = `${bonus.bonus_amount.toLocaleString()} ${bonus.bonus_type} after $${bonus.spend_required?.toLocaleString() || '0'} spend in ${bonus.time_months || 0} months`;
        card.hasElevatedBonus = true;
        card.elevatedBonusExpires = bonus.end_date;
      }
    }
  }
  
  // Merge spending promos
  if (offers.spending_promos) {
    for (const promo of Object.values(offers.spending_promos)) {
      if (!isDateActive(promo.start_date, promo.end_date)) continue;
      
      const card = cardMap.get(promo.card_id);
      if (card) {
        if (!card.activeSpendingPromos) card.activeSpendingPromos = [];
        card.activeSpendingPromos.push(promo);
      }
    }
  }
  
  // Merge merchant offers (Amex Offers, Chase Offers)
  const allMerchantOffers = [
    ...Object.values(offers.amex_offers || {}),
    ...Object.values(offers.chase_offers || {}),
  ];
  
  for (const offer of allMerchantOffers) {
    if (!isDateActive(offer.start_date, offer.end_date)) continue;
    
    for (const cardId of offer.eligible_cards) {
      if (cardId === 'all_amex' || cardId === 'all_chase') {
        // Apply to all cards from that issuer
        for (const card of cards) {
          const isAmex = card.issuer === 'American Express';
          const isChase = card.issuer === 'Chase';
          if ((cardId === 'all_amex' && isAmex) || (cardId === 'all_chase' && isChase)) {
            if (!card.activeMerchantOffers) card.activeMerchantOffers = [];
            card.activeMerchantOffers.push(offer);
          }
        }
      } else {
        const card = cardMap.get(cardId);
        if (card) {
          if (!card.activeMerchantOffers) card.activeMerchantOffers = [];
          card.activeMerchantOffers.push(offer);
        }
      }
    }
  }
  
  return cards;
}

/**
 * Get active transfer bonuses
 */
export function getActiveTransferBonuses(offers: CurrentOffersConfig | null): TransferBonus[] {
  if (!offers?.transfer_bonuses) return [];
  
  return Object.values(offers.transfer_bonuses).filter(bonus => 
    isDateActive(bonus.start_date, bonus.end_date) && bonus.bonus_percentage > 0
  );
}

/**
 * Main loader function - loads cards and merges current offers
 */
export function loadCardDatabase(): {
  cards: LoadedCard[];
  offers: CurrentOffersConfig | null;
  transferBonuses: TransferBonus[];
  lastUpdated: string;
} {
  const cards = loadAllCards();
  const offers = loadCurrentOffers();
  const mergedCards = mergeOffersIntoCards(cards, offers);
  const transferBonuses = getActiveTransferBonuses(offers);
  
  return {
    cards: mergedCards,
    offers,
    transferBonuses,
    lastUpdated: offers?.meta.last_updated || new Date().toISOString(),
  };
}

/**
 * Get cards by category with current multipliers (including promos)
 */
export function getCardsForCategory(
  cards: LoadedCard[],
  category: string
): Array<{ card: LoadedCard; multiplier: number; hasPromo: boolean }> {
  const rewardCategory = TOML_TO_REWARD_CATEGORY[category] || category;
  
  return cards
    .map(card => {
      // Check base rewards
      const baseReward = card.rewards.find(r => r.category === rewardCategory);
      let multiplier = baseReward?.multiplier || 0;
      let hasPromo = false;
      
      // Check for active spending promos that boost this category
      const promo = card.activeSpendingPromos?.find(p => p.category === category);
      if (promo) {
        multiplier = Math.max(multiplier, promo.multiplier);
        hasPromo = true;
      }
      
      return { card, multiplier, hasPromo };
    })
    .filter(item => item.multiplier > 0)
    .sort((a, b) => b.multiplier - a.multiplier);
}

// Export for testing
export { isDateActive, convertRewards, TOML_TO_REWARD_CATEGORY };
