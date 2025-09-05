// Client-side Google Places service that respects referer restrictions
// Removed unused Business import

interface PlaceSearchResult {
  id: string;
  name: string;
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  price_level?: number;
  place_id?: string;
  distance: number;
}

class ClientPlacesService {
  private map: google.maps.Map | null = null;
  private searchCache = new Map<string, { results: PlaceSearchResult[], timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Initialize once Google Maps is loaded
    if (typeof window !== 'undefined' && window.google) {
    }
    
    // Clean up cache every 10 minutes
    setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.searchCache.entries()) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.searchCache.delete(key);
      }
    }
  }

  private getCategoryTypes(category: string): string[] {
    const categoryMap: { [key: string]: string[] } = {
      // Dining - comprehensive restaurant and food options
      'dining': [
        'restaurant', 'food', 'meal_takeaway', 'meal_delivery', 'bakery', 'cafe', 
        'bar', 'night_club', 'fast_food', 'pizza_delivery', 'sandwich_shop', 
        'ice_cream_shop', 'coffee_shop', 'donut_shop', 'breakfast_restaurant',
        'lunch_restaurant', 'dinner_theater', 'family_restaurant', 'fine_dining_restaurant'
      ],
      
      // Gas stations and automotive fuel
      'gas': [
        'gas_station', 'fuel', 'charging_station', 'electric_vehicle_charging_station',
        'truck_stop', 'rest_stop', 'convenience_store_gas_station'
      ],
      
      // Grocery and food shopping
      'groceries': [
        'grocery_or_supermarket', 'supermarket', 'grocery_store', 'organic_grocery_store',
        'wholesale_store', 'gourmet_grocery_store', 'health_food_store', 'farmers_market',
        'butcher_shop', 'seafood_market', 'wine_store', 'liquor_store', 'beer_store'
      ],
      
      // Travel and accommodation
      'travel': [
        'lodging', 'hotel', 'motel', 'resort_hotel', 'bed_and_breakfast', 'guest_house',
        'hostel', 'extended_stay_hotel', 'love_hotel', 'travel_agency', 'tourist_attraction',
        'visitor_center', 'rv_park', 'campground', 'airport', 'subway_station', 'train_station'
      ],
      
      // Shopping and retail
      'shopping': [
        'shopping_mall', 'store', 'department_store', 'clothing_store', 'shoe_store',
        'electronics_store', 'furniture_store', 'home_goods_store', 'hardware_store',
        'sporting_goods_store', 'book_store', 'jewelry_store', 'pet_store', 'toy_store',
        'gift_shop', 'florist', 'pharmacy', 'drugstore'
      ],
      
      // Entertainment and recreation
      'entertainment': [
        'movie_theater', 'bowling_alley', 'amusement_park', 'zoo', 'aquarium',
        'museum', 'art_gallery', 'casino', 'park', 'playground', 'stadium',
        'performing_arts_theater', 'concert_hall', 'comedy_club', 'dance_club'
      ],
      
      // Services - professional and personal
      'services': [
        'bank', 'atm', 'post_office', 'police', 'fire_station', 'hospital',
        'doctor', 'dentist', 'veterinary_care', 'pharmacy', 'lawyer',
        'accountant', 'real_estate_agency', 'insurance_agency', 'car_rental',
        'car_wash', 'gas_station', 'parking', 'storage'
      ],
      
      // Fitness and health
      'fitness': [
        'gym', 'spa', 'beauty_salon', 'hair_care', 'physiotherapist',
        'yoga_studio', 'pilates_studio', 'martial_arts_school', 'swimming_pool',
        'tennis_court', 'golf_course', 'fitness_center'
      ],
      
      // Beauty and personal care
      'beauty': [
        'beauty_salon', 'hair_care', 'nail_salon', 'spa', 'tanning_salon',
        'massage_therapist', 'tattoo_parlor', 'barber_shop'
      ],
      
      // Automotive services
      'automotive': [
        'gas_station', 'car_dealer', 'car_repair', 'car_wash', 'parking',
        'tire_shop', 'auto_parts_store', 'motorcycle_dealer', 'rv_dealer'
      ],
      
      // Education and childcare
      'education': [
        'school', 'university', 'library', 'daycare', 'preschool',
        'tutoring_center', 'music_school', 'driving_school', 'language_school'
      ]
    };

    return categoryMap[category] || ['establishment'];
  }

  private getBrandPatterns(): { [key: string]: { brands: string[], category: string } } {
    return {
      // Major hotel chains
      hotels: {
        brands: [
          'marriott', 'hilton', 'hyatt', 'sheraton', 'westin', 'ritz-carlton', 
          'four seasons', 'intercontinental', 'crowne plaza', 'holiday inn',
          'hampton inn', 'courtyard', 'residence inn', 'springhill suites',
          'fairfield inn', 'ac hotel', 'aloft', 'w hotel', 'renaissance',
          'doubletree', 'embassy suites', 'homewood suites', 'candlewood suites'
        ],
        category: 'travel'
      },
      
      // Restaurant chains
      restaurants: {
        brands: [
          'mcdonald\'s', 'burger king', 'wendy\'s', 'taco bell', 'kfc', 'pizza hut',
          'domino\'s', 'subway', 'starbucks', 'dunkin\'', 'chipotle', 'panera',
          'chili\'s', 'applebee\'s', 'olive garden', 'red lobster', 'outback',
          'texas roadhouse', 'cheesecake factory', 'buffalo wild wings'
        ],
        category: 'dining'
      },
      
      // Gas station chains
      gas_stations: {
        brands: [
          'shell', 'exxon', 'mobil', 'chevron', 'bp', 'citgo', 'sunoco',
          'marathon', 'speedway', 'wawa', 'sheetz', 'casey\'s', 'circle k',
          'phillips 66', 'valero', '76', 'arco', 'gulf', 'hess'
        ],
        category: 'gas'
      },
      
      // Grocery chains
      grocery: {
        brands: [
          'walmart', 'target', 'kroger', 'safeway', 'publix', 'wegmans',
          'whole foods', 'trader joe\'s', 'costco', 'sam\'s club', 'aldi',
          'food lion', 'giant', 'stop & shop', 'king soopers', 'fred meyer'
        ],
        category: 'groceries'
      }
    };
  }

  private identifyBusinessCategory(name: string, types: string[], fallbackCategory?: string): string {
    const nameLower = name.toLowerCase();
    const brandPatterns = this.getBrandPatterns();
    
    // Check brand patterns first
    for (const [, { brands, category }] of Object.entries(brandPatterns)) {
      for (const brand of brands) {
        if (nameLower.includes(brand)) {
          return category;
        }
      }
    }
    
    // Fall back to Google Places types
    const typeMap: { [key: string]: string } = {
      'restaurant': 'dining',
      'food': 'dining', 
      'meal_takeaway': 'dining',
      'meal_delivery': 'dining',
      'bar': 'dining',
      'cafe': 'dining',
      'bakery': 'dining',
      'coffee_shop': 'dining',
      'donut_shop': 'dining',
      'ice_cream_shop': 'dining',
      'gas_station': 'gas',
      'fuel': 'gas',
      'grocery_or_supermarket': 'groceries',
      'supermarket': 'groceries',
      'lodging': 'travel',
      'hotel': 'travel',
      'shopping_mall': 'shopping',
      'store': 'shopping',
      'hospital': 'services',
      'bank': 'services',
      'gym': 'fitness',
      'beauty_salon': 'beauty'
    };
    
    for (const type of types) {
      if (typeMap[type]) {
        return typeMap[type];
      }
    }
    
  // Default fallback: prefer dining to avoid mislabeled restaurants
  // Default to provided fallback (requested search category) or a neutral 'shopping'
  return fallbackCategory || 'shopping';
  }

  public async searchNearby(
    latitude: number,
    longitude: number,
    category: string = 'restaurant',
    radius: number = 2000
  ): Promise<PlaceSearchResult[]> {
    const cacheKey = `${latitude.toFixed(4)}-${longitude.toFixed(4)}-${category}-${radius}`;
    
    // Check cache first
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('Returning cached results for:', cacheKey);
      return cached.results;
    }

    const allResults: PlaceSearchResult[] = [];
    const seenPlaceIds = new Set<string>();
    
    try {
      // Multi-pass search strategy
      const categoryTypes = this.getCategoryTypes(category);
      
      // Pass 1: Type-based search with specific categories
      for (let i = 0; i < Math.min(categoryTypes.length, 3); i++) { // Limit to 3 types to avoid quota issues
        const placeType = categoryTypes[i];
        console.log(`Searching for type: ${placeType}`);
        
        const request = {
          fields: ["name", "geometry", "vicinity", "formatted_address", "rating", "price_level", "place_id", "types"],
          locationRestriction: {
            center: new window.google.maps.LatLng(latitude, longitude),
            radius: radius,
          },
          includedPrimaryTypes: [placeType],
          maxResultCount: 10,
          rankPreference: window.google.maps.places.SearchNearbyRankPreference.POPULARITY,
          language: "en-US",
          region: "us",
        };

        const response = await window.google.maps.places.Place.searchNearby(request);
        if (response && response.places) {
          const places = response.places as unknown as google.maps.places.PlaceResult[];
          
          for (const place of places) {
            if (place.place_id && !seenPlaceIds.has(place.place_id)) {
              seenPlaceIds.add(place.place_id);
              
              const lat = place.geometry?.location?.lat?.() ?? latitude;
              const lng = place.geometry?.location?.lng?.() ?? longitude;
              const detectedCategory = this.identifyBusinessCategory(place.name || '', place.types || [], category);
              
              allResults.push({
                id: place.place_id,
                name: place.name || 'Unknown Business',
                category: detectedCategory,
                address: place.formatted_address || place.vicinity || 'Address not available',
                latitude: lat,
                longitude: lng,
                rating: place.rating,
                price_level: place.price_level,
                place_id: place.place_id,
                distance: this.calculateDistance(latitude, longitude, lat, lng)
              });
            }
          }
        }
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Pass 2: Text search with natural language for better coverage
      if (allResults.length < 15) { // Only if we didn't get enough results
        console.log('Adding text search for better coverage');
        
        const textQueries = this.getTextSearchQueries(category);
        for (const query of textQueries) {
          try {
            const _textRequest = {
              fields: ["name", "geometry", "vicinity", "formatted_address", "rating", "price_level", "place_id", "types"],
              textQuery: `${query} near me`,
              locationBias: {
                center: new window.google.maps.LatLng(latitude, longitude),
                radius: radius,
              },
              maxResultCount: 5,
              language: "en-US",
              region: "us",
            };

            // Note: Text search requires different API - this is a placeholder for the structure
            // In practice, you might need to use the Text Search API differently
            // const textResponse = await window.google.maps.places.Place.searchByText(textRequest);
            
          } catch (textError) {
            console.warn('Text search failed:', textError);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Sort by distance and limit results
      allResults.sort((a, b) => a.distance - b.distance);
      const finalResults = allResults.slice(0, 20);
      
      // Cache results
      this.searchCache.set(cacheKey, {
        results: finalResults,
        timestamp: Date.now()
      });
      
      console.log(`Found ${finalResults.length} businesses for category: ${category}`);
      return finalResults;
      
    } catch (err) {
      console.warn('Enhanced place search error:', err);
      return [];
    }
  }

  private getTextSearchQueries(category: string): string[] {
    const queryMap: { [key: string]: string[] } = {
      'dining': ['restaurants', 'food', 'dining', 'cafes', 'bars'],
      'gas': ['gas stations', 'fuel', 'gas'],
      'groceries': ['grocery stores', 'supermarkets', 'food stores'],
      'travel': ['hotels', 'lodging', 'accommodations'],
      'shopping': ['stores', 'shopping', 'retail'],
      'entertainment': ['entertainment', 'movies', 'fun'],
      'services': ['services', 'business services'],
      'fitness': ['gyms', 'fitness', 'workout'],
      'beauty': ['beauty', 'salon', 'spa'],
      'automotive': ['auto', 'car services', 'automotive'],
      'education': ['schools', 'education', 'learning']
    };
    
    return queryMap[category] || ['businesses'];
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles (instead of 6371 km)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c * 5280; // Convert miles to feet for consistency with meters
  }

  // Enhanced method for production-safe nearby searches with fallback
  public async searchNearbyWithFallback(
    lat: number, 
    lng: number, 
    radius: number = 2000, 
    category?: string | null
  ): Promise<PlaceSearchResult[]> {
    console.log('Enhanced searchNearbyWithFallback called:', { lat, lng, radius, category });
    
    const searchCategory = category || 'dining';
    const cacheKey = `fallback-${lat.toFixed(4)}-${lng.toFixed(4)}-${radius}-${searchCategory}`;
    
    // Check cache first
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('Returning cached fallback results');
      return cached.results;
    }
    
    try {
      // First, try our server API (which may return use_client_places flag)
      const serverResponse = await fetch(`/api/location/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}&category=${searchCategory}`);
      const serverData = await serverResponse.json();
      
      // If server indicates to use client-side Places API
      if (serverData.use_client_places && serverData.client_api_available) {
        console.log('Server requested enhanced client-side Google Places fetch');
        
        // Use enhanced client-side Google Places with multi-pass search
        const clientPlaces = await this.searchNearby(lat, lng, searchCategory, radius);
        
        // Combine server results (database) with enhanced client Places
        const combinedResults = [
          ...serverData.businesses || [],
          ...clientPlaces
        ];
        
        // Advanced deduplication with distance consideration
        const uniqueResults = this.enhancedDeduplication(combinedResults);
        
        // Sort by distance and quality score
        const sortedResults = this.sortByRelevance(uniqueResults, lat, lng);
        
        console.log('Enhanced combined results:', {
          serverCount: serverData.businesses?.length || 0,
          clientCount: clientPlaces.length,
          finalCount: sortedResults.length,
          categories: this.categorizeResults(sortedResults)
        });
        
        // Cache the enhanced results
        this.searchCache.set(cacheKey, {
          results: sortedResults,
          timestamp: Date.now()
        });
        
        return sortedResults;
      }
      
      // Server provided complete results, enhance categorization
      const enhancedServerResults = this.enhanceServerResults(serverData.businesses || [], lat, lng);
      
      // Cache server results too
      this.searchCache.set(cacheKey, {
        results: enhancedServerResults,
        timestamp: Date.now()
      });
      
      return enhancedServerResults;
      
    } catch (error) {
      console.error('Error in enhanced searchNearbyWithFallback:', error);
      
      // Last resort: try enhanced direct client-side Google Places
      try {
        const fallbackResults = await this.searchNearby(lat, lng, searchCategory, radius);
        
        // Cache fallback results
        this.searchCache.set(cacheKey, {
          results: fallbackResults,
          timestamp: Date.now()
        });
        
        return fallbackResults;
      } catch (clientError) {
        console.error('Enhanced client-side fallback also failed:', clientError);
        return [];
      }
    }
  }

  // Enhanced deduplication that considers distance and similarity
  private enhancedDeduplication(results: PlaceSearchResult[]): PlaceSearchResult[] {
    const seen = new Map<string, PlaceSearchResult>();
    const unique: PlaceSearchResult[] = [];
    
    // Sort by rating and distance for better deduplication
    const sortedResults = [...results].sort((a, b) => {
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      if (ratingA !== ratingB) return ratingB - ratingA; // Higher rating first
      return a.distance - b.distance; // Closer first
    });
    
    for (const result of sortedResults) {
      // Create multiple keys for deduplication
      const placeIdKey = result.place_id;
      const coordKey = `${result.latitude?.toFixed(5)},${result.longitude?.toFixed(5)}`;
      const nameKey = result.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      let isDuplicate = false;
      
      // Check if we've seen this place before
      if (placeIdKey && seen.has(`pid_${placeIdKey}`)) {
        isDuplicate = true;
      } else if (seen.has(`coord_${coordKey}`)) {
        isDuplicate = true;
      } else if (nameKey && seen.has(`name_${nameKey}`)) {
        // Additional check: if same name and very close coordinates (within 100ft)
        const existingPlace = seen.get(`name_${nameKey}`);
        if (existingPlace && this.calculateDistance(
          result.latitude, result.longitude,
          existingPlace.latitude, existingPlace.longitude
        ) < 100) {
          isDuplicate = true;
        }
      }
      
      if (!isDuplicate) {
        // Add to seen sets
        if (placeIdKey) seen.set(`pid_${placeIdKey}`, result);
        seen.set(`coord_${coordKey}`, result);
        if (nameKey) seen.set(`name_${nameKey}`, result);
        
        unique.push(result);
      }
    }
    
    return unique;
  }

  // Sort results by relevance (distance, rating, popularity)
  private sortByRelevance(results: PlaceSearchResult[], lat: number, lng: number): PlaceSearchResult[] {
    return results.sort((a, b) => {
      // Calculate relevance score
      const scoreA = this.calculateRelevanceScore(a, lat, lng);
      const scoreB = this.calculateRelevanceScore(b, lat, lng);
      
      return scoreB - scoreA; // Higher score first
    });
  }

  // Calculate relevance score based on multiple factors
  private calculateRelevanceScore(place: PlaceSearchResult, _userLat: number, _userLng: number): number {
    let score = 0;
    
    // Distance factor (closer is better, max 1000 points)
    const maxDistance = 5000; // 5000 feet
    const distanceScore = Math.max(0, (maxDistance - place.distance) / maxDistance) * 1000;
    score += distanceScore;
    
    // Rating factor (higher rating is better, max 500 points)
    if (place.rating) {
      score += (place.rating / 5) * 500;
    }
    
    // Price level factor (mid-range gets slight boost, max 100 points)
    if (place.price_level) {
      const priceBoost = place.price_level === 2 ? 100 : // Mid-range
                        place.price_level === 1 ? 80 :   // Budget
                        place.price_level === 3 ? 60 :   // Expensive  
                        place.price_level === 4 ? 40 : 0; // Very expensive
      score += priceBoost;
    }
    
    // Brand recognition bonus (major chains get small boost)
    const brandPatterns = this.getBrandPatterns();
    const nameLower = place.name?.toLowerCase() || '';
    
    for (const { brands } of Object.values(brandPatterns)) {
      for (const brand of brands) {
        if (nameLower.includes(brand)) {
          score += 50; // Small brand recognition bonus
          break;
        }
      }
    }
    
    return score;
  }

  // Enhance server results with better categorization
  private enhanceServerResults(serverResults: PlaceSearchResult[], lat: number, lng: number): PlaceSearchResult[] {
    return serverResults.map(result => ({
      ...result,
      category: this.identifyBusinessCategory(result.name || '', []), // Re-categorize
      distance: this.calculateDistance(lat, lng, result.latitude, result.longitude) // Recalculate distance
    })).sort((a, b) => a.distance - b.distance);
  }

  // Categorize results for analytics
  private categorizeResults(results: PlaceSearchResult[]): { [key: string]: number } {
    const categories: { [key: string]: number } = {};
    
    for (const result of results) {
      categories[result.category] = (categories[result.category] || 0) + 1;
    }
    
    return categories;
  }

  // Helper to remove duplicate results (legacy method, kept for compatibility)
  private deduplicateResults(results: PlaceSearchResult[]): PlaceSearchResult[] {
    return this.enhancedDeduplication(results);
  }
}

// Singleton instance
let placesService: ClientPlacesService | null = null;

export function getClientPlacesService(): ClientPlacesService {
  if (!placesService) {
    placesService = new ClientPlacesService();
  }
  return placesService;
}
