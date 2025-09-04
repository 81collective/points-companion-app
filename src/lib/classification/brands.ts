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
  // Coffee & Bakery
  { id: 'dunkin', names: ['dunkin', 'dunkin donuts', "dunkin'"], taxonomy: 'coffee', mcc: 5814 },
  { id: 'panera', names: ['panera', 'panera bread'], taxonomy: 'dining', mcc: 5814 },
  { id: 'peets', names: ["peet's", 'peets', "peet's coffee"], taxonomy: 'coffee', mcc: 5814 },
  // Fast Food & Quick Service
  { id: 'burger_king', names: ['burger king'], taxonomy: 'dining', mcc: 5814 },
  { id: 'wendys', names: ["wendy's", 'wendys'], taxonomy: 'dining', mcc: 5814 },
  { id: 'taco_bell', names: ['taco bell'], taxonomy: 'dining', mcc: 5814 },
  { id: 'chipotle', names: ['chipotle', 'chipotle mexican grill'], taxonomy: 'dining', mcc: 5814 },
  { id: 'subway', names: ['subway'], taxonomy: 'dining', mcc: 5814 },
  { id: 'chick_fil_a', names: ['chick fil a', "chick-fil-a", 'chik fil a'], taxonomy: 'dining', mcc: 5814 },
  { id: 'kfc', names: ['kfc', 'kentucky fried chicken'], taxonomy: 'dining', mcc: 5814 },
  { id: 'panda_express', names: ['panda express'], taxonomy: 'dining', mcc: 5814 },
  { id: 'five_guys', names: ['five guys', 'five guys burgers and fries'], taxonomy: 'dining', mcc: 5814 },
  { id: 'shake_shack', names: ['shake shack'], taxonomy: 'dining', mcc: 5814 },
  { id: 'in_n_out', names: ['in n out', 'in-n-out', 'in n out burger'], taxonomy: 'dining', mcc: 5814 },
  // Pizza Chains
  { id: 'dominos', names: ["domino's", 'dominos'], taxonomy: 'dining', mcc: 5814 },
  { id: 'pizza_hut', names: ['pizza hut'], taxonomy: 'dining', mcc: 5814 },
  { id: 'papajohns', names: ["papa john's", 'papa johns', 'papa johns pizza'], taxonomy: 'dining', mcc: 5814 },
  { id: 'little_caesars', names: ['little caesars'], taxonomy: 'dining', mcc: 5814 },
  // Casual & Sit-down
  { id: 'olive_garden', names: ['olive garden'], taxonomy: 'dining', mcc: 5812 },
  { id: 'chilis', names: ["chili's", 'chilis'], taxonomy: 'dining', mcc: 5812 },
  { id: 'applebees', names: ["applebee's", 'applebees'], taxonomy: 'dining', mcc: 5812 },
  { id: 'outback', names: ['outback', 'outback steakhouse'], taxonomy: 'dining', mcc: 5812 },
  { id: 'texas_roadhouse', names: ['texas roadhouse'], taxonomy: 'dining', mcc: 5812 },
  { id: 'buffalo_wild_wings', names: ['buffalo wild wings', 'bdubs', 'b dubs'], taxonomy: 'dining', mcc: 5812 },
  { id: 'cheesecake_factory', names: ['cheesecake factory', 'the cheesecake factory'], taxonomy: 'dining', mcc: 5812 },
  { id: 'red_lobster', names: ['red lobster'], taxonomy: 'dining', mcc: 5812 },
  { id: 'ihop', names: ['ihop', 'international house of pancakes'], taxonomy: 'dining', mcc: 5812 },
  { id: 'dennys', names: ["denny's", 'dennys'], taxonomy: 'dining', mcc: 5812 },
  { id: 'waffle_house', names: ['waffle house'], taxonomy: 'dining', mcc: 5812 },
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
