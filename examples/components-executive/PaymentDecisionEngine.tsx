// Executive Enhancement: Real-Time Payment Decision Engine
// src/components/executive/PaymentDecisionEngine.tsx

'use client';

import React, { useState } from 'react';
import { Smartphone, MapPin, CreditCard } from 'lucide-react';

interface PaymentRecommendation {
  cardName: string;
  expectedPoints: number;
  dollarValue: number;
  reasoning: string;
  urgency: 'high' | 'medium' | 'low';
}

interface MerchantContext {
  name: string;
  category: string;
  estimatedAmount: number;
  timeContext: string;
  location: string;
}

export default function PaymentDecisionEngine() {
  const [currentMerchant, setCurrentMerchant] = useState<MerchantContext | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(150);
  
  // Simulate real-time merchant detection (would integrate with GPS + merchant APIs)
  const simulatedMerchants = [
    {
      name: 'The French Laundry',
      category: 'fine_dining',
      estimatedAmount: 485,
      timeContext: 'Dinner Reservation',
      location: 'Yountville, CA'
    },
    {
      name: 'United Club Lounge',
      category: 'travel',
      estimatedAmount: 25,
      timeContext: 'Pre-flight',
      location: 'SFO Terminal 3'
    },
    {
      name: 'Tesla Supercharger',
      category: 'automotive',
      estimatedAmount: 45,
      timeContext: 'Road Trip',
      location: 'Palo Alto, CA'
    },
    {
      name: 'Tiffany & Co.',
      category: 'luxury_retail',
      estimatedAmount: 2850,
      timeContext: 'Gift Purchase',
      location: 'Union Square'
    }
  ];

  // Executive card portfolio with actual earning rates
  const executiveCards = [
    {
      name: 'Amex Platinum',
      categories: {
        'fine_dining': { rate: 1, value: 0.02 },
        'travel': { rate: 5, value: 0.02 },
        'luxury_retail': { rate: 1, value: 0.02 },
        'automotive': { rate: 1, value: 0.02 }
      },
      benefits: ['Centurion Lounge', 'Hotel Status', '$200 Airline Credit'],
      annualFee: 695
    },
    {
      name: 'Chase Sapphire Reserve',
      categories: {
        'fine_dining': { rate: 3, value: 0.015 },
        'travel': { rate: 3, value: 0.015 },
        'luxury_retail': { rate: 1, value: 0.015 },
        'automotive': { rate: 1, value: 0.015 }
      },
      benefits: ['Priority Pass', 'Travel Protection', '$300 Travel Credit'],
      annualFee: 550
    },
    {
      name: 'Amex Gold',
      categories: {
        'fine_dining': { rate: 4, value: 0.02 },
        'travel': { rate: 1, value: 0.02 },
        'luxury_retail': { rate: 1, value: 0.02 },
        'automotive': { rate: 1, value: 0.02 }
      },
      benefits: ['Dining Credits', 'Uber Cash', 'No Foreign Fees'],
      annualFee: 250
    }
  ];

  const calculateOptimalCard = (merchant: MerchantContext, amount: number): PaymentRecommendation[] => {
    return executiveCards.map(card => {
      const categoryRate = card.categories[merchant.category as keyof typeof card.categories] || { rate: 1, value: 0.01 };
      const points = amount * categoryRate.rate;
      const dollarValue = points * categoryRate.value;
      
      let urgency: 'high' | 'medium' | 'low' = 'medium';
      let reasoning = `${categoryRate.rate}x points (${(categoryRate.rate * 100)}% back)`;
      
      // Executive-specific logic
      if (merchant.category === 'fine_dining' && card.name === 'Amex Gold') {
        urgency = 'high';
        reasoning += ' + dining credits optimize value';
      } else if (merchant.category === 'travel' && card.name === 'Amex Platinum') {
        urgency = 'high';
        reasoning += ' + airport lounge access';
      } else if (amount > 1000 && card.name === 'Chase Sapphire Reserve') {
        reasoning += ' + purchase protection for high-value items';
      }
      
      return {
        cardName: card.name,
        expectedPoints: Math.round(points),
        dollarValue: Math.round(dollarValue * 100) / 100,
        reasoning,
        urgency
      };
    }).sort((a, b) => b.dollarValue - a.dollarValue);
  };

  const handleMerchantSelect = (merchant: MerchantContext) => {
    setCurrentMerchant(merchant);
    setPaymentAmount(merchant.estimatedAmount);
  };

  const recommendations = currentMerchant ? calculateOptimalCard(currentMerchant, paymentAmount) : [];
  const bestRecommendation = recommendations[0];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mr-4">
          <Smartphone className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Payment Decision</h2>
          <p className="text-gray-600">Real-time card optimization for mobile payments</p>
        </div>
      </div>

      {/* Simulated Merchant Detection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Location Context</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simulatedMerchants.map((merchant, index) => (
            <button
              key={index}
              onClick={() => handleMerchantSelect(merchant)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                currentMerchant?.name === merchant.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span className="font-semibold text-gray-900">{merchant.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{merchant.timeContext}</span>
                <span className="text-lg font-bold text-gray-900">${merchant.estimatedAmount}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{merchant.location}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Amount Adjuster */}
      {currentMerchant && (
        <div className="mb-8 bg-gray-50 rounded-xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adjust Payment Amount
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="10"
              max="5000"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Optimal Card Recommendation */}
      {currentMerchant && bestRecommendation && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className={`p-2 rounded-lg mr-3 ${
              bestRecommendation.urgency === 'high' ? 'bg-green-500' :
              bestRecommendation.urgency === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}>
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Use {bestRecommendation.cardName}</h3>
              <p className="text-green-700">Optimal choice for {currentMerchant.name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{bestRecommendation.expectedPoints}</div>
              <div className="text-sm text-gray-600">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${bestRecommendation.dollarValue}</div>
              <div className="text-sm text-gray-600">Cash Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((bestRecommendation.dollarValue / paymentAmount) * 10000) / 100}%
              </div>
              <div className="text-sm text-gray-600">Return Rate</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Why this card:</strong> {bestRecommendation.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* All Card Comparison */}
      {currentMerchant && recommendations.length > 1 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Alternative Cards</h4>
          <div className="space-y-3">
            {recommendations.slice(1).map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{rec.cardName}</span>
                  <p className="text-sm text-gray-600">{rec.reasoning}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${rec.dollarValue}</div>
                  <div className="text-sm text-gray-600">{rec.expectedPoints} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executive Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">$2,847</div>
          <div className="text-sm text-gray-600">Monthly rewards value</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">94.2%</div>
          <div className="text-sm text-gray-600">Optimization efficiency</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">5</div>
          <div className="text-sm text-gray-600">Active premium cards</div>
        </div>
      </div>
    </div>
  );
}
