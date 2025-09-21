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

  constructor() {
    // Initialize once Google Maps is loaded
    if (typeof window !== 'undefined' && window.google) {
    }
  }

  // No longer needed: PlaceClass initialization

  public async searchNearby(
    latitude: number,
    longitude: number,
    category: string = 'restaurant',
    radius: number = 2000
  ): Promise<PlaceSearchResult[]> {
    const categoryMap: { [key: string]: string } = {
      'dining': 'restaurant',
      'groceries': 'grocery_or_supermarket',
      'gas': 'gas_station',
      'shopping': 'shopping_mall',
      'electronics': 'electronics_store',
      'hotels': 'lodging',
      'travel': 'travel_agency'
    };

    const request = {
      // Use standard Places API fields
      fields: ["name", "geometry", "vicinity", "formatted_address", "rating", "price_level", "place_id"],
      locationRestriction: {
        center: new window.google.maps.LatLng(latitude, longitude),
        radius: radius,
      },
      includedPrimaryTypes: [categoryMap[category] || 'establishment'],
      maxResultCount: 20,
      rankPreference: window.google.maps.places.SearchNearbyRankPreference.POPULARITY,
      language: "en-US",
      region: "us",
    };

    try {
      const response = await window.google.maps.places.Place.searchNearby(request);
      if (response && response.places) {
        const places = response.places as unknown as google.maps.places.PlaceResult[];
        return places.map((place, index: number) => {
          const lat = place.geometry?.location?.lat?.() ?? latitude;
          const lng = place.geometry?.location?.lng?.() ?? longitude;
          return {
            id: place.place_id || `place_${index}`,
            name: place.name || 'Unknown Business',
            category: category,
            address: place.formatted_address || place.vicinity || 'Address not available',
            latitude: lat,
            longitude: lng,
            rating: place.rating,
            price_level: place.price_level,
            place_id: place.place_id,
            distance: this.calculateDistance(latitude, longitude, lat, lng)
          };
        });
      } else {
        console.warn('Place API search failed:', response);
        return [];
      }
    } catch (err) {
      console.warn('Place API error:', err);
      return [];
    }
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
    console.log('searchNearbyWithFallback called:', { lat, lng, radius, category });
    
    try {
      // First, try our server API (which may return use_client_places flag)
      const serverResponse = await fetch(`/api/location/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}&category=${category || 'all'}`);
      const serverData = await serverResponse.json();
      
      // If server indicates to use client-side Places API
      if (serverData.use_client_places && serverData.client_api_available) {
        console.log('Server requested client-side Google Places fetch');
        
        // Use client-side Google Places as fallback
        const clientPlaces = await this.searchNearby(lat, lng, category || 'restaurant', radius);
        
        // Combine server results (database) with client Places
        const combinedResults = [
          ...serverData.businesses || [],
          ...clientPlaces
        ];
        
        // Remove duplicates by place_id or coordinates
        const uniqueResults = this.deduplicateResults(combinedResults);
        
        console.log('Combined results:', {
          serverCount: serverData.businesses?.length || 0,
          clientCount: clientPlaces.length,
          finalCount: uniqueResults.length
        });
        
        return uniqueResults;
      }
      
      // Server provided complete results, return them
      return serverData.businesses || [];
      
    } catch (error) {
      console.error('Error in searchNearbyWithFallback:', error);
      
      // Last resort: try direct client-side Google Places
      try {
        return await this.searchNearby(lat, lng, category || 'restaurant', radius);
      } catch (clientError) {
        console.error('Client-side fallback also failed:', clientError);
        return [];
      }
    }
  }

  // Helper to remove duplicate results
  private deduplicateResults(results: PlaceSearchResult[]): PlaceSearchResult[] {
    const seen = new Set<string>();
    const unique: PlaceSearchResult[] = [];
    
    for (const result of results) {
      // Create unique key from place_id or coordinates
      const key = result.place_id || `${result.latitude?.toFixed(6)},${result.longitude?.toFixed(6)}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }
    
    return unique;
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
