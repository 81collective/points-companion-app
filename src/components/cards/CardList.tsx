// CardList.tsx: displays a list of credit cards
import React from 'react'
import CardItem from './CardItem'
import { CreditCard } from './types'

interface CardListProps {
  cards: CreditCard[]
}

const CardList: React.FC<CardListProps> = ({ cards }) => {
  if (!cards.length) {
    return <div className="text-center text-gray-500">No cards found.</div>
  }
  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
      {cards.map(card => (
        <CardItem key={card.id} card={card} />
      ))}
    </div>
  )
}

export default CardList
