'use client';
import React from 'react';

export function SuggestionChips({ items, onPick }: { items: string[]; onPick: (s: string) => void }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s, i) => (
        <button key={i} onClick={() => onPick(s)} className="px-3 py-1.5 text-xs rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200">
          {s}
        </button>
      ))}
    </div>
  );
}
