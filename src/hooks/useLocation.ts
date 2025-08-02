'use client';

import { useCallback, useEffect } from 'react';
import { useLocationStore } from '@/stores/useLocationStore';
import { Location } from '@/types/location.types';

export function useLocation() {
  const { 
    location, 
    permissionState, 
    loading, 
    error,
    setLocation, 
    setPermissionState 
  } = useLocationStore();

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setPermissionState({
        granted: false,
        denied: true,
      });
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        setPermissionState({ granted: false, denied: true });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          setLocation(newLocation);
          setPermissionState({ granted: true, denied: false });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setPermissionState({ granted: false, denied: true });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setPermissionState({ granted: false, denied: true });
    }
  }, [setLocation, setPermissionState]);

  useEffect(() => {
    const handlePermissionChange = (permissionStatus: PermissionStatus) => {
      if (permissionStatus.state === 'granted') {
        requestLocation();
      } else {
        setLocation(null);
        setPermissionState({ granted: false, denied: permissionStatus.state === 'denied' });
      }
    };

    navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
      if (permissionStatus.state === 'granted') {
        requestLocation();
      }
      permissionStatus.onchange = () => handlePermissionChange(permissionStatus);
    });

    return () => {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        permissionStatus.onchange = null;
      });
    };
  }, [requestLocation, setLocation, setPermissionState]);

  const clearLocation = useCallback(() => setLocation(null), [setLocation]);

  return { location, permissionState, loading, error, requestLocation, clearLocation };
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
