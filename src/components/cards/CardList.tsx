// CardList.tsx: Airbnb-inspired credit cards list
import React from 'react'
import CreditCardItem from './CreditCardItem'
import { CreditCard } from './types'
import { CreditCard as CreditCardIcon, Plus } from 'lucide-react'

interface CardListProps {
  cards: CreditCard[]
  onEdit: (card: CreditCard) => void
  onDelete: (card: CreditCard) => void
  onAddCard?: () => void
  loadingId?: string | null
}

const CardList: React.FC<CardListProps> = ({ cards, onEdit, onDelete, onAddCard, loadingId }) => {
  if (!cards.length) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <CreditCardIcon className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No credit cards yet</h3>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto leading-relaxed">
          Add your first credit card to start getting personalized recommendations and maximize your rewards.
        </p>
        {onAddCard && (
          <button
            onClick={onAddCard}
            className="inline-flex items-center px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Your First Card
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, index) => (
          <div 
            key={card.id} 
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CreditCardItem
              card={card}
              onEdit={() => onEdit(card)}
              onDelete={() => onDelete(card)}
              loading={loadingId === card.id}
            />
          </div>
        ))}
        
        {/* Add Card Button */}
        {onAddCard && (
          <div className="animate-fade-in" style={{ animationDelay: `${cards.length * 0.1}s` }}>
            <button
              onClick={onAddCard}
              className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-200 hover:border-rose-300 rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-200 hover:bg-rose-50 group"
            >
              <div className="w-16 h-16 bg-gray-100 group-hover:bg-rose-100 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <Plus className="h-8 w-8 text-gray-400 group-hover:text-rose-500 transition-colors" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Card</h3>
              <p className="text-sm text-gray-500 text-center">
                Expand your rewards potential with another card
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {cards.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{cards.length}</div>
              <div className="text-sm text-gray-600">Active Cards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {cards.filter(card => card.rewards && card.rewards.length > 0).length}
              </div>
              <div className="text-sm text-gray-600">With Rewards</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {cards.reduce((total, card) => total + (card.rewards?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Categories</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CardList
