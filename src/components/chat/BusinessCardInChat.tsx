import React from 'react';

interface BusinessCardInChatProps {
  business: { name: string; distance?: number | string };
  recommendedCard: { name: string };
  rewards?: { text: string };
  onSelect?: () => void;
}

export default function BusinessCardInChat({ business, recommendedCard, rewards, onSelect }: BusinessCardInChatProps) {
  return (
    <div className="rounded-xl border border-blue-200 bg-white p-3 text-blue-900">
      <div className="font-medium">
        <span className="mr-1">🍽️</span>
        {business.name}
        {business.distance !== undefined && (
          <span className="text-sm text-blue-700"> • {typeof business.distance === 'number' ? `${business.distance.toFixed(1)} mi` : business.distance}</span>
        )}
      </div>
      <div className="mt-1 text-sm">
        <div>💳 Use: {recommendedCard.name}</div>
        {rewards?.text && <div>🎯 Earn: {rewards.text}</div>}
      </div>
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
