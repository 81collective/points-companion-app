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

// Try to estimate welcome bonus value from a free-form bonus_offer like "80,000 points" or "$200"
export function estimateWelcomeBonusValue(bonusOffer?: string, cpp = 0.0125) {
  if (!bonusOffer) return 0;
  const dollars = bonusOffer.match(/\$\s*(\d{2,6})/i);
  if (dollars) return parseInt(dollars[1], 10);
  const points = bonusOffer.match(/(\d{2,6})\s*(?:pts|points|miles)/i);
  if (points) return Math.round(parseInt(points[1], 10) * cpp);
  return 0;
}

// Break-even monthly spend where rewards value offsets the monthly fee
export function estimateBreakEvenMonthlySpend(rec: Recommendation, cpp = 0.0125) {
  const feeMonthly = (rec.card.annual_fee || 0) / 12;
  const valuePerDollar = (rec.reward_multiplier ?? 1) * cpp;
  if (valuePerDollar <= 0) return Infinity;
  return Math.round((feeMonthly / valuePerDollar) * 100) / 100; // dollars per month
}

// Compare two recommendations by estimated value per $100 basis
export function deltaPerBasis(top: Recommendation, second: Recommendation, basisAmount = 100, cpp = 0.0125) {
  const multTop = top.reward_multiplier ?? 1;
  const multSecond = second.reward_multiplier ?? 1;
  const valTop = Math.round((basisAmount * multTop * cpp) * 100) / 100;
  const valSecond = Math.round((basisAmount * multSecond * cpp) * 100) / 100;
  return Math.round((valTop - valSecond) * 100) / 100;
}
