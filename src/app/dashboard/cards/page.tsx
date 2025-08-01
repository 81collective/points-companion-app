// /dashboard/cards page: displays user's credit cards
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import CardList from '@/components/cards/CardList'
import AddCardModal from '@/components/cards/AddCardModal'
import EditCardModal from '@/components/cards/EditCardModal'
import DeleteCardDialog from '@/components/cards/DeleteCardDialog'
import { CreditCard as CreditCardIcon } from 'lucide-react'
import { CreditCard } from '@/components/cards/types'
import { Loader2 } from 'lucide-react'

export default function CardsPage() {
  const { user } = useAuth()
  const [cards, setCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editCard, setEditCard] = useState<CreditCard | null>(null)
  const [deleteCard, setDeleteCard] = useState<CreditCard | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string>('')

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

  useEffect(() => {
    fetchCards()
    // eslint-disable-next-line
  }, [user])

  const handleAddCard = async (newCard: CreditCard) => {
    setCards([newCard, ...cards])
    setShowAddModal(false)
    setFeedback('Card added successfully!')
    await fetchCards()
  }

  const handleEditCard = async (updatedCard: CreditCard) => {
    setEditCard(null)
    setFeedback('Card updated successfully!')
    await fetchCards()
  }

  const handleDeleteCard = async () => {
    if (!deleteCard) return
    setActionLoadingId(deleteCard.id)
    setFeedback('')
    try {
      const supabase = createClient()
      const { error } = await supabase.from('credit_cards').delete().eq('id', deleteCard.id)
      if (error) throw error
      setFeedback('Card deleted successfully!')
      setDeleteCard(null)
      await fetchCards()
    } catch (err: unknown) {
      setFeedback('Failed to delete card.')
    }
    setActionLoadingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">My Credit Cards</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            onClick={() => setShowAddModal(true)}
          >
            Add New Card
          </button>
        </div>
        {feedback && <div className="mb-4 text-center text-sm text-green-600 animate-fade-in">{feedback}</div>}
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 flex items-center text-sm text-gray-500 gap-2" aria-label="Breadcrumb">
          <a href="/dashboard" className="hover:text-blue-700">Dashboard</a>
          <span>/</span>
          <span className="text-gray-700 font-medium">My Cards</span>
        </nav>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-2xl shadow p-6 min-w-[260px] max-w-md w-full h-40 flex flex-col justify-between">
                <div className="h-6 bg-blue-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-purple-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCardIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No cards added yet</p>
            <p className="text-sm mt-1">Add your credit cards to start getting personalized recommendations</p>
          </div>
        ) : (
          <CardList
            cards={cards}
            onEdit={card => setEditCard(card)}
            onDelete={card => setDeleteCard(card)}
            loadingId={actionLoadingId}
          />
        )}
      </div>
      <AddCardModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddCard} userId={user?.id} />
      <EditCardModal open={!!editCard} onClose={() => setEditCard(null)} card={editCard} onUpdate={handleEditCard} />
      <DeleteCardDialog open={!!deleteCard} onClose={() => setDeleteCard(null)} onDelete={handleDeleteCard} loading={!!actionLoadingId} />
    </div>
  )
}
