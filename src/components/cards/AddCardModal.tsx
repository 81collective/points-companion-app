// AddCardModal.tsx: modal for adding a new credit card

import React from 'react'
import { z } from 'zod'
import { CreditCard } from './types'
import CardSelector from './CardSelector'
import { autoPopulateRewards, validateRewardStructure } from '@/lib/cardAutoPopulation'
import { CreditCardTemplate, RewardStructure } from '@/types/creditCards'
import { createClient } from '@/lib/supabase'
import * as Dialog from '@radix-ui/react-dialog'

interface AddCardModalProps {
  open: boolean
  onClose: () => void
  onAdd: (card: CreditCard) => void
  userId: string | undefined
}

// const rewardOptions = ["1x", "1.5x", "2x", "3x", "5x"];

const cardSchema = z.object({
  card_name: z.string().min(2, 'Card name required').max(32, 'Card name too long').regex(/^[a-zA-Z0-9 .,'-]+$/, 'Card name contains invalid characters'),
  last_four: z.string().regex(/^\d{4}$/, 'Last 4 digits must be exactly 4 numbers'),
  dining: z.enum(["1x", "2x", "3x", "5x"]),
  gas: z.enum(["1x", "2x", "3x", "5x"]),
  groceries: z.enum(["1x", "2x", "3x", "5x"]),
  travel: z.enum(["1x", "2x", "3x", "5x"]),
  online_shopping: z.enum(["1x", "2x", "3x", "5x"]),
  everything_else: z.enum(["1x", "1.5x", "2x"]),
});

type CardFormValues = z.infer<typeof cardSchema>;

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
      const { data, error } = await supabase.from('credit_cards').insert([
        {
          user_id: userId,
          card_name: selectedCard ? selectedCard.name : 'Custom Card',
          last_four: lastFour,
          rewards_structure: rewards,
        }
      ]).select().single();
      if (error) {
        setError('Unable to add card. Please try again or contact support.');
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
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30 z-50" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
          <form
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-bold text-blue-700 mb-2">Add New Card</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Select Card</label>
              <CardSelector onSelect={card => {
                setSelectedCard(card);
                setCustomMode(card === null);
              }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last 4 Digits</label>
              <input
                type="text"
                className="border rounded px-3 py-2 w-full"
                placeholder="1234"
                maxLength={4}
                inputMode="numeric"
                value={lastFour}
                onChange={e => setLastFour(e.target.value)}
              />
            </div>
            {rewards.length > 0 && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">Rewards Structure</label>
                <div className="space-y-2">
                  {rewards.map((r, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-semibold w-24">{r.category}</span>
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-16"
                        value={r.multiplier}
                        onChange={e => handleRewardChange(idx, 'multiplier', Number(e.target.value))}
                        min={0.5}
                        step={0.5}
                      />
                      {r.cap && <span className="text-xs text-gray-500">Cap: {r.cap}</span>}
                      {r.notes && <span className="text-xs text-gray-400">{r.notes}</span>}
                    </div>
                  ))}
                </div>
                {modified && (
                  <div className="text-yellow-600 text-xs mt-1">You have modified auto-populated values.</div>
                )}
                {!customMode && (
                  <button type="button" className="mt-2 px-2 py-1 bg-gray-200 rounded" onClick={handleReset}>
                    Reset to Default
                  </button>
                )}
              </div>
            )}
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex-1"
                disabled={false}
              >
                Add Card
              </button>
              <button
                type="button"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex-1"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default AddCardModal
