// AddCardModal.tsx: modal for adding a new credit card

import React from 'react'
import { z } from 'zod'
import { CreditCard } from './types'
import CardSelector from './CardSelector'
import { autoPopulateRewards, validateRewardStructure } from '@/lib/cardAutoPopulation'
import { CreditCardTemplate, RewardStructure, RewardCategory } from '@/types/creditCards'
import { createClient } from '@/lib/supabase'
import * as Dialog from '@radix-ui/react-dialog'

interface AddCardModalProps {
  open: boolean
  onClose: () => void
  onAdd: (card: CreditCard) => void
  userId: string | undefined
}

// const rewardOptions = ["1x", "1.5x", "2x", "3x", "5x"];


const AddCardModal: React.FC<AddCardModalProps> = ({ open, onClose, onAdd, userId }) => {
  const [selectedCard, setSelectedCard] = React.useState<CreditCardTemplate | null>(null);
  const [rewards, setRewards] = React.useState<RewardStructure[]>([]);
  const [customMode, setCustomMode] = React.useState(false);
  const [lastFour, setLastFour] = React.useState('');
  const [error, setError] = React.useState('');
  const [modified, setModified] = React.useState(false);

  React.useEffect(() => {
    if (selectedCard && !customMode) {
      setRewards(autoPopulateRewards(selectedCard.id));
      setModified(false);
    }
  }, [selectedCard, customMode]);

  const handleRewardChange = (idx: number, field: keyof RewardStructure, value: number | string) => {
    setRewards(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    setModified(true);
  };

  const handleReset = () => {
    if (selectedCard) setRewards(autoPopulateRewards(selectedCard.id));
    setModified(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateRewardStructure(rewards)) {
      setError('Invalid reward structure.');
      return;
    }
    try {
      const supabase = createClient();
      // Convert rewards to text[] for Supabase
      const rewardsTextArray = rewards.map(r => `${r.category}:${r.multiplier}`);
      const { data, error } = await supabase.from('credit_cards').insert([
        {
          user_id: userId,
          name: selectedCard ? selectedCard.name : 'Custom Card',
          last4: lastFour,
          rewards: rewardsTextArray,
        }
      ]).select().single();
      if (error) {
        setError(`Unable to add card: ${error.message}`);
        console.error('Supabase insert error:', error);
        return;
      }
      onAdd(data as CreditCard);
      setSelectedCard(null);
      setRewards([]);
      setLastFour('');
      setCustomMode(false);
      setModified(false);
      onClose();
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Network error:', err);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 z-50" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <form
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-6 relative"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="flex items-center gap-3 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="2" y="6" width="20" height="12" rx="3" fill="url(#cardGradient)" /><defs><linearGradient id="cardGradient" x1="2" y1="6" x2="22" y2="18" gradientUnits="userSpaceOnUse"><stop stop-color="#3b82f6" /><stop offset="1" stop-color="#6366f1" /></linearGradient></defs></svg>
              <h2 className="text-2xl font-extrabold text-blue-700 tracking-tight">Add Credit Card</h2>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Select Card</label>
              <CardSelector onSelect={card => {
                setSelectedCard(card);
                setCustomMode(card === null);
              }} />
              <span className="text-xs text-gray-400">Choose a template or create a custom card.</span>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Last 4 Digits <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition placeholder-transparent peer"
                placeholder="1234"
                maxLength={4}
                inputMode="numeric"
                value={lastFour}
                onChange={e => setLastFour(e.target.value)}
                required
                pattern="\d{4}"
                aria-label="Last 4 digits of card"
              />
              <span className="text-xs text-gray-400">Required for card identification. Numbers only.</span>
            </div>
            {rewards.length > 0 && (
              <div className="mt-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Rewards Structure</label>
                <div className="space-y-2">
                  {rewards.map((r, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-semibold w-24 flex items-center gap-1">
                        {/* Example category icons using RewardCategory enum */}
                        {r.category === RewardCategory.Dining && <span role="img" aria-label="Dining">🍽️</span>}
                        {r.category === RewardCategory.Gas && <span role="img" aria-label="Gas">⛽</span>}
                        {r.category === RewardCategory.Groceries && <span role="img" aria-label="Groceries">🛒</span>}
                        {r.category === RewardCategory.Travel && <span role="img" aria-label="Travel">✈️</span>}
                        {r.category === RewardCategory.Other && <span role="img" aria-label="Other">�</span>}
                        {/* Add more icons for other categories as needed */}
                        {typeof r.category === 'string' ? r.category.charAt(0).toUpperCase() + r.category.slice(1) : r.category}
                      </span>
                      <select
                        className="border border-gray-300 rounded px-2 py-1 w-20 focus:ring-2 focus:ring-blue-500"
                        value={r.multiplier}
                        onChange={e => handleRewardChange(idx, 'multiplier', e.target.value)}
                        aria-label={`Reward multiplier for ${r.category}`}
                      >
                        {["1x", "1.5x", "2x", "3x", "4x", "5x"].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {r.cap && <span className="text-xs text-gray-500">Cap: {r.cap}</span>}
                      {r.notes && <span className="text-xs text-gray-400">{r.notes}</span>}
                    </div>
                  ))}
                </div>
                {modified && (
                  <div className="text-yellow-600 text-xs mt-1">You have modified auto-populated values.</div>
                )}
                {!customMode && (
                  <button type="button" className="mt-2 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition" onClick={handleReset}>
                    Reset to Default
                  </button>
                )}
                <span className="text-xs text-gray-400">Select the best multiplier for each category. Hover for examples.</span>
              </div>
            )}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:scale-[1.03] hover:shadow-lg transition flex-1 font-semibold"
                disabled={false}
              >
                Add Card
              </button>
              <button
                type="button"
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl flex-1 hover:bg-gray-200 transition"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
            {/* Success and loading states */}
            {/* Add more feedback as needed */}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AddCardModal
