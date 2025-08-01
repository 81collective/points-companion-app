// AddCardModal.tsx: modal for adding a new credit card
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase'
import * as Dialog from '@radix-ui/react-dialog'
import { CreditCard, RewardsStructure } from './types'

interface AddCardModalProps {
  open: boolean
  onClose: () => void
  onAdd: (card: CreditCard) => void
  userId: string | undefined
}

const AddCardModal: React.FC<AddCardModalProps> = ({ open, onClose, onAdd, userId }) => {
  const [cardName, setCardName] = useState('')
  const [lastFour, setLastFour] = useState('')
  const [rewardsStructure, setRewardsStructure] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const rewardsJson: RewardsStructure = rewardsStructure ? JSON.parse(rewardsStructure) : {}
      const supabase = createClient()
      const { data, error } = await supabase.from('credit_cards').insert([
        {
          user_id: userId,
          card_name: cardName,
          last_four: lastFour,
          rewards_structure: rewardsJson,
        }
      ]).select().single()
      if (error) throw error
      onAdd(data as CreditCard)
      setCardName('')
      setLastFour('')
      setRewardsStructure('')
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setError((err as { message?: string }).message || 'Failed to add card')
      } else {
        setError('Failed to add card')
      }
    }
    setLoading(false)
  }

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
            <input
              type="text"
              placeholder="Card Name"
              className="border rounded px-3 py-2"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last 4 Digits"
              className="border rounded px-3 py-2"
              value={lastFour}
              onChange={e => setLastFour(e.target.value)}
              maxLength={4}
              required
            />
            <textarea
              placeholder="Rewards Structure (JSON)"
              className="border rounded px-3 py-2 h-24"
              value={rewardsStructure}
              onChange={e => setRewardsStructure(e.target.value)}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex-1"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Card'}
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
  )
}

export default AddCardModal
