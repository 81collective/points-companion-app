export type BrandRecord = {
  id: string;
  names: string[]; // synonyms
  taxonomy: 'dining' | 'coffee' | 'groceries' | 'gas' | 'shopping' | 'pharmacy' | 'entertainment' | 'travel' | 'electronics' | 'hotels' | 'home_improvement';
  mcc: number;
};

// Minimal seed; extend over time
export const BRANDS: BrandRecord[] = [
  { id: 'starbucks', names: ['starbucks', 'starbucks coffee'], taxonomy: 'coffee', mcc: 5814 },
  { id: 'mcdonalds', names: ["mcdonald's", 'mcdonalds'], taxonomy: 'dining', mcc: 5814 },
  { id: 'costco', names: ['costco', 'costco wholesale'], taxonomy: 'shopping', mcc: 5300 },
  { id: 'shell', names: ['shell'], taxonomy: 'gas', mcc: 5541 },
  { id: 'marriott', names: ['marriott', 'marriott hotel'], taxonomy: 'hotels', mcc: 7011 },
  { id: 'walgreens', names: ['walgreens'], taxonomy: 'pharmacy', mcc: 5912 },
  { id: 'home_depot', names: ['home depot', 'the home depot'], taxonomy: 'home_improvement', mcc: 5200 },
];

export function findBrandIdByName(name: string): BrandRecord | undefined {
  const norm = normalize(name);
  for (const b of BRANDS) {
    for (const alias of b.names) {
      if (normalize(alias) === norm) return b;
      // startsWith to catch “Starbucks Reserve ...”
      if (norm.startsWith(normalize(alias))) return b;
    }
  }
  return undefined;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}
