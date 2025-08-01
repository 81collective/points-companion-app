// EditCardModal.tsx: modal for editing a credit card
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard } from './types'
import { createClient } from '@/lib/supabase'
import * as Dialog from '@radix-ui/react-dialog'

const cardSchema = z.object({
  name: z.string()
    .min(2, 'Card name required')
    .max(32, 'Card name too long')
    .regex(/^[a-zA-Z0-9 .,'-]+$/, 'Card name contains invalid characters'),
  last4: z.string().regex(/^\d{4}$/, 'Last 4 digits must be exactly 4 numbers'),
  dining: z.enum(["1x", "2x", "3x", "5x"]),
  gas: z.enum(["1x", "2x", "3x", "5x"]),
  groceries: z.enum(["1x", "2x", "3x", "5x"]),
  travel: z.enum(["1x", "2x", "3x", "5x"]),
  online_shopping: z.enum(["1x", "2x", "3x", "5x"]),
  everything_else: z.enum(["1x", "1.5x", "2x"]),
});

type CardFormValues = z.infer<typeof cardSchema>;

interface EditCardModalProps {
  open: boolean
  onClose: () => void
  card: CreditCard | null
  onUpdate: (card: CreditCard) => void
}

const EditCardModal: React.FC<EditCardModalProps> = ({ open, onClose, card, onUpdate }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: card ? {
      name: card.name,
      last4: card.last4,
      dining: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('dining:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
      gas: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('gas:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
      groceries: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('groceries:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
      travel: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('travel:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
      online_shopping: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('online_shopping:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
      everything_else: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('everything_else:'))?.split(':')[1] || '1x') as '1x' | '1.5x' | '2x',
    } : undefined
  });
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (card) {
      reset({
        name: card.name,
        last4: card.last4,
        dining: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('dining:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
        gas: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('gas:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
        groceries: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('groceries:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
        travel: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('travel:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
        online_shopping: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('online_shopping:'))?.split(':')[1] || '1x') as '1x' | '2x' | '3x' | '5x',
        everything_else: (Array.isArray(card.rewards) && card.rewards.find(r => r.startsWith('everything_else:'))?.split(':')[1] || '1x') as '1x' | '1.5x' | '2x',
      })
    }
  }, [card, reset])

  const sanitizeCardName = (name: string) => name.replace(/[^a-zA-Z0-9 .,'-]/g, '').trim();
  const onSubmit = async (values: CardFormValues) => {
    setError('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('credit_cards').update({
        name: sanitizeCardName(values.name),
        last4: values.last4,
        rewards: [
          `dining:${values.dining}`,
          `gas:${values.gas}`,
          `groceries:${values.groceries}`,
          `travel:${values.travel}`,
          `online_shopping:${values.online_shopping}`,
          `everything_else:${values.everything_else}`,
        ],
      }).eq('id', card?.id).select().single();
      if (error) {
        setError('Unable to update card. Please try again or contact support.');
        console.error('Edit card error:', error);
        return;
      }
      onUpdate(data as CreditCard);
      onClose();
    } catch (err: unknown) {
      setError('Network error. Please check your connection and try again.');
      console.error('Edit card network error:', err);
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
            <h2 className="text-xl font-bold text-blue-700 mb-2">Edit Card</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Card Name</label>
              <input
                type="text"
                {...register('name')}
                className="border rounded px-3 py-2 w-full"
                placeholder="Card Name"
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last 4 Digits</label>
              <input
                type="text"
                {...register('last4')}
                className="border rounded px-3 py-2 w-full"
                placeholder="1234"
                maxLength={4}
                inputMode="numeric"
              />
              {errors.last4 && <span className="text-red-500 text-xs">{errors.last4.message}</span>}
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
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

export default EditCardModal
