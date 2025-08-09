// Executive Enhancement: Multi-Card Portfolio Optimizer
// src/components/executive/PortfolioOptimizer.tsx

'use client';

import React, { useState } from 'react';
import { Crown, TrendingUp } from 'lucide-react';

export default function ExecutivePortfolioOptimizer() {
  const [selectedScenario, setSelectedScenario] = useState<'business_travel' | 'fine_dining' | 'luxury_shopping'>('business_travel');
  
  // Executive spending scenarios
  const executiveScenarios = {
    business_travel: {
      name: 'Business Travel Week',
      scenarios: [
        { category: 'airlines', amount: 2500, frequency: 'weekly' as const },
        { category: 'hotels', amount: 1800, frequency: 'weekly' as const },
        { category: 'dining', amount: 300, frequency: 'daily' as const },
        { category: 'uber', amount: 150, frequency: 'daily' as const }
      ]
    },
    fine_dining: {
      name: 'Executive Dining',
      scenarios: [
        { category: 'fine_dining', amount: 500, frequency: 'weekly' as const },
        { category: 'wine', amount: 200, frequency: 'weekly' as const },
        { category: 'entertainment', amount: 800, frequency: 'monthly' as const }
      ]
    },
    luxury_shopping: {
      name: 'Premium Purchases',
      scenarios: [
        { category: 'luxury_retail', amount: 3000, frequency: 'monthly' as const },
        { category: 'jewelry', amount: 5000, frequency: 'monthly' as const },
        { category: 'technology', amount: 1500, frequency: 'monthly' as const }
      ]
    }
  };

  const optimalCards = {
    business_travel: [
      { name: 'Amex Platinum', reason: '5x airlines + lounge access', value: '$847/month' },
      { name: 'Chase Sapphire Reserve', reason: '3x dining + travel protection', value: '$423/month' },
      { name: 'Citi Prestige', reason: '4th night free hotels', value: '$320/month' }
    ],
    fine_dining: [
      { name: 'Amex Gold', reason: '4x dining worldwide', value: '$312/month' },
      { name: 'Chase Sapphire Reserve', reason: '3x dining + concierge', value: '$287/month' },
      { name: 'Capital One Venture X', reason: '2x everything + portal bonuses', value: '$156/month' }
    ],
    luxury_shopping: [
      { name: 'Amex Platinum', reason: 'Luxury shopping credits', value: '$234/month' },
      { name: 'Chase Freedom Unlimited', reason: '1.5x everything + no limits', value: '$189/month' },
      { name: 'Citi Double Cash', reason: '2% everything reliable', value: '$167/month' }
    ]
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mr-4">
          <Crown className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executive Portfolio Optimizer</h2>
          <p className="text-gray-600">Multi-card strategy for maximum value</p>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(Object.entries(executiveScenarios) as Array<[keyof typeof executiveScenarios, typeof executiveScenarios[keyof typeof executiveScenarios]]>).map(([key, scenario]) => (
          <button
            key={key}
            onClick={() => setSelectedScenario(key)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedScenario === key 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900 mb-2">{scenario.name}</h3>
            <p className="text-sm text-gray-600">
              {scenario.scenarios.length} spending categories
            </p>
          </button>
        ))}
      </div>

      {/* Optimization Results */}
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Optimal Card Strategy</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {optimalCards[selectedScenario]?.map((card, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{card.name}</span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {card.value}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{card.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Benefits Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-semibold text-blue-900 mb-4">Travel Status Benefits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Airline Status Credits</span>
                <span className="font-medium">$2,100 available</span>
              </div>
              <div className="flex justify-between">
                <span>Hotel Elite Nights</span>
                <span className="font-medium">47/50 to Diamond</span>
              </div>
              <div className="flex justify-between">
                <span>Lounge Access Days</span>
                <span className="font-medium">Unlimited (3 cards)</span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-6">
            <h4 className="font-semibold text-purple-900 mb-4">Monthly ROI Analysis</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Annual Fees Paid</span>
                <span className="font-medium text-red-600">-$1,945</span>
              </div>
              <div className="flex justify-between">
                <span>Value Generated</span>
                <span className="font-medium text-green-600">+$4,890</span>
              </div>
              <div className="flex justify-between border-t border-purple-200 pt-2">
                <span className="font-semibold">Net Monthly Value</span>
                <span className="font-bold text-green-700">+$245/month</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
