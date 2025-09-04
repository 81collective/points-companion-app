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
    id: 'csp',
    name: 'Chase Sapphire Preferred',
    program: 'UR',
    baseRate: 1,
    bonus: [
      { taxonomy: 'dining', rate: 3 },
      { taxonomy: 'travel', rate: 2 },
    ],
    pointValueCents: 1.25,
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
    id: 'freedom_flex',
    name: 'Chase Freedom Flex',
    program: 'UR',
    baseRate: 1,
    bonus: [
      { taxonomy: 'dining', rate: 3 },
      { taxonomy: 'drugstores', rate: 3 },
    ],
    pointValueCents: 1.0,
  },
  {
    id: 'freedom_unlimited',
    name: 'Chase Freedom Unlimited',
    program: 'UR',
    baseRate: 1.5,
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
  {
    id: 'amex_platinum',
    name: 'Amex Platinum',
    program: 'MR',
    baseRate: 1,
    bonus: [
      { taxonomy: 'travel', rate: 5 },
      { taxonomy: 'hotels', rate: 5 },
    ],
    pointValueCents: 1.8,
  },
  {
    id: 'citi_premier',
    name: 'Citi Premier',
    program: 'Other',
    baseRate: 1,
    bonus: [
      { taxonomy: 'dining', rate: 3 },
      { taxonomy: 'groceries', rate: 3 },
      { taxonomy: 'gas', rate: 3 },
      { taxonomy: 'travel', rate: 3 },
    ],
    pointValueCents: 1.0,
  },
  {
    id: 'capone_savor',
    name: 'Capital One Savor',
    program: 'CB',
    baseRate: 1,
    bonus: [
      { taxonomy: 'dining', rate: 4 },
      { taxonomy: 'entertainment', rate: 4 },
    ],
    pointValueCents: 1.0,
  },
  {
    id: 'capone_savor_one',
    name: 'Capital One SavorOne',
    program: 'CB',
    baseRate: 1,
    bonus: [
      { taxonomy: 'dining', rate: 3 },
      { taxonomy: 'groceries', rate: 3 },
      { taxonomy: 'entertainment', rate: 3 },
    ],
    pointValueCents: 1.0,
  },
  {
    id: 'bcp',
    name: 'Amex Blue Cash Preferred',
    program: 'CB',
    baseRate: 1,
    bonus: [
      { taxonomy: 'groceries', rate: 6 },
      { taxonomy: 'gas', rate: 3 },
    ],
    pointValueCents: 1.0,
  },
];
