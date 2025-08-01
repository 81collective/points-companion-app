// EditCardModal.tsx: modal for editing a credit card
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreditCard } from './types'
import { createClient } from '@/lib/supabase'
import * as Dialog from '@radix-ui/react-dialog'

const cardSchema = z.object({
  card_name: z.string().min(2, 'Card name required'),
  last_four: z.string().regex(/^\d{4}$/, 'Must be 4 digits'),
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
      card_name: card.card_name,
      last_four: card.last_four,
      dining: (typeof card.rewards_structure.dining === 'string' ? card.rewards_structure.dining : '1x') as '1x' | '2x' | '3x' | '5x',
      gas: (typeof card.rewards_structure.gas === 'string' ? card.rewards_structure.gas : '1x') as '1x' | '2x' | '3x' | '5x',
      groceries: (typeof card.rewards_structure.groceries === 'string' ? card.rewards_structure.groceries : '1x') as '1x' | '2x' | '3x' | '5x',
      travel: (typeof card.rewards_structure.travel === 'string' ? card.rewards_structure.travel : '1x') as '1x' | '2x' | '3x' | '5x',
      online_shopping: (typeof card.rewards_structure.online_shopping === 'string' ? card.rewards_structure.online_shopping : '1x') as '1x' | '2x' | '3x' | '5x',
      everything_else: (typeof card.rewards_structure.everything_else === 'string' ? card.rewards_structure.everything_else : '1x') as '1x' | '1.5x' | '2x',
    } : undefined
  });
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (card) {
      reset({
        card_name: card.card_name,
        last_four: card.last_four,
        dining: (typeof card.rewards_structure.dining === 'string' ? card.rewards_structure.dining : '1x') as '1x' | '2x' | '3x' | '5x',
        gas: (typeof card.rewards_structure.gas === 'string' ? card.rewards_structure.gas : '1x') as '1x' | '2x' | '3x' | '5x',
        groceries: (typeof card.rewards_structure.groceries === 'string' ? card.rewards_structure.groceries : '1x') as '1x' | '2x' | '3x' | '5x',
        travel: (typeof card.rewards_structure.travel === 'string' ? card.rewards_structure.travel : '1x') as '1x' | '2x' | '3x' | '5x',
        online_shopping: (typeof card.rewards_structure.online_shopping === 'string' ? card.rewards_structure.online_shopping : '1x') as '1x' | '2x' | '3x' | '5x',
        everything_else: (typeof card.rewards_structure.everything_else === 'string' ? card.rewards_structure.everything_else : '1x') as '1x' | '1.5x' | '2x',
      })
    }
  }, [card, reset])

  const onSubmit = async (values: CardFormValues) => {
    setError('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('credit_cards').update({
        card_name: values.card_name,
        last_four: values.last_four,
        rewards_structure: {
          dining: values.dining,
          gas: values.gas,
          groceries: values.groceries,
          travel: values.travel,
          online_shopping: values.online_shopping,
          everything_else: values.everything_else,
        },
      }).eq('id', card?.id).select().single();
      if (error) throw error;
      onUpdate(data as CreditCard);
      onClose();
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError((err as { message?: string }).message || 'Failed to update card');
      } else {
        setError('Failed to update card');
      }
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
