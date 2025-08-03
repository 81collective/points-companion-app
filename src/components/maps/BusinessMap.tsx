'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { Business } from '@/types/location.types';

interface BusinessMapProps {
  businesses: Business[];
  center?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number };
  onBusinessSelect?: (business: Business) => void;
  className?: string;
}

export default function BusinessMap({ 
  businesses, 
  center, 
  userLocation, 
  onBusinessSelect, 
  className = "" 
}: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [, setMarkers] = useState<google.maps.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places', 'marker']
        });

        await loader.load();

        if (!mapRef.current) return;

        const mapCenter = center || userLocation || { lat: 40.7128, lng: -74.0060 }; // Default to NYC

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 14,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        setMap(mapInstance);
        setLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map');
        setLoading(false);
      }
    };

    initMap();
  }, [center, userLocation]);

  // Update markers when businesses change
  useEffect(() => {
    if (!map) return;

    // Clear existing markers using setState pattern to avoid dependency
    setMarkers(prevMarkers => {
      prevMarkers.forEach(marker => marker.setMap(null));
      return [];
    });

    const newMarkers: google.maps.Marker[] = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });
      newMarkers.push(userMarker);
    }

    // Add business markers
    businesses.forEach((business) => {
      if (!business.latitude || !business.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: business.latitude, lng: business.longitude },
        map: map,
        title: business.name,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: getCategoryColor(business.category),
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 1,
          rotation: 0,
        },
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-semibold text-gray-900 mb-1">${business.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${business.address}</p>
            ${business.rating ? `
              <div class="flex items-center space-x-1 mb-2">
                <span class="text-yellow-400">★</span>
                <span class="text-sm text-gray-600">${business.rating}</span>
              </div>
            ` : ''}
            ${business.distance ? `
              <p class="text-xs text-gray-500">
                ${business.distance < 1609.34 
                  ? `${Math.round(business.distance * 3.28084)}ft away`
                  : `${(business.distance * 0.000621371).toFixed(1)}mi away`
                }
              </p>
            ` : ''}
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onBusinessSelect?.(business);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Adjust map bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() && map.getZoom()! > 16) {
          map.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, businesses, userLocation, onBusinessSelect]); // markers dependency not needed as it's managed internally

  const getCategoryColor = (category?: string): string => {
    const colors: Record<string, string> = {
      dining: '#F59E0B',
      groceries: '#10B981',
      gas: '#EF4444',
      shopping: '#8B5CF6',
      travel: '#06B6D4',
      hotels: '#EC4899',
      default: '#6B7280'
    };
    return colors[category || 'default'] || colors.default;
  };

  const recenterMap = () => {
    if (!map) return;
    
    const center = userLocation || { lat: 40.7128, lng: -74.0060 };
    map.setCenter(center);
    map.setZoom(14);
  };

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-xl p-8 text-center ${className}`}>
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Map Unavailable</h3>
        <p className="text-gray-600">Unable to load Google Maps. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        className="w-full h-full min-h-[400px] rounded-xl"
        style={{ opacity: loading ? 0 : 1 }}
      />
      
      {/* Map Controls */}
      {!loading && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={recenterMap}
            className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            title="Recenter map"
          >
            <Navigation className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )}

      {/* Legend */}
      {!loading && businesses.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md border border-gray-200 z-10">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
          <div className="space-y-1">
            {userLocation && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Your Location</span>
              </div>
            )}
            {Array.from(new Set(businesses.map(b => b.category).filter(Boolean))).map(category => (
              <div key={category} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getCategoryColor(category) }}
                ></div>
                <span className="text-xs text-gray-600 capitalize">{category}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
