import React from 'react';

interface CategoryChipsProps {
  onSelect: (key: string) => void;
}

const DEFAULT_CATEGORIES = [
  { key: 'dining', label: 'Dining', icon: '🍽️', teaser: 'up to 4x back' },
  { key: 'groceries', label: 'Groceries', icon: '🛒', teaser: 'up to 6% back' },
  { key: 'gas', label: 'Gas', icon: '⛽', teaser: 'up to 5% back' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', teaser: 'up to 5% back' },
  { key: 'travel', label: 'Travel', icon: '✈️', teaser: 'up to 5x back' },
];

export default function CategoryChips({ onSelect }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DEFAULT_CATEGORIES.map((c) => (
        <button
          key={c.key}
          onClick={() => onSelect(c.key)}
          className="px-3 py-1.5 rounded-full border border-gray-300 bg-white text-sm hover:border-blue-400 hover:bg-blue-50"
        >
          <span className="mr-1">{c.icon}</span>
          {c.label}
          <span className="ml-1 text-gray-500">({c.teaser})</span>
        </button>
      ))}
    </div>
  );
}
