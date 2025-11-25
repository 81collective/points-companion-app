'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, Star, CreditCard, Loader2, Navigation, ChevronRight, Sparkles } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyBusinesses } from '@/hooks/useNearbyBusinesses';
import { useCardRecommendations } from '@/hooks/useCardRecommendations';
import type { Business } from '@/types/location.types';

const CATEGORIES = [
  { key: 'dining', label: 'Dining', icon: '🍽️', teaser: 'up to 4x back', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { key: 'groceries', label: 'Groceries', icon: '🛒', teaser: 'up to 6% back', color: 'bg-green-100 text-green-700 border-green-200' },
  { key: 'gas', label: 'Gas', icon: '⛽', teaser: 'up to 5% back', color: 'bg-red-100 text-red-700 border-red-200' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', teaser: 'up to 5% back', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'travel', label: 'Travel', icon: '✈️', teaser: 'up to 5x back', color: 'bg-blue-100 text-blue-700 border-blue-200' },
];

interface NearbyExplorerProps {
  className?: string;
}

export default function NearbyExplorer({ className = '' }: NearbyExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('dining');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const { location, permissionState, requestLocation, loading: locationLoading } = useLocation();

  const { businesses, loading: businessesLoading } = useNearbyBusinesses({
    latitude: location?.latitude,
    longitude: location?.longitude,
    category: selectedCategory,
    radius: 3218, // ~2 miles
    enabled: permissionState.granted && !!location,
  });

  const { recommendations, loading: recsLoading } = useCardRecommendations({
    category: selectedCategory,
    latitude: location?.latitude,
    longitude: location?.longitude,
    businessId: selectedBusiness?.id,
    businessName: selectedBusiness?.name,
    enabled: !!selectedBusiness && permissionState.granted && !!location,
  });

  const currentCategory = useMemo(
    () => CATEGORIES.find((c) => c.key === selectedCategory),
    [selectedCategory]
  );

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    return meters < 1609.34
      ? `${Math.round(meters * 3.28084)}ft`
      : `${(meters * 0.000621371).toFixed(1)}mi`;
  };

  // Location not enabled - show prompt
  if (!permissionState.granted) {
    return (
      <section className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 ${className}`}>
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Find Nearby Businesses</h3>
          <p className="text-gray-400 mb-6">
            Enable location to discover local spots and get personalized card recommendations for maximum rewards.
          </p>

          {/* Category Preview Chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {CATEGORIES.map((cat) => (
              <span
                key={cat.key}
                className="px-3 py-1.5 rounded-full bg-gray-700/50 text-gray-300 text-sm border border-gray-600"
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </span>
            ))}
          </div>

          <button
            onClick={requestLocation}
            disabled={locationLoading}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {locationLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Getting location...
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5 mr-2" />
                Enable Location
              </>
            )}
          </button>

          {permissionState.denied && (
            <p className="text-red-400 text-sm mt-4">
              Location access was denied. Please enable it in your browser settings.
            </p>
          )}
        </div>
      </section>
    );
  }

  // Location enabled - show category chips and businesses
  return (
    <section className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-blue-200" />
            <h3 className="text-lg font-semibold text-white">Nearby Places</h3>
          </div>
          <span className="text-blue-200 text-sm">
            {businesses.length} found
          </span>
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  setSelectedCategory(cat.key);
                  setSelectedBusiness(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  isSelected
                    ? `${cat.color} shadow-sm`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
                {isSelected && (
                  <span className="ml-1.5 opacity-75">({cat.teaser})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Business List */}
      <div className="p-6">
        {businessesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Finding nearby {currentCategory?.label.toLowerCase()}...</span>
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600">No {currentCategory?.label.toLowerCase()} places found nearby</p>
            <p className="text-sm text-gray-500 mt-1">Try selecting a different category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {businesses.slice(0, 6).map((business) => {
              const isSelected = selectedBusiness?.id === business.id;
              return (
                <div key={business.id}>
                  <button
                    onClick={() => setSelectedBusiness(isSelected ? null : business)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                        : 'bg-gray-50 border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 truncate">{business.name}</span>
                          {business.rating && (
                            <span className="flex items-center text-sm text-gray-600">
                              <Star className="h-3.5 w-3.5 text-yellow-400 fill-current mr-0.5" />
                              {business.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                          {business.distance && (
                            <span className="flex items-center">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {formatDistance(business.distance)}
                            </span>
                          )}
                          {business.address && (
                            <span className="truncate">{business.address}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded Card Recommendations */}
                  {isSelected && (
                    <div className="mt-2 ml-4 pl-4 border-l-2 border-blue-200">
                      {recsLoading ? (
                        <div className="flex items-center py-4 text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm">Finding best cards...</span>
                        </div>
                      ) : recommendations.length > 0 ? (
                        <div className="py-3 space-y-2">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Best Cards for {business.name}
                          </p>
                          {recommendations.slice(0, 2).map((rec, idx) => (
                            <div
                              key={rec.card?.id || idx}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                  <CreditCard className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{rec.card?.card_name}</p>
                                  <p className="text-xs text-gray-500">{rec.card?.issuer}</p>
                                </div>
                              </div>
                              {rec.card?.reward_rate && (
                                <div className="flex items-center text-emerald-600 font-semibold text-sm">
                                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                                  {rec.card.reward_rate}x
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-sm text-gray-500">
                          No specific card recommendations available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {businesses.length > 6 && (
              <p className="text-center text-sm text-gray-500 pt-2">
                +{businesses.length - 6} more places nearby
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
