import { getPopularMerchantCategory, saveUserCorrection } from '@/lib/merchantDB';
import { getOpenAICompletion } from './openaiHelpers';
import type { Category } from '@/types/rewards';

export interface CategorizationResult {
  category: Category;
  confidence: number;
  reasoning?: string;
  source: 'ai' | 'db' | 'manual';
}

export async function categorizeTransaction(
  merchant: string,
  amount: number,
  description?: string,
  userCorrection?: Category
): Promise<CategorizationResult> {
  // 1. Check user correction database first
  if (userCorrection) {
    await saveUserCorrection(merchant, userCorrection);
    return {
      category: userCorrection,
      confidence: 1,
      source: 'manual',
      reasoning: 'User override',
    };
  }

  // 2. Check popular merchant database
  const dbCategory = getPopularMerchantCategory(merchant);
  if (dbCategory) {
    return {
      category: dbCategory.category,
      confidence: dbCategory.confidence,
      source: 'db',
      reasoning: dbCategory.reasoning,
    };
  }

  // 3. Use OpenAI for ambiguous/unknown merchants
  try {
    const prompt = `Categorize the following transaction for credit card rewards.\nMerchant: ${merchant}\nAmount: $${amount}\nDescription: ${description || ''}\nCategories: dining, groceries, travel, gas, other.\nRespond with the best category, a confidence score (0-1), and a brief reasoning.`;
    const aiResponse = await getOpenAICompletion(prompt);
    // Example AI response: { category: 'dining', confidence: 0.85, reasoning: 'Restaurant merchant' }
    if (aiResponse && aiResponse.category) {
      return {
        category: aiResponse.category,
        confidence: aiResponse.confidence,
        reasoning: aiResponse.reasoning,
        source: 'ai',
      };
    }
  } catch {
    // Fallback: default to 'other' with low confidence
    return {
      category: 'other',
      confidence: 0.3,
      reasoning: 'AI service unavailable, fallback to other',
      source: 'ai',
    };
  }

  // Final fallback
  return {
    category: 'other',
    confidence: 0.2,
    reasoning: 'Unable to categorize',
    source: 'ai',
  };
}

export async function batchCategorize(transactions: Array<{ merchant: string; amount: number; description?: string }>): Promise<CategorizationResult[]> {
  return Promise.all(transactions.map(tx => categorizeTransaction(tx.merchant, tx.amount, tx.description)));
}

// Learning from user corrections
export async function learnFromCorrection(merchant: string, correctCategory: Category) {
  await saveUserCorrection(merchant, correctCategory);
}
