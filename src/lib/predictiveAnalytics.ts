import { createClient } from '@/lib/supabase';
import { getOpenAIClient, isOpenAIConfigured } from './openai';

export interface SpendingPrediction {
  futurePatterns: string[];
  recommendedCards: string[];
  annualPointsForecast: Array<{ strategy: string; points: number }>;
  categoryTrends: Array<{ category: string; trend: string }>;
}

export async function predictSpending(userId: string): Promise<SpendingPrediction> {
  const supabase = createClient();
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);
  const openai = getOpenAIClient();
  if (!isOpenAIConfigured || !openai) {
    return {
      futurePatterns: [],
      recommendedCards: [],
      annualPointsForecast: [],
      categoryTrends: [],
    };
  }
  const prompt = `Predict future spending, recommend new cards, forecast annual points, and identify category trends for user: ${JSON.stringify(transactions)}`;
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
