'use client';
import React from 'react';

import { useState, useEffect } from 'react';
import type { CreditCard, Recommendation } from '@/types/recommendation.types';

interface CardRecommendationProps {
  amount: number;
  merchant: string;
  category: string;
}

export default function CardRecommendation({ amount, merchant, category }: CardRecommendationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const fetchUserCards = React.useCallback(async () => {
    try {
      const response = await fetch('/api/cards', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load cards');
      }
      const payload = (await response.json()) as { cards?: CreditCard[] };
      setCards(payload.cards || []);
    } catch (err) {
      setError('Failed to load your credit cards');
      console.error('Error fetching cards:', err);
    }
  }, []);

  const getRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: [{
            id: new Date().getTime().toString(),
            amount,
            date: new Date().toISOString(),
            merchant,
            category,
          }],
          cards,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendation');
      }

      const data = await response.json();
      setRecommendation(data.recommendations[0]);
    } catch (err) {
      setError('Failed to get AI recommendation');
      console.error('Error getting recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cards when component mounts
  useEffect(() => {
    fetchUserCards();
  }, [fetchUserCards]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : recommendation ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recommended Card
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{recommendation.cardName}</span>
              <span className="text-primary font-semibold">
                {recommendation.score} points
              </span>
            </div>
            <div className="text-gray-600">
              <h4 className="font-medium mb-2">Why this card?</h4>
              <p>{recommendation.reason}</p>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={getRecommendation}
          className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          disabled={loading}
        >
          Get Recommendation
        </button>
      )}
    </div>
  );
}
