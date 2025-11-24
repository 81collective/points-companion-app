import React from 'react';

interface BusinessCardInChatProps {
  business: { name: string; distance?: number | string };
  recommendedCard: { name: string; issuer?: string; owned?: boolean };
  rewards?: { text: string };
  onSelect?: () => void;
}

function formatDistance(d?: number | string) {
  if (d === undefined) return undefined;
  if (typeof d === 'string') return d;
  // Treat numeric values as meters; convert to feet for < 1 mile, else miles
  const meters = d;
  if (meters < 1609.34) return `${Math.round(meters * 3.28084)}ft`;
  return `${(meters * 0.000621371).toFixed(1)}mi`;
}

export default function BusinessCardInChat({ business, recommendedCard, rewards, onSelect }: BusinessCardInChatProps) {
  const distanceText = formatDistance(business.distance);
  return (
    <div className="rounded-xl border border-blue-200 bg-white p-3 text-blue-900">
      <div className="font-medium">
        <span className="mr-1">🍽️</span>
        {business.name}
        {distanceText && (
          <span className="text-sm text-blue-700"> • {distanceText}</span>
        )}
      </div>
      {/* Prominent card name */}
      <div className="mt-2">
        <div className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
          {recommendedCard.name}
        </div>
        {recommendedCard.issuer && (
          <div className="text-xs text-gray-500">{recommendedCard.issuer}{recommendedCard.owned ? ' • In your wallet' : ''}</div>
        )}
      </div>
      {/* Rewards summary */}
      {rewards?.text && (
        <div className="mt-1 text-sm text-blue-900">🎯 Earn: {rewards.text}</div>
      )}
      <div className="mt-2">
        <button
          type="button"
          onClick={onSelect}
          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
        >
          Select This Place
        </button>
      </div>
    </div>
  );
}

// Ensure recognized as a module
export {};
