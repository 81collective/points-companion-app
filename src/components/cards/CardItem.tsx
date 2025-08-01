// CardItem.tsx: displays a single credit card
import React from 'react'
import { CreditCard } from './types'

const CardItem: React.FC<{ card: CreditCard }> = ({ card }) => {
  return (
    <div className="bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-xl shadow p-6 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-lg text-blue-700">{card.card_name}</span>
        <span className="text-gray-500">•••• {card.last_four}</span>
      </div>
      <div className="mt-2">
        <span className="font-medium text-sm text-purple-700">Rewards Structure:</span>
        <pre className="bg-gray-50 rounded p-2 text-xs text-gray-700 whitespace-pre-wrap mt-1">
          {JSON.stringify(card.rewards_structure, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default CardItem
