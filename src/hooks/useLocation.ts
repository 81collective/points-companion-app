'use client';

import { useCallback, useEffect } from 'react';
import { useLocationStore } from '@/stores/useLocationStore';
import { Location } from '@/types/location.types';
import { clientLogger } from '@/lib/clientLogger';

const log = clientLogger.child({ component: 'useLocation' });

export function useLocation() {
  const { 
    location, 
    permissionState, 
    loading, 
    error,
    setLocation, 
    setPermissionState,
    setLoading,
    setError,
  } = useLocationStore();

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!('geolocation' in navigator)) {
      setPermissionState({ granted: false, denied: true });
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    // Geolocation requires HTTPS (or localhost/127.0.0.1). Guard against insecure origins.
    try {
      const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
      const isSecure = typeof window !== 'undefined' && (window.isSecureContext || isLocalhost);
      if (!isSecure) {
        setPermissionState({ granted: false, denied: true });
        setError('Location requires HTTPS or localhost. Please use https:// or run locally.');
        setLoading(false);
        return;
      }
    } catch {
      // Ignore environment edge cases
    }

    try {
      const hasPermissionsApi = typeof navigator !== 'undefined' && 'permissions' in navigator && typeof navigator.permissions?.query === 'function';
      if (hasPermissionsApi) {
        try {
          const permission = await navigator.permissions!.query({ name: 'geolocation' as PermissionName });
          if (permission.state === 'denied') {
            // Still attempt the geolocation call to surface a clear error callback
            setPermissionState({ granted: false, denied: true });
            setError('Location permission is denied in your browser settings.');
          }
        } catch (permErr: unknown) {
          // Ignore permission API errors; we'll proceed to geolocation call
          log.warn('Permissions API not available or failed', { error: permErr });
        }
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };
          setLocation(newLocation);
          setPermissionState({ granted: true, denied: false });
          setLoading(false);
        },
        (geoError) => {
          // Build a human-friendly error message using code/message
          let message = 'Unable to retrieve your location.';
          const anyErr = geoError as Partial<GeolocationPositionError> & { message?: string };
          if (typeof anyErr?.message === 'string' && anyErr.message.trim().length > 0) {
            message = anyErr.message;
          } else if (typeof anyErr?.code === 'number') {
            switch (anyErr.code) {
              case 1:
                message = 'Permission denied. Please allow location access in your browser settings.';
                break;
              case 2:
                message = 'Position unavailable. Try moving to an area with better signal or check your device settings.';
                break;
              case 3:
                message = 'Location request timed out. Please try again.';
                break;
            }
          }
          log.error('Geolocation error', { code: anyErr.code, message });
          setPermissionState({ granted: false, denied: true });
          setError(message);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (err: unknown) {
      log.error('Error requesting location permission', { error: err });
      setPermissionState({ granted: false, denied: true });
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }, [setLocation, setPermissionState, setLoading, setError]);

  useEffect(() => {
  const hasPermissionsApi = typeof navigator !== 'undefined' && 'permissions' in navigator && typeof navigator.permissions?.query === 'function';
    if (!hasPermissionsApi) return;

    const handlePermissionChange = (permissionStatus: PermissionStatus) => {
      if (permissionStatus.state === 'granted') {
        requestLocation();
      } else {
        setLocation(null);
        setPermissionState({ granted: false, denied: permissionStatus.state === 'denied' });
      }
    };

    navigator.permissions!
      .query({ name: 'geolocation' as PermissionName })
      .then((permissionStatus: PermissionStatus) => {
        if (permissionStatus.state === 'granted') {
          requestLocation();
        }
        permissionStatus.onchange = () => handlePermissionChange(permissionStatus);
      })
      .catch((e: unknown) => {
        log.warn('Permissions API query failed', { error: e });
      });

    return () => {
      navigator.permissions
        ?.query({ name: 'geolocation' as PermissionName })
        .then((permissionStatus: PermissionStatus) => {
          permissionStatus.onchange = null;
        })
        .catch(() => {});
    };
  }, [requestLocation, setLocation, setPermissionState]);

  const clearLocation = useCallback(() => setLocation(null), [setLocation]);

  return { location, permissionState, loading, error, requestLocation, clearLocation };
}
