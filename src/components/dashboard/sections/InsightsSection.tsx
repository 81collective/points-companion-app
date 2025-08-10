"use client";
import React from 'react';
import SpendingAnalysis from '@/components/insights/SpendingAnalysis';
import AIInsights from '@/components/insights/AIInsights';

export default function InsightsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Spending Analysis</h2>
          <SpendingAnalysis />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Points Optimization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-700">Current Annual Points</h3>
              <p className="text-3xl font-bold text-green-800 mt-2">12,847</p>
              <p className="text-sm text-green-600 mt-1">Based on current spending patterns</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-700">Potential Annual Points</h3>
              <p className="text-3xl font-bold text-blue-800 mt-2">18,234</p>
              <p className="text-sm text-blue-600 mt-1">With optimized card usage</p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Recommendations</h2>
          <AIInsights />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3 text-sm">
            <a href="/dashboard?tab=cards" className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center">Add New Card</a>
            <button className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Update Spending Goals</button>
          </div>
        </div>
      </div>
    </div>
  );
}
