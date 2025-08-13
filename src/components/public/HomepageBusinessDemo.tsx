'use client';

import React, { useState } from 'react';
import { MapPin, Star, CreditCard, Loader2, Navigation, ArrowRight, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyBusinesses } from '@/hooks/useNearbyBusinesses';
import { useCardRecommendations } from '@/hooks/useCardRecommendations';
import { Business } from '@/types/location.types';

export default function HomepageBusinessDemo() {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('dining');
  const [showDemo, setShowDemo] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const { location, permissionState, requestLocation, loading: locLoading, error: locError } = useLocation();
  
  // Use React Query hook for data fetching
  const { businesses, loading } = useNearbyBusinesses({
    latitude: location?.latitude,
    longitude: location?.longitude,
    category: selectedCategory,
    radius: 3218, // 2 miles
    enabled: permissionState.granted && !!location && showDemo
  });

  // Get credit card recommendations for selected business
  const { recommendations, loading: recommendationsLoading } = useCardRecommendations({
    category: selectedCategory,
    latitude: location?.latitude,
    longitude: location?.longitude,
    businessId: selectedBusiness?.id,
    businessName: selectedBusiness?.name,
    enabled: !!selectedBusiness && permissionState.granted && !!location
  });

  const categories = [
    { key: 'dining', label: 'Dining', icon: '🍽️' },
    { key: 'groceries', label: 'Groceries', icon: '🛒' },
    { key: 'gas', label: 'Gas', icon: '⛽' },
    { key: 'hotels', label: 'Hotels', icon: '🏨' }
  ];

  const handleStartDemo = async () => {
    if (permissionState.granted) {
  setShowDemo(true);
  setStep(1);
    } else {
      await requestLocation();
      // Show demo regardless of permission result, with fallback data if needed
  setShowDemo(true);
  setStep(1);
    }
  };

  // Sample businesses for demo when location is not available
  const sampleBusinesses = {
    dining: [
      { id: 'sample-1', name: 'Starbucks Coffee', address: '123 Main St, Your City', rating: 4.2, category: 'dining', latitude: 40.7128, longitude: -74.0060 },
      { id: 'sample-2', name: 'McDonald\'s', address: '456 Oak Ave, Your City', rating: 3.8, category: 'dining', latitude: 40.7138, longitude: -74.0070 },
      { id: 'sample-3', name: 'Olive Garden', address: '789 Pine Rd, Your City', rating: 4.1, category: 'dining', latitude: 40.7118, longitude: -74.0050 },
    ],
    groceries: [
      { id: 'sample-4', name: 'Whole Foods Market', address: '321 Elm St, Your City', rating: 4.5, category: 'groceries', latitude: 40.7148, longitude: -74.0080 },
      { id: 'sample-5', name: 'Target', address: '654 Maple Dr, Your City', rating: 4.3, category: 'groceries', latitude: 40.7108, longitude: -74.0040 },
      { id: 'sample-6', name: 'Costco Wholesale', address: '987 Broadway, Your City', rating: 4.4, category: 'groceries', latitude: 40.7158, longitude: -74.0090 },
    ],
    gas: [
      { id: 'sample-7', name: 'Shell', address: '159 Commerce St, Your City', rating: 3.9, category: 'gas', latitude: 40.7098, longitude: -74.0030 },
      { id: 'sample-8', name: 'Exxon', address: '753 Industrial Blvd, Your City', rating: 3.7, category: 'gas', latitude: 40.7088, longitude: -74.0020 },
      { id: 'sample-9', name: 'Chevron', address: '246 Highway 1, Your City', rating: 4.0, category: 'gas', latitude: 40.7078, longitude: -74.0010 },
    ],
    hotels: [
      { id: 'sample-10', name: 'Marriott Downtown Hotel', address: '100 Hotel Plaza, Your City', rating: 4.6, category: 'hotels', latitude: 40.7168, longitude: -74.0100 },
      { id: 'sample-11', name: 'Hilton Garden Inn', address: '200 Business District, Your City', rating: 4.4, category: 'hotels', latitude: 40.7178, longitude: -74.0110 },
      { id: 'sample-12', name: 'Hyatt Place', address: '300 Convention Center, Your City', rating: 4.5, category: 'hotels', latitude: 40.7188, longitude: -74.0120 },
    ]
  } as Record<string, Business[]>;

  // Use real businesses if available, otherwise use sample data
  const displayBusinesses: Business[] = businesses.length > 0 ? businesses : (sampleBusinesses[selectedCategory] || []);

  const handleBusinessSelect = (business: Business) => {
    setSelectedBusiness(business);
    setStep(3);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover nearby businesses and get instant credit card recommendations. 
            See how our AI finds the perfect card for each purchase.
          </p>
          
          {!showDemo ? (
            <div className="max-w-md mx-auto">
              <button
                onClick={handleStartDemo}
                className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Navigation className="w-5 h-5 mr-2" />
                Try Interactive Demo
              </button>
              <p className="text-sm text-gray-500 mt-3">
                We&apos;ll find businesses near you and show personalized card recommendations
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-left">Step 1 – Choose a Category</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.key}
                          onClick={() => {
                            setSelectedCategory(category.key);
                            // Preserve prior business if category unchanged; clear if changed
                            if (selectedCategory !== category.key) {
                              setSelectedBusiness(null);
                            }
                            setStep(2);
                          }}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                            selectedCategory === category.key
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-6">
                      {permissionState.granted && location ? (
                        <div className="inline-flex items-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
                          Using your location for real nearby businesses
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                          <div className="text-sm text-blue-800 text-center sm:text-left">
                            Enable location to see real nearby businesses. Otherwise, we’ll show samples.
                            {locError && (
                              <span className="block text-xs text-blue-700 mt-1">{String(locError)}</span>
                            )}
                          </div>
                          <button
                            onClick={requestLocation}
                            disabled={locLoading}
                            className={`inline-flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                              locLoading ? 'bg-blue-300 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {locLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Enable Location
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setStep(1)}
                        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </button>
                      <div className="flex items-center gap-3">
                        {!permissionState.granted || !location ? (
                          <button
                            onClick={requestLocation}
                            disabled={locLoading}
                            className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-md border ${
                              locLoading
                                ? 'bg-blue-100 text-blue-600 border-blue-200'
                                : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {locLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            Enable Location
                          </button>
                        ) : (
                          <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1">
                            <MapPin className="w-3 h-3 mr-1 text-emerald-600" /> Location enabled
                          </span>
                        )}
                        <div className="text-sm text-gray-500">
                          Category: <span className="font-medium text-gray-800">{categories.find(c => c.key === selectedCategory)?.label}</span>
                        </div>
                      </div>
                    </div>

                    {locError && (!permissionState.granted || !location) && (
                      <div className="mb-3 -mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                        {String(locError)}
                      </div>
                    )}

                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      Step 2 – Choose a Nearby Business
                    </h3>

                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                            <div className="h-5 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : displayBusinesses.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {displayBusinesses.slice(0, 8).map((business, index) => (
                          <div
                            key={business.id || index}
                            onClick={() => handleBusinessSelect(business)}
                            className={`cursor-pointer bg-white rounded-xl p-4 border-2 transition-all duration-200 hover:shadow-md ${
                              selectedBusiness?.id === business.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 truncate">{business.name}</h5>
                                <p className="text-sm text-gray-600 truncate">{business.address}</p>
                              </div>
                              {business.rating && (
                                <div className="flex items-center ml-2">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm ml-1">{business.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {!permissionState.granted && (
                          <div className="text-center pt-4">
                            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                              📍 Sample businesses shown. Enable location for real nearby businesses.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No businesses found in this category nearby.</p>
                        <p className="text-sm text-gray-500 mt-2">Try a different category or location.</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setStep(2)}
                        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                      </button>
                      <div className="text-sm text-gray-500">
                        {selectedBusiness ? (
                          <>
                            Business: <span className="font-medium text-gray-800">{selectedBusiness.name}</span>
                          </>
                        ) : (
                          <span className="font-medium">Select a business</span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      Step 3 – Top 3 Credit Cards
                      {selectedBusiness && (
                        <span className="text-sm text-emerald-600 font-medium bg-emerald-100 px-3 py-1 rounded-full ml-2">
                          For {selectedBusiness.name}
                        </span>
                      )}
                    </h3>

                    {!selectedBusiness ? (
                      <div className="bg-gray-50 rounded-xl p-8 text-center">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Select a business to see recommendations</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Our AI will find the perfect credit card for maximum rewards at that specific business.
                        </p>
                      </div>
                    ) : recommendationsLoading ? (
                      <div className="flex items-center space-x-3 text-emerald-600 bg-emerald-50 rounded-xl p-6">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="font-medium">Finding optimal cards...</span>
                      </div>
                    ) : recommendations.length > 0 ? (
                      <div className="space-y-4">
                        {recommendations.slice(0, 3).map((rec, index) => {
                          const isBrandMatch = rec.reasons?.some(reason => 
                            reason.includes('brand card') || reason.includes('Perfect for')
                          );
                          
                          return (
                            <div key={index} className={`rounded-xl p-4 border ${
                              isBrandMatch 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
                                : 'bg-white border-gray-200'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-gray-900">{rec.card.card_name}</span>
                                <div className="flex items-center space-x-2">
                                  {isBrandMatch && (
                                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                      🎯 BRAND MATCH
                                    </span>
                                  )}
                                  {index === 0 && (
                                    <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                      BEST
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {rec.reasons?.join(', ') || 'Great rewards for this category'}
                              </p>
                              {rec.estimated_points && (
                                <div className="text-xs text-emerald-700 font-medium">
                                  Estimated: {rec.estimated_points} points per $100 spent
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <p className="text-gray-600">No specific recommendations available for this business.</p>
                      </div>
                    )}

                    {/* Call to Action */}
                    <div className="mt-8 text-center pt-8 border-t border-gray-200">
                      <p className="text-gray-600 mb-4">
                        Like what you see? Get personalized recommendations for all your spending.
                      </p>
                      <button
                        onClick={() => (window.location.href = '/auth')}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200"
                      >
                        Sign Up Free
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
