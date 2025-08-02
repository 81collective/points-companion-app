// Global type declarations for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }

  namespace google {
    namespace maps {
      class Map {
        constructor(mapDiv: Element | null, opts?: MapOptions);
      }

      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }

      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      namespace places {
        class PlacesService {
          constructor(attrContainer: Map | HTMLDivElement);
          nearbySearch(
            request: PlaceSearchRequest,
            callback: (
              results: PlaceResult[] | null,
              status: PlacesServiceStatus
            ) => void
          ): void;
        }

        interface PlaceSearchRequest {
          location?: LatLng | LatLngLiteral;
          radius?: number;
          type?: string;
          keyword?: string;
        }

        interface PlaceResult {
          place_id?: string;
          name?: string;
          vicinity?: string;
          formatted_address?: string;
          geometry?: {
            location?: LatLng;
          };
          rating?: number;
          price_level?: number;
        }

        enum PlacesServiceStatus {
          OK = 'OK',
          ZERO_RESULTS = 'ZERO_RESULTS',
          OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
          REQUEST_DENIED = 'REQUEST_DENIED',
          INVALID_REQUEST = 'INVALID_REQUEST',
          NOT_FOUND = 'NOT_FOUND',
          UNKNOWN_ERROR = 'UNKNOWN_ERROR'
        }
      }
    }
  }
}

export {};
