import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getOpenAIClient, isOpenAIConfigured } from './openai-server';

export interface SpendingProfile {
  userId: string;
  habits: string[];
  preferences: string[];
  seasonalPatterns: string[];
  feedbackHistory: Array<{ category: string; feedback: string }>;
}

export async function buildSpendingProfile(userId: string): Promise<SpendingProfile> {
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
  // Analyze transactions for habits, preferences, and seasonal patterns
  // Use OpenAI for advanced pattern recognition
  const openai = getOpenAIClient();
  if (!isOpenAIConfigured || !openai) {
    return {
      userId,
      habits: [],
      preferences: [],
      seasonalPatterns: [],
      feedbackHistory: [],
    };
  }
  const prompt = `Analyze the following transactions for user habits, preferences, and seasonal patterns: ${JSON.stringify(serializedTransactions)}`;
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4',
  });
  const analysis = completion.choices[0].message.content;
  // Parse analysis (assume JSON output)
  let habits: string[] = [], preferences: string[] = [], seasonalPatterns: string[] = [];
  try {
    const parsed = JSON.parse(analysis || '{}');
    habits = parsed.habits || [];
    preferences = parsed.preferences || [];
    seasonalPatterns = parsed.seasonalPatterns || [];
  } catch {}
  // Fetch feedback history
  const feedbackRecords = await prisma.recommendation.findMany({
    where: { userId, NOT: { feedback: null } },
    select: { transactionDetails: true, feedback: true }
  });
  const feedbackHistory = feedbackRecords.map((record) => {
    const details = (record.transactionDetails ?? {}) as Prisma.JsonObject;
    const category = typeof details.category === 'string' ? details.category : 'general';
    return { category, feedback: record.feedback || '' };
  });
  return {
    userId,
    habits,
    preferences,
    seasonalPatterns,
    feedbackHistory,
  };
}

interface AdaptRecommendationOptions {
  recommendedCard?: string;
  transactionDetails?: Record<string, unknown>;
  pointsEarned?: number | null;
  feedbackScore?: number | null;
  actualCardUsed?: string | null;
}

export async function adaptRecommendations(userId: string, feedback: string, options?: AdaptRecommendationOptions) {
  await prisma.recommendation.create({
    data: {
      userId,
      transactionDetails: (options?.transactionDetails || { source: 'feedback' }) as Prisma.JsonObject,
      recommendedCard: options?.recommendedCard || 'unspecified',
      actualCardUsed: options?.actualCardUsed ?? null,
      pointsEarned: options?.pointsEarned ?? null,
      feedback,
      feedbackScore: options?.feedbackScore ?? null
    }
  });
  // Optionally trigger OpenAI retraining or update profile
}
