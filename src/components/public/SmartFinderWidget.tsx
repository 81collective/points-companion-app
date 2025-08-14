'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Star, CreditCard, Loader2, ArrowLeft, Search } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyBusinesses } from '@/hooks/useNearbyBusinesses';
import { useCardRecommendations } from '@/hooks/useCardRecommendations';
import type { Business } from '@/types/location.types';

type Step = 1 | 2 | 3;

const categories = [
  { key: 'dining', label: 'Dining', icon: '🍽️' },
  { key: 'groceries', label: 'Groceries', icon: '🛒' },
  { key: 'gas', label: 'Gas', icon: '⛽' },
  { key: 'hotels', label: 'Hotels', icon: '🏨' },
];

export function parseIntent(query: string): { category?: string; businessName?: string } {
  const q = query.toLowerCase();
  const matchers: Record<string, string[]> = {
    dining: ['dining', 'restaurant', 'dinner', 'lunch', 'breakfast', 'cafe', 'coffee'],
    groceries: ['grocery', 'groceries', 'supermarket', 'market'],
    gas: ['gas', 'fuel', 'gas station'],
    hotels: ['hotel', 'resort', 'inn', 'suite'],
  };

  let category: string | undefined;
  for (const [key, terms] of Object.entries(matchers)) {
    if (terms.some(t => q.includes(t))) { category = key; break; }
  }

  // Naive business extraction: quoted text or last capitalized word sequence (fallback)
  let businessName: string | undefined;
  const quoted = query.match(/\"([^\"]+)\"|'([^']+)'/);
  if (quoted) {
    businessName = quoted[1] || quoted[2];
  } else {
    const proper = query.match(/([A-Z][\w&'\-]*(?:\s+[A-Z][\w&'\-]*){0,3})/);
    if (proper) businessName = proper[0];
  }

  return { category, businessName };
}

export default function SmartFinderWidget({ className = '' }: { className?: string }) {
  const [step, setStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('dining');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [query, setQuery] = useState('');

  const { location, permissionState, requestLocation, loading: locLoading, error: locError } = useLocation();

  const { businesses, loading: nearbyLoading } = useNearbyBusinesses({
    latitude: location?.latitude,
    longitude: location?.longitude,
    category: selectedCategory,
    radius: 3218,
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

  const onAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const { category, businessName } = parseIntent(query.trim());
    if (category) setSelectedCategory(category);
    // Move to businesses view
    setStep(2);

    if (businessName && businesses.length > 0) {
      const found = businesses.find(b => b.name.toLowerCase().includes(businessName.toLowerCase()));
      if (found) {
        setSelectedBusiness(found);
        setStep(3);
      }
    }
  };

  const displayBusinesses: Business[] = useMemo(() => businesses.slice(0, 8), [businesses]);

  return (
    <section className={`w-full ${className}`}>
      {/* Ask bar */}
      <form onSubmit={onAsk} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2 sticky top-2 z-10">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about a place, category, or card..."
          className="flex-1 outline-none text-sm placeholder:text-gray-500"
        />
        <button type="submit" className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">Ask</button>
      </form>

      <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="sf-step1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Choose a category</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => { setSelectedCategory(cat.key); setSelectedBusiness(null); setStep(2); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === cat.key ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                  >
                    <span className="mr-1">{cat.icon}</span>{cat.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {permissionState.granted && location ? (
                  <span className="inline-flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1">
                    <MapPin className="w-3 h-3 mr-1" /> Using your location
                  </span>
                ) : (
                  <div className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                    <span className="text-xs text-blue-800">Enable location to see real nearby places</span>
                    <button onClick={requestLocation} disabled={locLoading} className={`px-3 py-1 rounded text-xs font-medium ${locLoading ? 'bg-blue-200 text-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                      {locLoading ? 'Enabling…' : 'Enable'}
                    </button>
                  </div>
                )}
                {locError && (!permissionState.granted || !location) && (
                  <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">{String(locError)}</div>
                )}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="sf-step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setStep(1)} className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <div className="text-xs text-gray-500">Category: <span className="font-medium text-gray-800">{categories.find(c => c.key === selectedCategory)?.label}</span></div>
              </div>

              <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> Select a nearby business</h4>

              {nearbyLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : displayBusinesses.length > 0 ? (
                <div className="space-y-2">
                  {displayBusinesses.map((b, idx) => (
                    <div
                      key={b.id || idx}
                      onClick={() => { setSelectedBusiness(b); setStep(3); }}
                      className={`cursor-pointer bg-white rounded-lg p-3 border-2 transition hover:shadow-sm ${selectedBusiness?.id === b.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{b.name}</p>
                          <p className="text-xs text-gray-600 truncate">{b.address}</p>
                        </div>
                        {b.rating && (
                          <div className="flex items-center ml-2 shrink-0"><Star className="h-3.5 w-3.5 text-yellow-400 fill-current" /><span className="text-xs ml-1">{b.rating}</span></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No businesses found nearby.</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="sf-step3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setStep(2)} className="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <div className="text-xs text-gray-500">{selectedBusiness ? <>Business: <span className="font-medium text-gray-800">{selectedBusiness.name}</span></> : 'Select a business'}</div>
              </div>

              <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-600" /> Top 3 Credit Cards</h4>

              {!selectedBusiness ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <CreditCard className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Select a business to see recommendations.</p>
                </div>
              ) : recsLoading ? (
                <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 rounded-lg p-4"><Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm font-medium">Finding optimal cards…</span></div>
              ) : (recommendations?.length ?? 0) > 0 ? (
                <div className="space-y-3">
                  {recommendations!.slice(0, 3).map((rec, index) => {
                    const isBrandMatch = rec.reasons?.some((r: string) => r.includes('brand card') || r.includes('Perfect for'));
                    return (
                      <div key={index} className={`rounded-xl p-4 border ${isBrandMatch ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900 text-sm">{rec.card.card_name}</span>
                          <div className="flex items-center gap-2">
                            {isBrandMatch && <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">BRAND MATCH</span>}
                            {index === 0 && <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">BEST</span>}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">{rec.reasons?.join(', ') || 'Great rewards for this category'}</p>
                        {rec.estimated_points && <div className="text-[11px] text-emerald-700 font-medium mt-1">Est: {rec.estimated_points} pts / $100</div>}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">No specific recommendations available.</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
