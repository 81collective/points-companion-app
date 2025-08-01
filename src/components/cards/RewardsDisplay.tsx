// RewardsDisplay.tsx: shows rewards structure with icons and color coding
import React from 'react'
import { Utensils, Fuel, ShoppingCart, Plane, ShoppingBag, Circle } from 'lucide-react'
import { RewardsStructure } from './types'

const categoryConfig = {
  dining: { label: 'Dining', icon: Utensils, color: 'bg-pink-200 text-pink-700' },
  gas: { label: 'Gas', icon: Fuel, color: 'bg-yellow-200 text-yellow-700' },
  groceries: { label: 'Groceries', icon: ShoppingCart, color: 'bg-green-200 text-green-700' },
  travel: { label: 'Travel', icon: Plane, color: 'bg-blue-200 text-blue-700' },
  online_shopping: { label: 'Online Shopping', icon: ShoppingBag, color: 'bg-purple-200 text-purple-700' },
  everything_else: { label: 'Everything Else', icon: Circle, color: 'bg-gray-200 text-gray-700' },
}

function getRewardColor(value: string) {
  switch (value) {
    case '5x': return 'bg-gradient-to-r from-purple-400 to-pink-400 text-white';
    case '3x': return 'bg-gradient-to-r from-blue-400 to-purple-400 text-white';
    case '2x': return 'bg-gradient-to-r from-green-400 to-blue-400 text-white';
    case '1.5x': return 'bg-gradient-to-r from-yellow-400 to-green-400 text-white';
    default: return 'bg-gray-100 text-gray-700';
  }
}

const RewardsDisplay: React.FC<{ rewards: RewardsStructure }> = ({ rewards }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {Object.entries(rewards).map(([key, value]) => {
        if (typeof value !== 'string' && typeof value !== 'number') return null;
        const config = categoryConfig[key as keyof typeof categoryConfig]
        if (!config) return null
        const Icon = config.icon
        return (
          <div key={key} className={`flex items-center gap-1 px-2 py-1 rounded-lg shadow-sm transition ${config.color} hover:scale-105`}>
            <Icon className="w-4 h-4" />
            <span className="font-medium text-xs">{config.label}</span>
            <span className={`ml-1 px-2 py-0.5 rounded ${getRewardColor(value as string)} font-bold text-xs`}>{value}</span>
          </div>
        )
      })}
    </div>
  )
}

export default RewardsDisplay
