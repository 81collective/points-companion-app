import { findBrandIdByName } from './brands';
import { mccsForTaxonomy, Taxonomy } from './mccMap';

export type ProviderSignals = {
  googleTypes?: string[];
  mapboxPlaceName?: string;
};

export type Classification = {
  taxonomy: Taxonomy;
  mccCandidates: number[];
  confidence: number; // 0..1
  brandId?: string;
};

const KEYWORD_TO_TAXONOMY: Array<{ rx: RegExp; t: Taxonomy; w: number }> = [
  { rx: /coffee|cafe|espresso|latte/i, t: 'coffee', w: 0.5 },
  { rx: /restaurant|diner|grill|taqueria|pizza|sushi|noodle|bbq/i, t: 'dining', w: 0.5 },
  { rx: /grocery|supermarket|market|bodega/i, t: 'groceries', w: 0.5 },
  { rx: /gas|fuel|station/i, t: 'gas', w: 0.6 },
  { rx: /pharmacy|drugstore/i, t: 'pharmacy', w: 0.6 },
  { rx: /hotel|inn|lodging/i, t: 'hotels', w: 0.6 },
  { rx: /electronics|gadgets/i, t: 'electronics', w: 0.4 },
  { rx: /hardware|home\s?goods|home\s?improvement/i, t: 'home_improvement', w: 0.5 },
  { rx: /movie|theater|bowling|attraction/i, t: 'entertainment', w: 0.4 },
  { rx: /travel|tours|agency/i, t: 'travel', w: 0.3 },
];

export function classifyBusiness(input: {
  name?: string;
  googleTypes?: string[];
  mapboxPlaceName?: string;
}): Classification {
  let best: { taxonomy: Taxonomy; score: number } | undefined;
  let brandId: string | undefined;

  // Brand match dominates
  if (input.name) {
    const brand = findBrandIdByName(input.name);
    if (brand) {
      brandId = brand.id;
      best = { taxonomy: brand.taxonomy, score: 1.0 };
    }
  }

  const votes = new Map<Taxonomy, number>();
  const addVote = (t: Taxonomy, w: number) => votes.set(t, (votes.get(t) ?? 0) + w);

  // Google types mapping (simple heuristics)
  for (const gt of input.googleTypes ?? []) {
    const g = gt.toLowerCase();
    if (/restaurant|meal_takeaway|meal_delivery|food|bakery|bar|bistro|brunch/.test(g)) addVote('dining', 0.85);
    if (/cafe|coffee/.test(g)) addVote('coffee', 0.9);
    if (/grocery|supermarket|convenience|market/.test(g)) addVote('groceries', 0.8);
    if (/gas/.test(g)) addVote('gas', 0.8);
    if (/pharmacy|drugstore/.test(g)) addVote('pharmacy', 0.8);
    if (/movie|theater|bowling|attraction/.test(g)) addVote('entertainment', 0.7);
    if (/lodging|hotel/.test(g)) addVote('hotels', 0.85);
    if (/electronics/.test(g)) addVote('electronics', 0.6);
    if (/home_goods|hardware/.test(g)) addVote('home_improvement', 0.6);
    if (/department_store|shopping_mall|store|retail/.test(g)) addVote('shopping', 0.55);
  }

  // Mapbox place-name keywords
  if (input.mapboxPlaceName) {
    for (const rule of KEYWORD_TO_TAXONOMY) {
      if (rule.rx.test(input.mapboxPlaceName)) addVote(rule.t, rule.w);
    }
  }

  // Name keywords
  if (input.name) {
    for (const rule of KEYWORD_TO_TAXONOMY) {
      if (rule.rx.test(input.name)) addVote(rule.t, rule.w);
    }
  }

  // Decide best taxonomy
  const sorted = Array.from(votes.entries()).sort((a, b) => b[1] - a[1]);
  if (!best && sorted[0]) {
    best = { taxonomy: sorted[0][0], score: Math.min(1, sorted[0][1]) };
  }
  // Default if still unknown
  if (!best) best = { taxonomy: 'shopping', score: 0.3 };

  // Nudge ambiguous cases with food cues toward dining/coffee
  const nameBlob = `${input.name ?? ''} ${input.mapboxPlaceName ?? ''}`;
  if (best.taxonomy === 'shopping') {
    if (/cafe|coffee|espresso|latte/i.test(nameBlob)) {
      best = { taxonomy: 'coffee', score: Math.max(best.score, 0.6) };
    } else if (/restaurant|grill|bar|kitchen|pizza|sushi|taco|bbq|deli|bistro|eatery/i.test(nameBlob)) {
      best = { taxonomy: 'dining', score: Math.max(best.score, 0.6) };
    }
  }

  return {
    taxonomy: best.taxonomy,
    mccCandidates: mccsForTaxonomy(best.taxonomy),
    confidence: Math.min(1, best.score),
    brandId,
  };
}
