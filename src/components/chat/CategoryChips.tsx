import React from 'react';

interface CategoryChipsProps {
  onSelect: (key: string) => void;
  selectedCategory?: string;
}

const DEFAULT_CATEGORIES = [
  { key: 'dining', label: 'Dining', icon: '🍽️', teaser: 'up to 4x back' },
  { key: 'groceries', label: 'Groceries', icon: '🛒', teaser: 'up to 6% back' },
  { key: 'gas', label: 'Gas', icon: '⛽', teaser: 'up to 5% back' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️', teaser: 'up to 5% back' },
  { key: 'travel', label: 'Travel', icon: '✈️', teaser: 'up to 5x back' },
];

export default function CategoryChips({ onSelect, selectedCategory }: CategoryChipsProps) {
  const handleChipClick = (key: string) => {
    onSelect(key);
    // Add a small delay to ensure the click feedback is visible
    setTimeout(() => {
      // The scroll will be handled by the parent component
    }, 50);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DEFAULT_CATEGORIES.map((c) => {
        const isSelected = selectedCategory === c.key;
        return (
          <button
            key={c.key}
            onClick={() => handleChipClick(c.key)}
            className={`px-3 py-1.5 rounded-full border text-sm transition-all duration-200 ${
              isSelected
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <span className="mr-1">{c.icon}</span>
            {c.label}
            <span className={`ml-1 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
              ({c.teaser})
            </span>
          </button>
        );
      })}
    </div>
  );
}
