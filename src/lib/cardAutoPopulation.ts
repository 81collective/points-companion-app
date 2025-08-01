import { creditCardDatabase } from '@/data/creditCardDatabase';
import { CreditCardTemplate, RewardStructure } from '@/types/creditCards';

export function getCardTemplate(cardId: string): CreditCardTemplate | undefined {
  return creditCardDatabase.find(card => card.id === cardId);
}

export function autoPopulateRewards(cardId: string): RewardStructure[] {
  const card = getCardTemplate(cardId);
  return card ? card.rewards : [];
}

export function validateRewardStructure(rewards: RewardStructure[]): boolean {
  // Basic validation: no duplicate categories, multipliers > 0
  const categories = new Set<string>();
  for (const r of rewards) {
    if (categories.has(r.category)) return false;
    categories.add(r.category);
    if (r.multiplier <= 0) return false;
  }
  return true;
}
