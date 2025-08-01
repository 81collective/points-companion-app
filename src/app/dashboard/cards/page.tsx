// /dashboard/cards page: displays user's credit cards
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import CardList from '@/components/cards/CardList'
import AddCardModal from '@/components/cards/AddCardModal'
import EditCardModal from '@/components/cards/EditCardModal'
import DeleteCardDialog from '@/components/cards/DeleteCardDialog'
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
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
