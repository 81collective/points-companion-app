'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Star, Navigation, Grid, Map, Loader2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import LocationPermission from '@/components/location/LocationPermission';
import BusinessMap from '@/components/maps/BusinessMap';
import { fetchNearbyBusinesses as fetchNearbyBusinessesFromApi } from '@/services/locationService';
import { Business } from '@/types/location.types';

interface NearbyBusinessesProps {
  initialCategory?: string;
  className?: string;
}

export default function NearbyBusinesses({ initialCategory = 'dining', className = "" }: NearbyBusinessesProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(2000); // 2km default
  
  const { location, permissionState } = useLocation();

  const categories = [
    { key: 'dining', label: 'Dining', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
    { key: 'groceries', label: 'Groceries', icon: '🛒', color: 'bg-green-100 text-green-800' },
    { key: 'gas', label: 'Gas', icon: '⛽', color: 'bg-red-100 text-red-800' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', color: 'bg-purple-100 text-purple-800' },
    { key: 'travel', label: 'Travel', icon: '✈️', color: 'bg-blue-100 text-blue-800' },
    { key: 'hotels', label: 'Hotels', icon: '🏨', color: 'bg-pink-100 text-pink-800' }
  ];

  const fetchNearbyBusinesses = useCallback(async () => {
    if (!location) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchNearbyBusinessesFromApi(
        location.latitude,
        location.longitude,
        selectedCategory,
        radius
      );
      
      if (result.success) {
        setBusinesses(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch businesses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [location, selectedCategory, radius]);

  // Fetch businesses when location or filters change
  useEffect(() => {
    if (location && permissionState.granted) {
      fetchNearbyBusinesses();
    }
  }, [location, permissionState.granted, fetchNearbyBusinesses]);

  const handleLocationGranted = () => {
    // Location will be handled by useLocation hook
  };

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
  };

  const currentCategory = categories.find(c => c.key === selectedCategory);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nearby Businesses</h2>
          <p className="text-gray-600">
            Discover local businesses in your area and optimize your rewards
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Location Permission Check */}
      {!permissionState.granted && (
        <div className="max-w-md mx-auto">
          <LocationPermission onLocationGranted={handleLocationGranted} />
        </div>
      )}

      {permissionState.granted && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.key
                        ? category.color
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Radius Filter */}
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Radius
              </label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={500}>500m</option>
                <option value={1000}>1km</option>
                <option value={2000}>2km</option>
                <option value={5000}>5km</option>
                <option value={10000}>10km</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Content */}
          {viewMode === 'list' ? (
            <div className="space-y-4">
              {/* Location Status */}
              <LocationPermission showInline onLocationGranted={handleLocationGranted} />

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Finding nearby businesses...</span>
                </div>
              )}

              {/* Business List */}
              {!loading && businesses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businesses.map((business, index) => (
                    <div
                      key={business.id || index}
                      onClick={() => handleBusinessSelect(business)}
                      className={`bg-white rounded-xl p-4 border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                        selectedBusiness?.id === business.id
                          ? 'border-blue-500 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{business.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{business.address}</p>
                        </div>
                        {currentCategory && (
                          <div className={`px-2 py-1 rounded-md text-xs font-medium ${currentCategory.color}`}>
                            {currentCategory.icon}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                          {business.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-gray-600">{business.rating}</span>
                            </div>
                          )}
                          {business.distance && (
                            <div className="flex items-center space-x-1 text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {business.distance < 1000 
                                  ? `${Math.round(business.distance)}m`
                                  : `${(business.distance / 1000).toFixed(1)}km`
                                }
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Navigation className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && businesses.length === 0 && !error && (
                <div className="text-center py-12">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                  <p className="text-gray-600">
                    Try expanding your search radius or selecting a different category.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Map View
            <div className="h-96 lg:h-[500px]">
              <BusinessMap
                businesses={businesses}
                userLocation={location ? { lat: location.latitude, lng: location.longitude } : undefined}
                onBusinessSelect={handleBusinessSelect}
                className="h-full"
              />
            </div>
          )}

          {/* Selected Business Details */}
          {selectedBusiness && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Business</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-900">{selectedBusiness.name}</p>
                  <p className="text-sm text-gray-600">{selectedBusiness.address}</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  {selectedBusiness.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{selectedBusiness.rating}</span>
                    </div>
                  )}
                  {selectedBusiness.distance && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>
                        {selectedBusiness.distance < 1000 
                          ? `${Math.round(selectedBusiness.distance)}m away`
                          : `${(selectedBusiness.distance / 1000).toFixed(1)}km away`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
