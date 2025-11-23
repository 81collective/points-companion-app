"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CardList from '@/components/cards/CardList';
import AddCardModal from '@/components/cards/AddCardModal';
import EditCardModal from '@/components/cards/EditCardModal';
import DeleteCardDialog from '@/components/cards/DeleteCardDialog';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { CreditCard } from '@/components/cards/types';

export default function CardsSection() {
  const { user } = useAuth();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCard, setEditCard] = useState<CreditCard | null>(null);
  const [deleteCard, setDeleteCard] = useState<CreditCard | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const fetchCards = useCallback(async () => {
    if (!user) {
      setCards([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/cards', { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Unable to load cards');
      }
      const payload = (await response.json()) as { cards?: CreditCard[] };
      setCards(payload.cards || []);
    } catch (error) {
      console.error('[cards] fetch failed', error);
      setFeedback('Unable to load cards right now.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(()=>{ fetchCards(); }, [fetchCards]);

  const handleAddCard = async (newCard: CreditCard) => {
    setCards([newCard, ...cards]);
    setShowAddModal(false);
    setFeedback('Card added successfully!');
    await fetchCards();
  };
  const handleEditCard = async () => { setEditCard(null); setFeedback('Card updated successfully!'); await fetchCards(); };
  const handleDeleteCard = async () => {
    if (!deleteCard) return;
    setActionLoadingId(deleteCard.id);
    setFeedback('');
    try {
      const response = await fetch(`/api/cards/${deleteCard.id}`, { method: 'DELETE', credentials: 'include' });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Unable to delete card');
      }
      setFeedback('Card deleted successfully!');
      setDeleteCard(null);
      await fetchCards();
    } catch (error) {
      console.error('[cards] delete failed', error);
      setFeedback('Failed to delete card.');
    }
    setActionLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Credit Cards</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition" onClick={()=>setShowAddModal(true)}>Add Card</button>
      </div>
      {feedback && <div className="text-sm text-green-600">{feedback}</div>}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(2)].map((_,i)=> <div key={i} className="animate-pulse bg-gradient-to-br from-blue-100 via-white to-purple-100 rounded-xl shadow p-6 h-40" />)}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <CreditCardIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No cards added yet</p>
          <p className="text-sm mt-1">Add your credit cards to get recommendations.</p>
        </div>
      ) : (
        <CardList cards={cards} onEdit={c=>setEditCard(c)} onDelete={c=>setDeleteCard(c)} loadingId={actionLoadingId} />
      )}
      <AddCardModal open={showAddModal} onClose={()=>setShowAddModal(false)} onAdd={handleAddCard} />
      <EditCardModal open={!!editCard} onClose={()=>setEditCard(null)} card={editCard} onUpdate={handleEditCard} />
      <DeleteCardDialog open={!!deleteCard} onClose={()=>setDeleteCard(null)} onDelete={handleDeleteCard} loading={!!actionLoadingId} />
    </div>
  );
}
