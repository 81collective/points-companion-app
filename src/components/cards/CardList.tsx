// CardList.tsx: displays a list of credit cards
import React from 'react'
import CreditCardItem from './CreditCardItem'
import { CreditCard } from './types'

interface CardListProps {
  cards: CreditCard[]
  onEdit: (card: CreditCard) => void
  onDelete: (card: CreditCard) => void
  loadingId?: string | null
}

const CardList: React.FC<CardListProps> = ({ cards, onEdit, onDelete, loadingId }) => {
  if (!cards.length) {
    return <div className="text-center text-gray-500">No cards found.</div>
  }
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
      {cards.map(card => (
        <CreditCardItem
          key={card.id}
          card={card}
          onEdit={() => onEdit(card)}
          onDelete={() => onDelete(card)}
          loading={loadingId === card.id}
        />
      ))}
    </div>
  )
}

export default CardList
