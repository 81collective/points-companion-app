'use client';

import React from 'react';
import { MapPin, Shield, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';

interface LocationPermissionProps {
  onLocationGranted?: (location: { latitude: number; longitude: number }) => void;
  showInline?: boolean;
  className?: string;
}

export default function LocationPermission({ 
  onLocationGranted, 
  showInline = false,
  className = ""
}: LocationPermissionProps) {
  const { location, permissionState, requestLocation } = useLocation();

  React.useEffect(() => {
    if (location && permissionState.granted && onLocationGranted) {
      onLocationGranted({
        latitude: location.latitude,
        longitude: location.longitude
      });
    }
  }, [location, permissionState.granted, onLocationGranted]);

  if (permissionState.granted && location) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-emerald-600 ${className}`}>
        <CheckCircle className="h-4 w-4" />
        <span>Location enabled</span>
        {location.address && (
          <span className="text-gray-500">• {location.address.split(',')[0]}</span>
        )}
      </div>
    );
  }

  if (permissionState.denied) {
    return (
      <div className={`${showInline ? 'inline-flex' : 'flex flex-col'} ${className}`}>
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <X className="h-4 w-4" />
          <span>Location access denied</span>
        </div>
        {!showInline && (
          <p className="text-xs text-gray-500 mt-1">
            Please enable location access in your browser settings to find nearby businesses.
          </p>
        )}
      </div>
    );
  }

  if (showInline) {
    return (
      <button
        onClick={requestLocation}
        disabled={permissionState.loading}
        className={`inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors ${className}`}
      >
        {permissionState.loading ? (
          <>
            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Getting location...</span>
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4" />
            <span>Enable Location</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 ${className}`}>
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-blue-600" />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Enable Location Access
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Allow location access to find nearby businesses and get personalized card recommendations based on where you shop.
        </p>

        {permissionState.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{permissionState.error}</p>
          </div>
        )}

        <button
          onClick={requestLocation}
          disabled={permissionState.loading}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors"
        >
          {permissionState.loading ? (
            <>
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Getting Location...</span>
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              <span>Allow Location Access</span>
            </>
          )}
        </button>

        <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Your location data is never stored or shared</span>
        </div>
      </div>
    </div>
  );
}
