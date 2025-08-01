// AddCardModal.tsx: modal for adding a new credit card

import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard } from './types'
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
  card_name: z.string()
    .min(2, 'Card name required')
    .max(32, 'Card name too long')
    .regex(/^[a-zA-Z0-9 .,'-]+$/, 'Card name contains invalid characters'),
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
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      card_name: '',
      last_four: '',
      dining: '1x',
      gas: '1x',
      groceries: '1x',
      travel: '1x',
      online_shopping: '1x',
      everything_else: '1x',
    }
  });
  const [error, setError] = React.useState('');

  const sanitizeCardName = (name: string) => name.replace(/[^a-zA-Z0-9 .,'-]/g, '').trim();
  const onSubmit = async (values: CardFormValues) => {
    setError('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('credit_cards').insert([
        {
          user_id: userId,
          card_name: sanitizeCardName(values.card_name),
          last_four: values.last_four,
          rewards_structure: {
            dining: values.dining,
            gas: values.gas,
            groceries: values.groceries,
            travel: values.travel,
            online_shopping: values.online_shopping,
            everything_else: values.everything_else,
          },
        }
      ]).select().single();
      if (error) {
        setError('Unable to add card. Please try again or contact support.');
        console.error('Add card error:', error);
        return;
      }
      onAdd(data as CreditCard);
      reset();
      onClose();
    } catch (err: unknown) {
      setError('Network error. Please check your connection and try again.');
      console.error('Add card network error:', err);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30 z-50" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50">
          <form
            className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className="text-xl font-bold text-blue-700 mb-2">Add New Card</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Card Name</label>
              <input
                type="text"
                {...register('card_name')}
                className="border rounded px-3 py-2 w-full"
                placeholder="Card Name"
              />
              {errors.card_name && <span className="text-red-500 text-xs">{errors.card_name.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last 4 Digits</label>
              <input
                type="text"
                {...register('last_four')}
                className="border rounded px-3 py-2 w-full"
                placeholder="1234"
                maxLength={4}
                inputMode="numeric"
              />
              {errors.last_four && <span className="text-red-500 text-xs">{errors.last_four.message}</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Dining</label>
                <select {...register('dining')} className="border rounded px-3 py-2 w-full">
                  <option value="1x">1x</option>
                  <option value="2x">2x</option>
                  <option value="3x">3x</option>
                  <option value="5x">5x</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gas</label>
                <select {...register('gas')} className="border rounded px-3 py-2 w-full">
                  <option value="1x">1x</option>
                  <option value="2x">2x</option>
                  <option value="3x">3x</option>
                  <option value="5x">5x</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Groceries</label>
                <select {...register('groceries')} className="border rounded px-3 py-2 w-full">
                  <option value="1x">1x</option>
                  <option value="2x">2x</option>
                  <option value="3x">3x</option>
                  <option value="5x">5x</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Travel</label>
                <select {...register('travel')} className="border rounded px-3 py-2 w-full">
                  <option value="1x">1x</option>
                  <option value="2x">2x</option>
                  <option value="3x">3x</option>
                  <option value="5x">5x</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Online Shopping</label>
                <select {...register('online_shopping')} className="border rounded px-3 py-2 w-full">
                  <option value="1x">1x</option>
                  <option value="2x">2x</option>
                  <option value="3x">3x</option>
                  <option value="5x">5x</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Everything Else</label>
                <select {...register('everything_else')} className="border rounded px-3 py-2 w-full">
                  <option value="1x">1x</option>
                  <option value="1.5x">1.5x</option>
                  <option value="2x">2x</option>
                </select>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Card'}
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
