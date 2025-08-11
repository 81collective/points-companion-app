"use client";
import React from 'react';

// Placeholder bonuses tab (Phase 1) – to be replaced with real bonus optimization logic in later phases.
export default function BonusesSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Bonuses (Coming Soon)</h2>
        <p className="text-sm text-gray-600 mb-4">A centralized view of limited-time offers and category bonus opportunities will appear here.</p>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Track expiring category multipliers</li>
          <li>Surface new welcome offers matched to your profile</li>
          <li>Highlight under-utilized quarterly rotating categories</li>
        </ul>
        <div className="mt-4 inline-block text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">Prototype placeholder</div>
      </div>
    </div>
  );
}
