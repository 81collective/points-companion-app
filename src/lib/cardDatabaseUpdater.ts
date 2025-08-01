import { creditCardDatabase } from '@/data/creditCardDatabase';
import { CreditCardTemplate } from '@/types/creditCards';

export function addNewCard(card: CreditCardTemplate) {
  // Validate and add new card
  // In real app, update persistent storage and version
  creditCardDatabase.push(card);
}

export function updateCard(cardId: string, updates: Partial<CreditCardTemplate>) {
  const card = creditCardDatabase.find(c => c.id === cardId);
  if (card) Object.assign(card, updates);
}

export function getDatabaseVersion(): string {
  // Placeholder for versioning
  return '2025.08.01';
}
