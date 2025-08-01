import type { Category } from '@/types/rewards';

// In-memory popular merchant database (replace with real DB in production)
const popularMerchants: Record<string, { category: Category; confidence: number; reasoning: string }> = {
  'starbucks': { category: 'dining', confidence: 0.98, reasoning: 'Coffee shop, typically dining' },
  'shell': { category: 'gas', confidence: 0.99, reasoning: 'Gas station' },
  'whole foods': { category: 'groceries', confidence: 0.97, reasoning: 'Grocery store' },
  'delta': { category: 'travel', confidence: 0.95, reasoning: 'Airline, travel' },
};

// User corrections (simulate persistent storage)
const userCorrections: Record<string, Category> = {};

export function getPopularMerchantCategory(merchant: string) {
  const normalized = merchant.trim().toLowerCase();
  if (userCorrections[normalized]) {
    return {
      category: userCorrections[normalized],
      confidence: 1,
      reasoning: 'User correction',
    };
  }
  return popularMerchants[normalized] || null;
}

export async function saveUserCorrection(merchant: string, category: Category) {
  const normalized = merchant.trim().toLowerCase();
  userCorrections[normalized] = category;
}
