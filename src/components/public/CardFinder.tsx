'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, MapPin, Search, Star, DollarSign, Sparkles, ArrowRight } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyBusinesses } from '@/hooks/useNearbyBusinesses';
import { useCardRecommendations } from '@/hooks/useCardRecommendations';
import LocationPermission from '@/components/location/LocationPermission';
import BusinessListSkeleton from '@/components/common/BusinessListSkeleton';

interface CardFinderProps {
  className?: string;
}

export default function CardFinder({ className = "" }: CardFinderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('dining');
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  
  const { location, permissionState } = useLocation();
  
  // Use React Query hooks for data fetching
  const { recommendations, loading: recommendationsLoading } = useCardRecommendations({
    category: selectedCategory,
    latitude: location?.latitude,
    longitude: location?.longitude,
    businessId: selectedBusiness?.id,
    businessName: selectedBusiness?.name,
    enabled: !!location
  });
  
  const { businesses: nearbyBusinesses, loading: businessesLoading } = useNearbyBusinesses({
    latitude: location?.latitude,
    longitude: location?.longitude,
    category: selectedCategory,
    radius: 5000,
    enabled: permissionState.granted && !!location
  });

  // Add real-time effect when business is selected - same as dashboard
  useEffect(() => {
    if (selectedBusiness) {
      console.log('🎯 HOMEPAGE: Selected business for recommendations:', {
        id: selectedBusiness.id,
        name: selectedBusiness.name,
        category: selectedBusiness.category,
        location: `${location?.latitude}, ${location?.longitude}`,
        fullBusiness: selectedBusiness
      });
    }
  }, [selectedBusiness, location]);

  const categories = [
    { key: 'dining', label: 'Dining', icon: '🍽️' },
    { key: 'groceries', label: 'Groceries', icon: '🛒' },
    { key: 'gas', label: 'Gas', icon: '⛽' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️' },
    { key: 'travel', label: 'Travel', icon: '✈️' },
    { key: 'hotels', label: 'Hotels', icon: '🏨' }
  ];

  const handleLocationGranted = () => {
    // Location will be handled by useLocation hook
  };

  // Business selection handler - same as dashboard
  const handleBusinessSelect = (business: any) => {
    console.log('🏢 HOMEPAGE: Business selected - BEFORE setSelectedBusiness:', {
      businessName: business.name,
      businessId: business.id,
      businessCategory: business.category,
      selectedCategory: selectedCategory,
      willUseCategory: selectedCategory
    });
    setSelectedBusiness(business);
    console.log('🏢 HOMEPAGE: Business selected - AFTER setSelectedBusiness');
  };

  // Test function to verify click handling works
  const testClick = () => {
    console.log('🧪 HOMEPAGE TEST: Click handler is working!');
    const testBusiness = {
      id: 'homepage-test-marriott',
      name: 'Homepage Test Marriott Hotel',
      category: 'hotels',
      address: 'Test Address for Homepage',
      latitude: 33.6330752,
      longitude: -111.9158272
    };
    handleBusinessSelect(testBusiness);
  };

  // Find the absolute best card from recommendations
  const bestCardRec = recommendations.length > 0
    ? recommendations.reduce((best, rec) => (rec.match_score > (best?.match_score ?? -1) ? rec : best), recommendations[0])
    : null;

  // Simulate user cards (for demo, in real app, fetch from user profile)
  const userCardIds: string[] = [];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Card Recommendations</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Find the Best Credit Card for Your Location
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get personalized card recommendations based on nearby businesses and your spending category.
        </p>
      </div>

      {/* Test Button for Homepage */}
      <div className="text-center">
        <button 
          onClick={testClick}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mb-6"
        >
          🧪 Test Homepage Business Selection (Check Console)
        </button>
      </div>

      {/* Category Selection */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedCategory(category.key)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              selectedCategory === category.key
                ? 'bg-blue-600 text-white shadow-lg transform -translate-y-1'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Absolute Best Card Recommendation */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            {selectedBusiness ? `Best Card for ${selectedBusiness.name}` : 'Absolute Best Card'}
          </h3>
          {selectedBusiness && (
            <span className="text-sm text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
              Selected Business
            </span>
          )}
          {bestCardRec && !userCardIds.includes(bestCardRec.card.id) && (
            <span className="text-xs text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full animate-pulse">
              You don&apos;t own this card yet
            </span>
          )}
        </div>
        {bestCardRec ? (
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-blue-700 mb-1">{bestCardRec.card.card_name}</h4>
              <p className="text-sm text-gray-600 mb-2">{bestCardRec.card.issuer}</p>
              <div className="flex items-center space-x-4 text-sm mb-2">
                <span className="text-green-600 font-semibold">{bestCardRec.card.reward_rate}x {bestCardRec.card.reward_type}</span>
                <span className="text-blue-600 font-semibold">${bestCardRec.annual_value}/mo value</span>
                <span className="text-gray-500">{bestCardRec.match_score}/100 match</span>
              </div>
              {bestCardRec.card.bonus_offer && (
                <div className="mt-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md">
                  Bonus: {bestCardRec.card.bonus_offer}
                </div>
              )}
              <div className="mt-2 text-sm text-gray-700">{bestCardRec.reasons?.join(', ')}</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="modern-badge modern-badge-success text-xs mb-2">BEST</span>
              <button className="btn-primary-modern px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
                Learn More
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No recommendations available for this category.</div>
        )}
      </div>

      {/* Location Permission */}
      {!permissionState.granted && !permissionState.denied && (
        <div className="max-w-md mx-auto">
          <LocationPermission onLocationGranted={handleLocationGranted} />
        </div>
      )}

      {/* Location Status */}
      {permissionState.granted && location && (
        <div className="text-center">
          <LocationPermission showInline onLocationGranted={handleLocationGranted} className="justify-center" />
        </div>
      )}

      {/* Error State */}
      {/* Remove the single error state since we now have separate error handling per query */}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card Recommendations */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
            Best Cards for {categories.find(c => c.key === selectedCategory)?.label}
          </h3>
          
          {recommendationsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{rec.card.card_name}</h4>
                      <p className="text-sm text-gray-600">{rec.card.issuer}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <div className="flex items-center space-x-1 text-green-600">
                          <Star className="h-3 w-3" />
                          <span>{rec.card.reward_rate}x {rec.card.reward_type}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-600">
                          <DollarSign className="h-3 w-3" />
                          <span>${rec.annual_value}/mo value</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{rec.match_score}/100</div>
                      <div className="text-xs text-gray-500">Match Score</div>
                    </div>
                  </div>
                  
                  {rec.card.bonus_offer && (
                    <div className="mt-2 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md">
                      Bonus: {rec.card.bonus_offer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nearby Businesses */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-600" />
            Nearby {categories.find(c => c.key === selectedCategory)?.label} Places
          </h3>
          
          {!permissionState.granted ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Enable location to see nearby businesses</p>
            </div>
          ) : businessesLoading ? (
            <BusinessListSkeleton count={3} />
          ) : nearbyBusinesses.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {nearbyBusinesses.slice(0, 10).map((business, index) => (
                <div 
                  key={business.id || index} 
                  onClick={() => handleBusinessSelect(business)}
                  className={`cursor-pointer bg-white rounded-xl p-3 border-2 transition-all duration-200 hover:shadow-lg hover:border-blue-300 ${
                    selectedBusiness?.id === business.id 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{business.name}</h4>
                      <p className="text-sm text-gray-600">{business.address}</p>
                      {business.rating && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600">{business.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {business.distance && (
                        <div className="text-sm text-gray-500">
                          {business.distance < 1609.34 
                            ? `${Math.round(business.distance * 3.28084)}ft`
                            : `${(business.distance * 0.000621371).toFixed(1)}mi`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No nearby businesses found</p>
              <p className="text-sm text-gray-500 mt-1">Try a different category or expand your search radius</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Business Details - Same as Dashboard */}
      {selectedBusiness && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Selected Business on Homepage
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        ? `${Math.round(selectedBusiness.distance * 3.28084)}ft`
                        : `${(selectedBusiness.distance * 0.000621371).toFixed(1)}mi`
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-1">✅ Business selected successfully</p>
              <p className="mb-1">🎯 Card recommendations updated</p>
              <p>💳 Best cards shown above</p>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to Optimize Your Rewards?</h3>
        <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
          Sign up to track your spending, get personalized recommendations, and maximize your credit card rewards.
        </p>
        <button className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
          <span>Get Started Free</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
