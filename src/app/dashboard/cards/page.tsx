// /dashboard/cards page: displays user's credit cards
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import CardList from '@/components/cards/CardList'
import AddCardModal from '@/components/cards/AddCardModal'
import { CreditCard } from '@/components/cards/types'
import { Loader2 } from 'lucide-react'

export default function CardsPage() {
  const { user } = useAuth()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function fetchCards() {
      if (!user) return
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setCards((data as CreditCard[]) || [])
      setLoading(false)
    }
    fetchCards()
  }, [user])

  const handleAddCard = (newCard: CreditCard) => {
    setCards([newCard, ...cards])
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">My Credit Cards</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            onClick={() => setShowModal(true)}
          >
            Add New Card
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <CardList cards={cards} />
        )}
      </div>
      <AddCardModal open={showModal} onClose={() => setShowModal(false)} onAdd={handleAddCard} userId={user?.id} />
    </div>
  )
}
