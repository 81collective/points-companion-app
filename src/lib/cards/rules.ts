export type CardRule = {
  id: string;
  name: string;
  program: 'UR' | 'MR' | 'CF' | 'CB' | 'Other';
  baseRate: number; // x points per $1
  bonus?: Array<{
    taxonomy?: string;
    mcc?: number[];
    brandId?: string[];
    rate: number; // x points per $1
  }>;
  pointValueCents: number; // cents per point estimate
};

// Minimal seed; replace with your real catalog later
export const CARD_RULES: CardRule[] = [
  {
    id: 'csr',
    name: 'Chase Sapphire Reserve',
    program: 'UR',
    baseRate: 1,
    bonus: [
      { taxonomy: 'dining', rate: 3 },
      { taxonomy: 'travel', rate: 3 },
    ],
    pointValueCents: 1.5,
  },
  {
    id: 'citi_custom_cash',
    name: 'Citi Custom Cash',
    program: 'CB',
    baseRate: 1,
    bonus: [
      { taxonomy: 'groceries', rate: 5 },
      { taxonomy: 'dining', rate: 5 },
      { taxonomy: 'gas', rate: 5 },
    ],
    pointValueCents: 1.0,
  },
  {
    id: 'amx_gold',
    name: 'Amex Gold',
    program: 'MR',
    baseRate: 1,
    bonus: [
      { taxonomy: 'dining', rate: 4 },
      { taxonomy: 'groceries', rate: 4 },
    ],
    pointValueCents: 1.8,
  },
];
