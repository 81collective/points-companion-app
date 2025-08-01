// CreditCardItem.tsx: visually displays a credit card
import React from 'react'
import { CreditCard } from './types'
import RewardsDisplay from './RewardsDisplay'
import { Pencil, Trash2 } from 'lucide-react'

function getTopRewards(rewards: Record<string, string>) {
  // Get top 2-3 categories by reward value
  const sorted = Object.entries(rewards)
    .filter((entry) => typeof entry[1] === 'string')
    .sort((a, b) => parseFloat((b[1] as string)) - parseFloat((a[1] as string)))
  return sorted.slice(0, 3)
}

interface CreditCardItemProps {
  card: CreditCard
  onEdit: () => void
  onDelete: () => void
  loading?: boolean
}

const CreditCardItem: React.FC<CreditCardItemProps> = ({ card, onEdit, onDelete, loading }) => {
  const lastFour = card.last_four.padStart(4, '0')
  const topRewards = getTopRewards(card.rewards_structure as Record<string, string>)

  return (
    <div className="relative bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-2xl shadow-lg p-6 min-w-[260px] max-w-md w-full text-white transition-transform hover:scale-105 hover:shadow-2xl">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold tracking-wide drop-shadow">{card.card_name}</span>
        <div className="flex gap-2">
          <button
            className="bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full p-2 transition"
            title="Edit"
            onClick={onEdit}
            disabled={loading}
          >
            <Pencil className="w-4 h-4 text-white" />
          </button>
          <button
            className="bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full p-2 transition"
            title="Delete"
            onClick={onDelete}
            disabled={loading}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      <div className="text-xl font-mono tracking-widest mb-2">**** **** **** {lastFour}</div>
      <div className="mb-2">
        <span className="font-semibold text-sm">Top Rewards:</span>
        <div className="flex gap-2 mt-1">
          {topRewards.map(([cat, val]) => (
            <span key={cat} className="bg-white bg-opacity-20 rounded px-2 py-1 text-xs font-bold capitalize">
              {cat.replace('_', ' ')}: {val}
            </span>
          ))}
        </div>
      </div>
      <RewardsDisplay rewards={card.rewards_structure} />
    </div>
  )
}

export default CreditCardItem
