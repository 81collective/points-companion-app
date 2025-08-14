// /dashboard/cards page: displays user's credit cards
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import CardList from '@/components/cards/CardList'
import AddCardModal from '@/components/cards/AddCardModal'
import EditCardModal from '@/components/cards/EditCardModal'
import DeleteCardDialog from '@/components/cards/DeleteCardDialog'
import { CreditCard } from '@/components/cards/types'
// import { Loader2 } from 'lucide-react'

export default function CardsPage() {
  const { user } = useAuth()
  const qs = useMemo(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null), [])
  const viewName = useMemo(() => qs?.get('name') || null, [qs])
  const preselectIssuer = useMemo(() => qs?.get('issuer') || null, [qs])
  const intentAdd = useMemo(() => qs?.get('add') === 'card', [qs])
  const intentView = useMemo(() => qs?.get('view') === 'card', [qs])
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

  // Open Add modal if navigated with add=card
  useEffect(() => {
    if (intentAdd && user) {
      setShowAddModal(true)
      setFeedback(viewName ? `Prefilling "${viewName}" — confirm details and save.` : 'Add a recommended card to your wallet.')
    }
    if (intentView && viewName) {
      setFeedback(`Viewing details: ${viewName}${preselectIssuer ? ` — ${preselectIssuer}` : ''}`)
      // In a future update, this can open a dedicated details modal
    }
     
  }, [intentAdd, intentView, viewName, preselectIssuer, user])

  const handleAddCard = async (newCard: CreditCard) => {
    setCards([newCard, ...cards])
    setShowAddModal(false)
    setFeedback('Card added successfully!')
    await fetchCards()
  }

  const handleEditCard = async () => {
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
    } catch {
      setFeedback('Failed to delete card.')
    }
    setActionLoadingId(null)
  }

  return (
    <div className="page-container py-8">
      {!user && !loading ? (
        <div className="max-w-xl mx-auto surface p-6 rounded-lg text-center space-y-4">
          <h1 className="text-xl font-semibold">Sign in to manage your wallet</h1>
          <p className="text-sm text-dim">Your saved cards live in your dashboard. Create a free account to add, edit, and optimize your wallet.</p>
          <div className="flex justify-center gap-3">
            <a href="/auth" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">Sign in / Create account</a>
            <a href="/dashboard" className="px-4 py-2 border text-sm rounded">Back to dashboard</a>
          </div>
        </div>
      ) : (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Credit Cards</h1>
            <p className="text-dim text-sm mt-1">Manage and optimize your wallet.</p>
          </div>
        </div>
  {feedback && <div className="text-center text-xs text-green-600">{feedback}</div>}
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-xs text-dim gap-2" aria-label="Breadcrumb">
          <a href="/dashboard" className="hover:text-[var(--color-text)]">Dashboard</a>
          <span>/</span>
          <span className="text-[var(--color-text)] font-medium">Cards</span>
        </nav>
        <div className="surface p-4 rounded-lg">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-md border border-[var(--color-border)] p-4 h-32 flex flex-col gap-3">
                  <div className="h-4 bg-gray-200/60 rounded w-1/2" />
                  <div className="h-3 bg-gray-200/40 rounded w-1/3" />
                  <div className="h-3 bg-gray-200/30 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <CardList
              cards={cards}
              onEdit={card => setEditCard(card)}
              onDelete={card => setDeleteCard(card)}
              loadingId={actionLoadingId}
              onAddCard={() => setShowAddModal(true)}
            />
          )}
        </div>
      </div>
  )}
  <AddCardModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddCard} userId={user?.id} initialName={viewName ?? undefined} initialIssuer={preselectIssuer ?? undefined} />
      <EditCardModal open={!!editCard} onClose={() => setEditCard(null)} card={editCard} onUpdate={handleEditCard} />
      <DeleteCardDialog open={!!deleteCard} onClose={() => setDeleteCard(null)} onDelete={handleDeleteCard} loading={!!actionLoadingId} />
    </div>
  )
}
