// Executive Enhancement: Travel Status & Benefits Tracker
// src/components/executive/TravelStatusTracker.tsx

'use client';

import React, { useState } from 'react';
import { Plane, Hotel, Calendar, Gift, TrendingUp, MapPin } from 'lucide-react';

interface StatusProgress {
  program: string;
  currentTier: string;
  nextTier: string;
  currentCredits: number;
  requiredCredits: number;
  timeRemaining: string;
  benefits: string[];
  associatedCard: string;
}

interface TravelBenefit {
  type: 'credit' | 'access' | 'status' | 'upgrade';
  description: string;
  value: number;
  expirationDate?: string;
  used: number;
  total: number;
}

export default function TravelStatusTracker() {
  const [selectedProgram, setSelectedProgram] = useState<'airlines' | 'hotels'>('airlines');

  const statusPrograms: Record<'airlines' | 'hotels', StatusProgress[]> = {
    airlines: [
      {
        program: 'United MileagePlus',
        currentTier: 'Premier Gold',
        nextTier: 'Premier Platinum',
        currentCredits: 47650,
        requiredCredits: 75000,
        timeRemaining: '8 months',
        benefits: ['Economy Plus seats', 'Priority boarding', '2x miles earning'],
        associatedCard: 'United Club Infinite'
      },
      {
        program: 'American AAdvantage',
        currentTier: 'Gold',
        nextTier: 'Platinum',
        currentCredits: 32100,
        requiredCredits: 75000,
        timeRemaining: '10 months',
        benefits: ['Main Cabin Extra', 'Priority check-in', 'Free bags'],
        associatedCard: 'Citi AAdvantage Executive'
      }
    ],
    hotels: [
      {
        program: 'Marriott Bonvoy',
        currentTier: 'Platinum Elite',
        nextTier: 'Titanium Elite',
        currentCredits: 47,
        requiredCredits: 75,
        timeRemaining: '7 months',
        benefits: ['Suite upgrades', 'Late checkout', '50% bonus points'],
        associatedCard: 'Marriott Bonvoy Brilliant'
      },
      {
        program: 'Hilton Honors',
        currentTier: 'Gold',
        nextTier: 'Diamond',
        currentCredits: 28,
        requiredCredits: 60,
        timeRemaining: '9 months',
        benefits: ['Room upgrades', 'Free breakfast', '80% bonus points'],
        associatedCard: 'Hilton Honors Aspire'
      }
    ]
  };

  const travelBenefits: TravelBenefit[] = [
    {
      type: 'credit',
      description: 'Airline Fee Credit',
      value: 200,
      used: 45,
      total: 200,
      expirationDate: '2025-12-31'
    },
    {
      type: 'credit',
      description: 'Hotel Credit',
      value: 300,
      used: 120,
      total: 300,
      expirationDate: '2025-12-31'
    },
    {
      type: 'access',
      description: 'Priority Pass Visits',
      value: 0,
      used: 12,
      total: -1, // Unlimited
    },
    {
      type: 'access',
      description: 'Centurion Lounge Access',
      value: 0,
      used: 8,
      total: -1, // Unlimited
    },
    {
      type: 'upgrade',
      description: 'Suite Night Awards',
      value: 0,
      used: 2,
      total: 5,
    }
  ];

  const upcomingTrips = [
    {
      destination: 'London, UK',
      dates: 'Dec 15-22, 2025',
      purpose: 'Business Conference',
      airline: 'United',
      hotel: 'Marriott',
      potentialEarnings: { miles: 8500, nights: 7, points: 15200 }
    },
    {
      destination: 'Tokyo, Japan',
      dates: 'Jan 8-15, 2026',
      purpose: 'Client Meeting',
      airline: 'American',
      hotel: 'Hilton',
      potentialEarnings: { miles: 12400, nights: 6, points: 18900 }
    }
  ];

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  const getBenefitIcon = (type: TravelBenefit['type']) => {
    switch (type) {
      case 'credit': return Gift;
      case 'access': return MapPin;
      case 'upgrade': return TrendingUp;
      default: return Calendar;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl mr-4">
          <Plane className="h-7 w-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Travel Status Tracker</h2>
          <p className="text-gray-600">Monitor elite status progress and benefits</p>
        </div>
      </div>

      {/* Program Toggle */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1 mb-8 w-fit">
        <button
          onClick={() => setSelectedProgram('airlines')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            selectedProgram === 'airlines'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Plane className="h-4 w-4" />
          <span>Airlines</span>
        </button>
        <button
          onClick={() => setSelectedProgram('hotels')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            selectedProgram === 'hotels'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Hotel className="h-4 w-4" />
          <span>Hotels</span>
        </button>
      </div>

      {/* Status Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {statusPrograms[selectedProgram].map((status, index) => (
          <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{status.program}</h3>
              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {status.associatedCard}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {status.currentTier} → {status.nextTier}
                </span>
                <span className="text-sm text-gray-600">{status.timeRemaining} left</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(status.currentCredits, status.requiredCredits)}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{status.currentCredits.toLocaleString()}</span>
                <span>{status.requiredCredits.toLocaleString()} needed</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-700">Current Benefits:</h4>
              {status.benefits.map((benefit, idx) => (
                <div key={idx} className="text-sm text-gray-600">• {benefit}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Active Benefits */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Benefits & Credits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {travelBenefits.map((benefit, index) => {
            const IconComponent = getBenefitIcon(benefit.type);
            const usage = benefit.total === -1 ? benefit.used : `${benefit.used}/${benefit.total}`;
            const remaining = benefit.total === -1 ? 'Unlimited' : benefit.total - benefit.used;
            
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <IconComponent className="h-4 w-4 text-indigo-600 mr-2" />
                  <span className="font-medium text-gray-900">{benefit.description}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Used: {usage}
                  {benefit.total !== -1 && (
                    <span className="ml-2 text-green-600">({remaining} remaining)</span>
                  )}
                </div>
                {benefit.expirationDate && (
                  <div className="text-xs text-gray-500 mt-1">
                    Expires: {new Date(benefit.expirationDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Travel */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Travel</h3>
        <div className="space-y-4">
          {upcomingTrips.map((trip, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{trip.destination}</h4>
                <span className="text-sm text-gray-600">{trip.dates}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{trip.purpose}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Flight:</span>
                  <div className="text-gray-600">{trip.airline} - {trip.potentialEarnings.miles.toLocaleString()} miles</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Hotel:</span>
                  <div className="text-gray-600">{trip.hotel} - {trip.potentialEarnings.nights} nights</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Points:</span>
                  <div className="text-gray-600">{trip.potentialEarnings.points.toLocaleString()} total points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
