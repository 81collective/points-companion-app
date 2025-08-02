// Client-side Google Places service that respects referer restrictions
import { Business } from '@/types/location.types';

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
  private service: google.maps.places.PlacesService | null = null;

  constructor() {
    // Initialize once Google Maps is loaded
    if (typeof window !== 'undefined' && window.google) {
      this.initializeService();
    }
  }

  private initializeService() {
    // Create a hidden map element for the Places service
    const mapElement = document.createElement('div');
    mapElement.style.display = 'none';
    document.body.appendChild(mapElement);

    this.map = new google.maps.Map(mapElement, {
      center: { lat: 0, lng: 0 },
      zoom: 10
    });

    this.service = new google.maps.places.PlacesService(this.map);
  }

  public async searchNearby(
    latitude: number,
    longitude: number,
    category: string = 'restaurant',
    radius: number = 2000
  ): Promise<PlaceSearchResult[]> {
    return new Promise((resolve, reject) => {
      if (!this.service) {
        // Try to initialize if not already done
        if (window.google) {
          this.initializeService();
        } else {
          reject(new Error('Google Maps not loaded'));
          return;
        }
      }

      const categoryMap: { [key: string]: string } = {
        'dining': 'restaurant',
        'groceries': 'grocery_or_supermarket',
        'gas': 'gas_station',
        'shopping': 'shopping_mall',
        'electronics': 'electronics_store',
        'hotels': 'lodging',
        'travel': 'travel_agency'
      };

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(latitude, longitude),
        radius: radius,
        type: categoryMap[category] || 'establishment'
      };

      this.service!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const businesses = results.map((place, index) => ({
            id: place.place_id || `place_${index}`,
            name: place.name || 'Unknown Business',
            category: category,
            address: place.vicinity || place.formatted_address || 'Address not available',
            latitude: place.geometry?.location?.lat() || latitude,
            longitude: place.geometry?.location?.lng() || longitude,
            rating: place.rating,
            price_level: place.price_level,
            place_id: place.place_id,
            distance: this.calculateDistance(
              latitude,
              longitude,
              place.geometry?.location?.lat() || latitude,
              place.geometry?.location?.lng() || longitude
            )
          }));

          resolve(businesses);
        } else {
          console.warn('Places service failed:', status);
          resolve([]); // Return empty array instead of rejecting
        }
      });
    });
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
}

// Singleton instance
let placesService: ClientPlacesService | null = null;

export function getClientPlacesService(): ClientPlacesService {
  if (!placesService) {
    placesService = new ClientPlacesService();
  }
  return placesService;
}
