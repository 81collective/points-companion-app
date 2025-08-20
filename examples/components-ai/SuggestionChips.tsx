'use client';
import React from 'react';

export function SuggestionChips({ items, onPick }: { items: string[]; onPick: (s: string) => void }) {
  if (!items?.length) return null;
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 animate-[fadeIn_200ms_ease-out]" aria-label="Suggestions">
      {items.map((s, i) => (
        <button
          key={i}
          onClick={() => onPick(s)}
          className="shrink-0 px-3 py-1.5 text-xs rounded-full border border-[#1976D2] text-[#1976D2] bg-white hover:bg-blue-50 active:bg-blue-100 transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
