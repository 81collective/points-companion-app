'use client';
import React from 'react';
import { MapPin } from 'lucide-react';

export function LocationConfirmation({ place, onConfirm }: { place?: string; onConfirm: () => void }) {
  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm">
      <div className="flex items-center gap-2 text-blue-800">
        <MapPin className="w-4 h-4" />
        {place ? <span>Are you at {place}?</span> : <span>Use your current location for better recs?</span>}
      </div>
      <button onClick={onConfirm} className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">Yes</button>
    </div>
  );
}
