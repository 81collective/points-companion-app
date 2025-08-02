'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Navigation, Grid, Map, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyBusinesses } from '@/hooks/useNearbyBusinesses';
import { useCardRecommendations } from '@/hooks/useCardRecommendations';
import LocationPermission from '@/components/location/LocationPermission';
import BusinessListSkeleton from '@/components/common/BusinessListSkeleton';
import { Business } from '@/types/location.types';

const BusinessMap = dynamic(() => import('@/components/maps/BusinessMap'), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading map...</span>
    </div>
  ),
  ssr: false,
});

interface NearbyBusinessesProps {
  initialCategory?: string;
  className?: string;
}

export default function NearbyBusinesses({ initialCategory = 'dining', className = "" }: NearbyBusinessesProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [radius, setRadius] = useState(3218); // 2 miles default
  
  // Debounce radius to prevent excessive API calls
  const [debouncedRadius] = useDebounce(radius, 300);
  
  const { location, permissionState } = useLocation();
  
  // Use React Query hook for data fetching
  const { businesses, loading, error } = useNearbyBusinesses({
    latitude: location?.latitude,
    longitude: location?.longitude,
    category: selectedCategory,
    radius: debouncedRadius,
    enabled: permissionState.granted && !!location
  });

  // Get credit card recommendations for selected business
  const { recommendations, loading: recommendationsLoading } = useCardRecommendations({
    category: selectedBusiness?.category || selectedCategory,
    latitude: location?.latitude,
    longitude: location?.longitude,
    enabled: !!selectedBusiness && permissionState.granted && !!location
  });

  // Add real-time effect when business is selected
  useEffect(() => {
    if (selectedBusiness) {
      console.log('🎯 Selected business for recommendations:', {
        name: selectedBusiness.name,
        category: selectedBusiness.category,
        location: `${location?.latitude}, ${location?.longitude}`
      });
    }
  }, [selectedBusiness, location]);

  const categories = [
    { key: 'dining', label: 'Dining', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
    { key: 'groceries', label: 'Groceries', icon: '🛒', color: 'bg-green-100 text-green-800' },
    { key: 'gas', label: 'Gas', icon: '⛽', color: 'bg-red-100 text-red-800' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', color: 'bg-purple-100 text-purple-800' },
    { key: 'travel', label: 'Travel', icon: '✈️', color: 'bg-blue-100 text-blue-800' },
    { key: 'hotels', label: 'Hotels', icon: '🏨', color: 'bg-pink-100 text-pink-800' }
  ];

  const handleLocationGranted = () => {
    // Location will be handled by useLocation hook
  };

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
  };

  const currentCategory = categories.find(c => c.key === selectedCategory);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Modern Header with Gradient */}
      <div className="relative">
        <div className="card-gradient p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-display text-4xl font-extrabold text-white mb-3">
                Nearby Businesses
              </h2>
              <p className="text-lg text-white/90 font-medium">
                Discover local businesses and maximize your rewards
              </p>
            </div>
            
            {/* Premium View Toggle */}
            <div className="glass-card p-2 flex items-center space-x-1" role="tablist" aria-label="View mode selection">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary-600 shadow-md' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                role="tab"
                aria-selected={viewMode === 'list'}
              >
                <Grid className="h-4 w-4" />
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'map' 
                    ? 'bg-white text-primary-600 shadow-md' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
                role="tab"
                aria-selected={viewMode === 'map'}
              >
                <Map className="h-4 w-4" />
                Map View
              </button>
            </div>
          </div>
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
                aria-label="Select search radius"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={805}>0.5 miles</option>
                <option value={1609}>1 mile</option>
                <option value={3218}>2 miles</option>
                <option value={8047}>5 miles</option>
                <option value={16093}>10 miles</option>
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
              {loading && <BusinessListSkeleton />}

              {/* Business List */}
              {!loading && businesses.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <AnimatePresence>
                    {businesses.map((business, index) => (
                      <motion.div
                        key={business.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        onClick={() => handleBusinessSelect(business)}
                        whileHover={{ y: -2, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className={`bg-white rounded-xl p-4 border-2 transition-all duration-200 cursor-pointer ${
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
                                {business.distance < 1609.34 
                                  ? `${Math.round(business.distance * 3.28084)}ft`
                                  : `${(business.distance * 0.000621371).toFixed(1)}mi`
                                }
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Navigation className="h-4 w-4 text-gray-400" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}              {/* Empty State */}
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
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-4">Selected Business</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Business Details */}
                <div>
                  <p className="font-medium text-gray-900 mb-1">{selectedBusiness.name}</p>
                  <p className="text-sm text-gray-600 mb-3">{selectedBusiness.address}</p>
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
                          {selectedBusiness.distance < 1609.34 
                            ? `${Math.round(selectedBusiness.distance * 3.28084)}ft away`
                            : `${(selectedBusiness.distance * 0.000621371).toFixed(1)}mi away`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Credit Card Recommendations */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border-2 border-emerald-200">
                  <div className="flex items-center mb-3">
                    <div className="p-1 bg-emerald-500 rounded-lg mr-2">
                      <span className="text-white text-sm">💳</span>
                    </div>
                    <h5 className="font-semibold text-emerald-900">Best Credit Cards for {selectedBusiness.name}</h5>
                  </div>
                  {recommendationsLoading ? (
                    <div className="flex items-center space-x-2 text-sm text-emerald-600 bg-white rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Finding optimal cards...</span>
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-emerald-200 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{rec.card.card_name}</span>
                            <div className="flex items-center space-x-2">
                              {index === 0 && (
                                <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full font-medium">
                                  BEST
                                </span>
                              )}
                              <span className="text-sm bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                                {rec.annual_value > 0 ? `$${rec.annual_value.toFixed(0)}/year` : `${rec.match_score}% match`}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.reasons?.join(', ') || 'Great rewards for this category'}</p>
                          {rec.estimated_points && (
                            <div className="text-xs text-emerald-700">
                              Estimated: {rec.estimated_points} points per $100 spent
                            </div>
                          )}
                        </div>
                      ))}
                      {recommendations.length > 3 && (
                        <div className="text-center">
                          <span className="text-sm text-emerald-600">+ {recommendations.length - 3} more card options</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-3 border border-emerald-200">
                      <p className="text-sm text-gray-500">No specific recommendations available for this category</p>
                      <p className="text-xs text-gray-400 mt-1">Try selecting a different business type</p>
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
