"use client";
import React from 'react';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';

export default function AnalyticsSection() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Advanced Analytics</h2>
        <p className="text-gray-600 mb-6">Deep insights into your spending patterns and rewards optimization.</p>
        <AdvancedAnalytics />
      </div>
    </div>
  );
}
