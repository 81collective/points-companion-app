import type { Recommendation } from './businessRecommendations';

export function formatTransparentMath(rec: Recommendation, spend: number = 100) {
  const points = Math.round((rec.reward_multiplier || 1) * spend);
  // conservative cpp
  const cpp = 0.0125;
  const estValue = Math.round(points * cpp * 100) / 100;
  const feeMonthly = (rec.card.annual_fee || 0) / 12;
  const netMonthly = Math.round((estValue - feeMonthly) * 100) / 100;
  return { points, estValue, feeMonthly, netMonthly };
}
