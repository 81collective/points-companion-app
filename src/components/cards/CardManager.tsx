'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, CreditCard, Trash2, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard as CreditCardType } from './types';

export default function CardManager() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CreditCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCards = useCallback(async () => {
    if (!user) {
      setCards([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/cards', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const payload = (await response.json()) as { cards?: CreditCardType[] };
      setCards(payload.cards || []);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load your cards');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserCards();
    }
  }, [user, fetchUserCards]);

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      const response = await fetch(`/api/cards/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to delete card');
      }
      setCards(prev => prev.filter(card => card.id !== id));
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Failed to delete card');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Credit Cards</h1>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Credit Cards</h1>
          <p className="text-gray-600">Manage your credit cards and optimize rewards</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Cards Grid */}
      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{card.name}</h3>
                      <p className="text-sm text-gray-600">•••• {card.last4}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Card Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rewards</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {Array.isArray(card.rewards) ? card.rewards.join(', ') : 'Various'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Added</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(card.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No credit cards yet</h3>
          <p className="text-gray-600 mb-6">
            Add your first credit card to start optimizing your rewards
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Card
          </button>
        </div>
      )}

      {/* Simple Add Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Credit Card</h3>
            <p className="text-gray-600 mb-4">
              This feature is coming soon! For now, you can explore the location-based recommendations and nearby businesses.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
