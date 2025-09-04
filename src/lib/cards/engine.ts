import { CARD_RULES, CardRule } from './rules';

export type ClassificationLite = {
  taxonomy: string;
  mccCandidates?: number[];
  brandId?: string;
  confidence?: number;
};

export type CardEval = {
  cardId: string;
  cardName: string;
  rate: number; // points per $1
  estValueCentsPerDollar: number; // rate * pointValue
  reasons: string[];
};

export function evaluateCards(classification: ClassificationLite, _amountUsd = 1): CardEval[] {
  const out: CardEval[] = [];
  for (const card of CARD_RULES) {
    const { rate, reasons } = bestRate(card, classification);
    const value = rate * card.pointValueCents;
    out.push({ cardId: card.id, cardName: card.name, rate, estValueCentsPerDollar: value, reasons });
  }
  return out.sort((a, b) => b.estValueCentsPerDollar - a.estValueCentsPerDollar);
}

function bestRate(card: CardRule, c: ClassificationLite): { rate: number; reasons: string[] } {
  let rate = card.baseRate;
  const reasons: string[] = [];
  if (card.bonus) {
    for (const rule of card.bonus) {
      if (rule.taxonomy && rule.taxonomy === c.taxonomy) {
        if (rule.rate > rate) {
          rate = rule.rate;
          reasons.push(`Bonus for ${c.taxonomy}`);
        }
      }
      if (rule.brandId && c.brandId && rule.brandId.includes(c.brandId)) {
        if (rule.rate > rate) {
          rate = rule.rate;
          reasons.push(`Brand bonus`);
        }
      }
      if (rule.mcc && c.mccCandidates?.some((m) => rule.mcc!.includes(m))) {
        if (rule.rate > rate) {
          rate = rule.rate;
          reasons.push(`MCC match`);
        }
      }
    }
  }
  if (reasons.length === 0) reasons.push('Base earn rate');
  return { rate, reasons };
}
