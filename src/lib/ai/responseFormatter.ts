export type Recommendation = {
  card: {
    card_name: string;
    issuer: string;
    annual_fee: number;
    bonus_offer?: string;
  };
  estimated_points?: number;
  annual_value?: number; // estimated $ value per $100 spend baseline in API
  match_score?: number;
  reasons?: string[];
  reward_multiplier?: number; // e.g., 3 for 3x
};

export function formatTransparentMath(rec: Recommendation, basisAmount = 100) {
  const mult = rec.reward_multiplier ?? 1;
  const points = rec.estimated_points ?? Math.round(basisAmount * mult);
  // Assume 1.25 cpp heuristic for points cards unless stated otherwise
  const centsPerPoint = 0.0125;
  const estValue = Math.round(points * centsPerPoint * 100) / 100;
  const feeImpactMonthly = rec.card.annual_fee ? Math.round((rec.card.annual_fee / 12) * 100) / 100 : 0;
  const netMonthly = Math.round((estValue - feeImpactMonthly) * 100) / 100;

  return {
    basisAmount,
    multiplier: mult,
    points,
    estValueUSD: estValue,
    annualFee: rec.card.annual_fee,
    monthlyFeeImpact: feeImpactMonthly,
    netMonthlyUSD: netMonthly,
    reasons: rec.reasons || [],
  };
}
