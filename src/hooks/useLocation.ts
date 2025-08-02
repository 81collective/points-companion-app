'use client';

import { useState, useCallback } from 'react';
import { Location, LocationPermissionState } from '@/types/location.types';

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [permissionState, setPermissionState] = useState<LocationPermissionState>({
    granted: false,
    denied: false,
    loading: false,
    error: undefined
  });

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setPermissionState({
        granted: false,
        denied: true,
        loading: false,
        error: 'Geolocation is not supported by this browser'
      });
      return;
    }

    setPermissionState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      // Check if permission is already granted
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        setPermissionState({
          granted: false,
          denied: true,
          loading: false,
          error: 'Location permission denied'
        });
        return;
      }

      // Request current position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };

          // Try to get address from coordinates
          try {
            const address = await reverseGeocode(newLocation.latitude, newLocation.longitude);
            newLocation.address = address;
          } catch (error) {
            console.warn('Failed to get address:', error);
          }

          setLocation(newLocation);
          setPermissionState({
            granted: true,
            denied: false,
            loading: false,
            error: undefined
          });
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timeout';
              break;
          }

          setPermissionState({
            granted: false,
            denied: error.code === error.PERMISSION_DENIED,
            loading: false,
            error: errorMessage
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        }
      );
    } catch {
      setPermissionState({
        granted: false,
        denied: false,
        loading: false,
        error: 'Failed to request location permission'
      });
    }
  }, []);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation || !permissionState.granted) {
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        // Try to get address from coordinates
        try {
          const address = await reverseGeocode(newLocation.latitude, newLocation.longitude);
          newLocation.address = address;
        } catch (error) {
          console.warn('Failed to get address:', error);
        }

        setLocation(newLocation);
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [permissionState.granted]);

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }, []);

  return {
    location,
    permissionState,
    requestLocation,
    watchLocation,
    calculateDistance,
    clearLocation: () => setLocation(null)
  };
}

// Helper function for reverse geocoding
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    
    throw new Error('No address found');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
}
