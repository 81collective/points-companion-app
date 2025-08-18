export type CategoryKey =
  | 'dining'
  | 'coffee'
  | 'groceries'
  | 'gas'
  | 'shopping'
  | 'pharmacy'
  | 'entertainment'
  | 'travel'
  | 'electronics'
  | 'hotels'
  | 'home_improvement';

type ProviderMapping = {
  googleTypes: string[];
  googleKeywords: string[];
};

export const CATEGORY_MAP: Record<CategoryKey, ProviderMapping> = {
  dining: {
    googleTypes: ['restaurant', 'meal_takeaway', 'meal_delivery'],
    googleKeywords: ['restaurant', 'eat', 'lunch', 'dinner', 'food', 'best lunch'],
  },
  coffee: {
    googleTypes: ['cafe'],
    googleKeywords: ['coffee', 'espresso', 'latte', 'cafe'],
  },
  groceries: {
    googleTypes: ['grocery_or_supermarket', 'supermarket', 'convenience_store'],
    googleKeywords: ['groceries', 'supermarket', 'market', 'bodega'],
  },
  gas: {
    googleTypes: ['gas_station'],
    googleKeywords: ['gas', 'fuel'],
  },
  shopping: {
    googleTypes: ['department_store', 'shopping_mall'],
    googleKeywords: ['shopping', 'retail', 'outlet', 'store'],
  },
  pharmacy: {
    googleTypes: ['pharmacy', 'drugstore'],
    googleKeywords: ['pharmacy', 'drugstore', 'medication'],
  },
  entertainment: {
    googleTypes: ['movie_theater', 'tourist_attraction', 'bowling_alley'],
    googleKeywords: ['entertainment', 'theater', 'cinema', 'bowling', 'fun'],
  },
  travel: {
    googleTypes: ['travel_agency', 'tourist_attraction'],
    googleKeywords: ['travel', 'tours'],
  },
  electronics: {
    googleTypes: ['electronics_store'],
    googleKeywords: ['electronics', 'gadgets', 'tech store'],
  },
  hotels: {
    googleTypes: ['lodging'],
    googleKeywords: ['hotel', 'lodging'],
  },
  home_improvement: {
    googleTypes: ['home_goods_store', 'hardware_store'],
    googleKeywords: ['home improvement', 'hardware', 'home goods'],
  },
};
