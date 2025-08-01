// CardItem.tsx: displays a single credit card
import React from 'react'
import { CreditCard } from './types'

const CardItem: React.FC<{ card: CreditCard }> = ({ card }) => {
  return (
    <div className="bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-xl shadow p-6 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg text-blue-700">{card.name}</span>
        <span className="text-gray-500">•••• {card.last4}</span>
      </div>
      <div className="mt-2">
        <span className="font-medium text-sm text-purple-700">Rewards:</span>
        <div className="bg-gray-50 rounded p-2 text-xs text-gray-700 mt-1">
          {card.rewards.map((reward, idx) => (
            <div key={idx}>{reward}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CardItem
