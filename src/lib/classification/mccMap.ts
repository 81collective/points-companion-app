export type Taxonomy = 'dining' | 'coffee' | 'groceries' | 'gas' | 'shopping' | 'pharmacy' | 'entertainment' | 'travel' | 'electronics' | 'hotels' | 'home_improvement';

export const TAXONOMY_TO_MCC: Record<Taxonomy, number[]> = {
  dining: [5812, 5814],
  coffee: [5814],
  groceries: [5411],
  gas: [5541, 5542],
  shopping: [5311, 5300],
  pharmacy: [5912],
  entertainment: [7832, 7922, 7996, 7999],
  travel: [4722, 4112, 4111],
  electronics: [5732],
  hotels: [7011],
  home_improvement: [5200, 5251, 5211],
};

export function mccsForTaxonomy(t: Taxonomy): number[] {
  return TAXONOMY_TO_MCC[t] ?? [];
}

// Module marker: ensure this file is treated as a module
export {};
