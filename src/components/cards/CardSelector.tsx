import React, { useState } from 'react';
import { creditCardDatabase } from '@/data/creditCardDatabase';
import { CreditCardTemplate } from '@/types/creditCards';

export default function CardSelector({ onSelect }: { onSelect: (card: CreditCardTemplate | null) => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CreditCardTemplate | null>(null);

  // Group cards by issuer
  const grouped = creditCardDatabase.reduce<Record<string, CreditCardTemplate[]>>((acc, card) => {
    acc[card.issuer] = acc[card.issuer] || [];
    acc[card.issuer].push(card);
    return acc;
  }, {});

  // Filter and sort
  const filtered = creditCardDatabase.filter(card => {
    const q = search.toLowerCase();
    return (
      card.name.toLowerCase().includes(q) ||
      card.issuer.toLowerCase().includes(q) ||
      (card.nickname && card.nickname.toLowerCase().includes(q))
    );
  });

  // Popular cards first, then alphabetical

  return (
    <div className="w-full">
      <input
        type="text"
        className="border rounded px-2 py-1 w-full mb-2"
        placeholder="Search cards by name, issuer, or rewards..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="max-h-64 overflow-y-auto border rounded bg-white">
        {Object.entries(grouped).map(([issuer, cards]) => (
          <div key={issuer} className="border-b">
            <div className="px-2 py-1 font-bold flex items-center gap-2">
              {/* TODO: Add issuer logo */}
              <span>{issuer}</span>
            </div>
            {cards.filter(card => filtered.includes(card)).map(card => (
              <div
                key={card.id}
                className={`px-2 py-2 flex items-center gap-3 cursor-pointer hover:bg-blue-50 ${selected?.id === card.id ? 'bg-blue-100' : ''}`}
                onClick={() => { setSelected(card); onSelect(card); }}
              >
                {/* TODO: Add card image/icon */}
                <span className="font-semibold">{card.name}</span>
                <span className="text-xs text-gray-500">{card.nickname}</span>
                <span className="text-xs text-gray-600">{card.rewards.map(r => `${r.multiplier}x ${r.category}`).join(', ')}</span>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && <div className="p-2 text-gray-500">No cards found.</div>}
      </div>
      <div className="mt-2">
        <button className="px-3 py-1 bg-primary text-white rounded" onClick={() => onSelect(null)}>
          Custom Card
        </button>
      </div>
    </div>
  );
}
