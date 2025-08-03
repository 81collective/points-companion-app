'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, Navigation, Grid, Map, Loader2, CreditCard } from 'lucide-react';
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
    category: selectedCategory, // Use selected category instead of business category for consistency
    latitude: location?.latitude,
    longitude: location?.longitude,
    businessId: selectedBusiness?.id,
    businessName: selectedBusiness?.name,
    enabled: !!selectedBusiness && permissionState.granted && !!location
  });

  // Add real-time effect when business is selected
  useEffect(() => {
    if (selectedBusiness) {
      console.log('🎯 Selected business for recommendations:', {
        id: selectedBusiness.id,
        name: selectedBusiness.name,
        category: selectedBusiness.category,
        location: `${location?.latitude}, ${location?.longitude}`,
        fullBusiness: selectedBusiness
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
    console.log('🏢 Business selected - BEFORE setSelectedBusiness:', {
      businessName: business.name,
      businessId: business.id,
      businessCategory: business.category,
      selectedCategory: selectedCategory,
      willUseCategory: selectedCategory
    });
    setSelectedBusiness(business);
    console.log('🏢 Business selected - AFTER setSelectedBusiness');
  };

  // Test function to verify click handling works
  const testClick = () => {
    console.log('🧪 TEST: Click handler is working!');
    const testBusiness = {
      id: 'test-marriott',
      name: 'Test Marriott Hotel',
      category: 'hotels',
      address: 'Test Address',
      latitude: 33.6330752,
      longitude: -111.9158272
    };
    handleBusinessSelect(testBusiness as Business);
  };

  const currentCategory = categories.find(c => c.key === selectedCategory);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Clean Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Nearby Businesses
            </h2>
            <p className="text-gray-600">
              Discover local businesses and maximize your rewards
            </p>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1" role="tablist">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              role="tab"
              aria-selected={viewMode === 'list'}
            >
              <Grid className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                viewMode === 'map' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              role="tab"
              aria-selected={viewMode === 'map'}
            >
              <Map className="h-4 w-4" />
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Test Button - Always Visible for Debugging */}
      <div className="mb-4">
        <button 
          onClick={testClick}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          🧪 Test Business Selection (Check Console)
        </button>
        <p className="text-xs text-gray-500 mt-1">
          This test button works regardless of location permission
        </p>
      </div>

      {/* Location Permission Check */}
      {!permissionState.granted && (
        <div className="max-w-md mx-auto">
          <LocationPermission onLocationGranted={handleLocationGranted} />
        </div>
      )}

      {permissionState.granted && (
        <>
          {/* Clean Filters Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category.key
                          ? 'bg-blue-500 text-white shadow-md'
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
              <div className="sm:w-56">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Search Radius
                </label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  aria-label="Select search radius"
                  className="modern-input text-sm"
                >
                  <option value={805}>0.5 miles</option>
                  <option value={1609}>1 mile</option>
                  <option value={3218}>2 miles</option>
                  <option value={8047}>5 miles</option>
                  <option value={16093}>10 miles</option>
                </select>
              </div>
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
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    📍 Found {businesses.length} businesses - Click any business below to test selection
                  </p>
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
                          className={`cursor-pointer bg-white rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-lg hover:border-blue-300 ${
                            selectedBusiness?.id === business.id 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-lg truncate">{business.name}</h3>
                              <p className="text-sm text-gray-600 mt-1">{business.address}</p>
                            </div>
                            {currentCategory && (
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${currentCategory.color}`}>
                                {currentCategory.icon}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {business.rating && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-gray-600 font-medium">{business.rating}</span>
                                </div>
                              )}
                              {business.distance && (
                                <div className="flex items-center space-x-1 text-gray-500">
                                  <MapPin className="h-4 w-4" />
                                  <span className="font-medium">
                                    {business.distance < 1609.34 
                                      ? `${Math.round(business.distance * 3.28084)}ft`
                                      : `${(business.distance * 0.000621371).toFixed(1)}mi`
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <Navigation className="h-5 w-5 text-gray-400" />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
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

                {/* Credit Card Recommendations - Enhanced Style */}
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      Best Credit Cards
                    </h3>
                    {selectedBusiness && (
                      <span className="text-sm text-emerald-600 font-medium bg-emerald-100 px-3 py-1 rounded-full">
                        For {selectedBusiness.name}
                      </span>
                    )}
                  </div>
                  
                  {recommendationsLoading ? (
                    <div className="flex items-center space-x-3 text-emerald-600 bg-white rounded-lg p-4">
                      <div className="modern-spinner"></div>
                      <span className="font-medium">Finding optimal cards...</span>
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="modern-card p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-gray-900 text-base">{rec.card.card_name}</span>
                            <div className="flex items-center space-x-2">
                              {index === 0 && (
                                <span className="modern-badge modern-badge-success text-xs">
                                  BEST
                                </span>
                              )}
                              <span className="modern-badge modern-badge-primary text-xs">
                                {rec.annual_value > 0 ? `$${rec.annual_value.toFixed(0)}/year` : `${rec.match_score}% match`}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.reasons?.join(', ') || 'Great rewards for this category'}</p>
                          {rec.estimated_points && (
                            <div className="text-xs text-emerald-700 font-medium">
                              Estimated: {rec.estimated_points} points per $100 spent
                            </div>
                          )}
                        </div>
                      ))}
                      {recommendations.length > 3 && (
                        <div className="text-center pt-2">
                          <span className="text-sm text-emerald-600 font-medium">+ {recommendations.length - 3} more card options</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="modern-card p-4">
                      <p className="text-sm text-gray-500 mb-1">No specific recommendations available for this category</p>
                      <p className="text-xs text-gray-400">Try selecting a different business type</p>
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
