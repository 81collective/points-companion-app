import prisma from '@/lib/prisma';
import { getOpenAIClient, isOpenAIConfigured } from './openai-server';

export interface SpendingPrediction {
  futurePatterns: string[];
  recommendedCards: string[];
  annualPointsForecast: Array<{ strategy: string; points: number }>;
  categoryTrends: Array<{ category: string; trend: string }>;
}

export async function predictSpending(userId: string): Promise<SpendingPrediction> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  });
  const serializedTransactions = transactions.map((tx) => ({
    id: tx.id,
    amount: Number(tx.amount),
    date: tx.date.toISOString(),
    merchant: tx.merchantName,
    category: tx.category,
    cardId: tx.cardId,
    recommendedCardId: tx.recommendedCardId
  }));
  const openai = getOpenAIClient();
  if (!isOpenAIConfigured || !openai) {
    return {
      futurePatterns: [],
      recommendedCards: [],
      annualPointsForecast: [],
      categoryTrends: [],
    };
  }
  const prompt = `Predict future spending, recommend new cards, forecast annual points, and identify category trends for user: ${JSON.stringify(serializedTransactions)}`;
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4',
  });
  let prediction: SpendingPrediction = {
    futurePatterns: [],
    recommendedCards: [],
    annualPointsForecast: [],
    categoryTrends: [],
  };
  try {
    prediction = JSON.parse(completion.choices[0].message.content || '{}');
  } catch {}
  return prediction;
}
