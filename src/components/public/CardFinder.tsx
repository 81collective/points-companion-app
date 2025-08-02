'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, MapPin, Search, Star, DollarSign, Sparkles, ArrowRight } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import LocationPermission from '@/components/location/LocationPermission';
import { fetchRecommendations as fetchRecommendationsFromApi } from '@/services/cardService';
import { fetchNearbyBusinesses as fetchNearbyBusinessesFromApi } from '@/services/locationService';
import { Business, CardRecommendation } from '@/types/location.types';

interface CardFinderProps {
  className?: string;
}

export default function CardFinder({ className = "" }: CardFinderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('dining');
  const [nearbyBusinesses, setNearbyBusinesses] = useState<Business[]>([]);
  const [recommendations, setRecommendations] = useState<CardRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { location, permissionState } = useLocation();

  const categories = [
    { key: 'dining', label: 'Dining', icon: '🍽️' },
    { key: 'groceries', label: 'Groceries', icon: '🛒' },
    { key: 'gas', label: 'Gas', icon: '⛽' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️' },
    { key: 'travel', label: 'Travel', icon: '✈️' },
    { key: 'hotels', label: 'Hotels', icon: '🏨' }
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
        5000 // radius
      );
      
      if (result.success) {
        setNearbyBusinesses(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch businesses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [location, selectedCategory]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const result = await fetchRecommendationsFromApi(
        selectedCategory,
        location?.latitude,
        location?.longitude
      );
      
      if (result.success) {
        setRecommendations(result.data || []);
      } else {
        // Optionally set an error state for recommendations
        console.error(result.error);
      }
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    }
  }, [selectedCategory, location]);

  // Fetch nearby businesses when location changes
  useEffect(() => {
    if (location && permissionState.granted) {
      fetchNearbyBusinesses();
    }
  }, [location, permissionState.granted, fetchNearbyBusinesses]);

  // Fetch recommendations when category changes
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleLocationGranted = () => {
    // Location will be handled by useLocation hook
  };

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
      {error && (
        <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card Recommendations */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
            Best Cards for {categories.find(c => c.key === selectedCategory)?.label}
          </h3>
          
          {loading ? (
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
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-16 animate-pulse"></div>
              ))}
            </div>
          ) : nearbyBusinesses.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {nearbyBusinesses.slice(0, 10).map((business, index) => (
                <div key={business.id || index} className="bg-white rounded-xl p-3 border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
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
                          {business.distance < 1000 
                            ? `${Math.round(business.distance)}m`
                            : `${(business.distance / 1000).toFixed(1)}km`
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
