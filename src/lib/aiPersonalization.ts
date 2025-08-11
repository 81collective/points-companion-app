import { createClient } from '@/lib/supabase';
import { getOpenAIClient, isOpenAIConfigured } from './openai';

export interface SpendingProfile {
  userId: string;
  habits: string[];
  preferences: string[];
  seasonalPatterns: string[];
  feedbackHistory: Array<{ category: string; feedback: string }>;
}

export async function buildSpendingProfile(userId: string): Promise<SpendingProfile> {
  const supabase = createClient();
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);
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
  const prompt = `Analyze the following transactions for user habits, preferences, and seasonal patterns: ${JSON.stringify(transactions)}`;
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
  const { data: feedbacks } = await supabase
    .from('recommendations')
    .select('category, feedback')
    .eq('user_id', userId);
  return {
    userId,
    habits,
    preferences,
    seasonalPatterns,
    feedbackHistory: feedbacks || [],
  };
}

export async function adaptRecommendations(userId: string, feedback: string) {
  // Store feedback and retrain personalization
  const supabase = createClient();
  await supabase.from('recommendations').insert([{ user_id: userId, feedback }]);
  // Optionally trigger OpenAI retraining or update profile
}
