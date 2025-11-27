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

// Sample businesses to show when GPS is not enabled
const SAMPLE_BUSINESSES: Record<string, Business[]> = {
  dining: [
    { id: 'sample-1', name: 'The Local Bistro', category: 'dining', rating: 4.5, address: '123 Main St', distance: 400, latitude: 0, longitude: 0 },
    { id: 'sample-2', name: 'Sakura Sushi', category: 'dining', rating: 4.7, address: '456 Oak Ave', distance: 800, latitude: 0, longitude: 0 },
    { id: 'sample-3', name: 'Bella Italia', category: 'dining', rating: 4.3, address: '789 Pine Rd', distance: 1200, latitude: 0, longitude: 0 },
  ],
  groceries: [
    { id: 'sample-4', name: 'Fresh Market', category: 'groceries', rating: 4.4, address: '321 Elm St', distance: 600, latitude: 0, longitude: 0 },
    { id: 'sample-5', name: 'Whole Foods', category: 'groceries', rating: 4.2, address: '654 Maple Ave', distance: 1000, latitude: 0, longitude: 0 },
    { id: 'sample-6', name: 'Trader Joe\'s', category: 'groceries', rating: 4.6, address: '987 Cedar Ln', distance: 1500, latitude: 0, longitude: 0 },
  ],
  gas: [
    { id: 'sample-7', name: 'Shell Station', category: 'gas', rating: 4.0, address: '111 Highway Blvd', distance: 300, latitude: 0, longitude: 0 },
    { id: 'sample-8', name: 'Chevron', category: 'gas', rating: 3.9, address: '222 Fuel Way', distance: 700, latitude: 0, longitude: 0 },
    { id: 'sample-9', name: 'Costco Gas', category: 'gas', rating: 4.5, address: '333 Savings Dr', distance: 2000, latitude: 0, longitude: 0 },
  ],
  shopping: [
    { id: 'sample-10', name: 'Target', category: 'shopping', rating: 4.3, address: '444 Retail Pkwy', distance: 900, latitude: 0, longitude: 0 },
    { id: 'sample-11', name: 'Best Buy', category: 'shopping', rating: 4.1, address: '555 Tech Blvd', distance: 1100, latitude: 0, longitude: 0 },
    { id: 'sample-12', name: 'Nordstrom', category: 'shopping', rating: 4.4, address: '666 Fashion Ave', distance: 1600, latitude: 0, longitude: 0 },
  ],
  travel: [
    { id: 'sample-13', name: 'Marriott Hotel', category: 'travel', rating: 4.5, address: '777 Travel Way', distance: 2500, latitude: 0, longitude: 0 },
    { id: 'sample-14', name: 'Hilton Garden Inn', category: 'travel', rating: 4.3, address: '888 Stay St', distance: 3000, latitude: 0, longitude: 0 },
    { id: 'sample-15', name: 'Airport Parking', category: 'travel', rating: 4.0, address: '999 Terminal Rd', distance: 5000, latitude: 0, longitude: 0 },
  ],
};

// Sample card recommendations
const SAMPLE_RECOMMENDATIONS = [
  { card: { id: 'card-1', card_name: 'Chase Sapphire Preferred', issuer: 'Chase', reward_rate: 3 } },
  { card: { id: 'card-2', card_name: 'Amex Gold Card', issuer: 'American Express', reward_rate: 4 } },
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

  // Determine if we're showing real GPS-based data
  const isUsingRealLocation = permissionState.granted && !!location?.latitude && !!location?.longitude;
  
  // Use real businesses if GPS is enabled, otherwise show sample data for the category
  const displayBusinesses = isUsingRealLocation ? businesses : (SAMPLE_BUSINESSES[selectedCategory] || []);
  
  // Use real recommendations if GPS enabled and a business is selected, otherwise show samples
  const displayRecommendations = isUsingRealLocation && selectedBusiness ? recommendations : SAMPLE_RECOMMENDATIONS;

  // Always show the explorer UI - with sample or real data
  return (
    <section className={`bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden ${className}`}>
      {/* Header with GPS toggle */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapPin className="h-5 w-5 text-white/80" />
            <h3 className="text-lg font-semibold text-white">Nearby Places</h3>
          </div>
          {isUsingRealLocation ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-sm">
              <Navigation className="h-3.5 w-3.5" />
              GPS enabled
            </span>
          ) : (
            <button
              onClick={requestLocation}
              disabled={locationLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-brand-600 text-sm font-medium shadow-sm hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {locationLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Navigation className="h-3.5 w-3.5" />
                  Enable GPS
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Sample data banner */}
      {!isUsingRealLocation && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
          <p className="text-sm text-amber-800">
            <span className="font-medium">Showing sample locations.</span>{' '}
            Enable GPS to see real places near you.
          </p>
          {permissionState.denied && (
            <span className="text-xs text-amber-600">
              Location access denied in browser settings
            </span>
          )}
        </div>
      )}

      {/* Category Chips */}
      <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-50">
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
                    : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
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
        {businessesLoading && isUsingRealLocation ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            <span className="ml-3 text-neutral-600">Finding nearby {currentCategory?.label.toLowerCase()}...</span>
          </div>
        ) : displayBusinesses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="text-neutral-600">No {currentCategory?.label.toLowerCase()} places found nearby</p>
            <p className="text-sm text-neutral-500 mt-1">Try selecting a different category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayBusinesses.slice(0, 6).map((business) => {
              const isSelected = selectedBusiness?.id === business.id;
              return (
                <div key={business.id}>
                  <button
                    onClick={() => setSelectedBusiness(isSelected ? null : business)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? 'bg-brand-50 border-2 border-brand-500 shadow-sm'
                        : 'bg-neutral-50 border border-neutral-200 hover:border-brand-300 hover:bg-brand-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-neutral-900 truncate">{business.name}</span>
                          {business.rating && (
                            <span className="flex items-center text-sm text-neutral-600">
                              <Star className="h-3.5 w-3.5 text-yellow-400 fill-current mr-0.5" />
                              {business.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-neutral-500">
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
                      <ChevronRight className={`h-5 w-5 text-neutral-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded Card Recommendations */}
                  {isSelected && (
                    <div className="mt-2 ml-4 pl-4 border-l-2 border-brand-200">
                      {recsLoading && isUsingRealLocation ? (
                        <div className="flex items-center py-4 text-brand-600">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-sm">Finding best cards...</span>
                        </div>
                      ) : displayRecommendations.length > 0 ? (
                        <div className="py-3 space-y-2">
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">
                            Best Cards for {business.name}
                          </p>
                          {displayRecommendations.slice(0, 2).map((rec, idx) => (
                            <div
                              key={rec.card?.id || idx}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                                  <CreditCard className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <p className="font-medium text-neutral-900 text-sm">{rec.card?.card_name}</p>
                                  <p className="text-xs text-neutral-500">{rec.card?.issuer}</p>
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
                        <p className="py-4 text-sm text-neutral-500">
                          No specific card recommendations available
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {displayBusinesses.length > 6 && (
              <p className="text-center text-sm text-neutral-500 pt-2">
                +{displayBusinesses.length - 6} more places nearby
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
