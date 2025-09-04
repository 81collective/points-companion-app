import React from 'react';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { MapPin, Star } from 'lucide-react';

interface NearbyRowProps {
  id: string;
  name: string;
  rating?: number;
  distance?: number;
  onSelect: () => void;
}

const NearbyRow: React.FC<NearbyRowProps> = React.memo(({ id, name, rating, distance, onSelect }) => {
  const { add, remove, has } = useFavoritesStore();
  const fav = has(id);

  return (
    <div className="rounded-md border p-2 text-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        {/* Top line: Business name */}
        <div className="min-w-0">
          <span className="block truncate font-medium text-gray-900">{name}</span>
        </div>

        {/* Second line: rating, distance, actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {typeof rating === 'number' && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
              <Star className="w-3 h-3 fill-current text-yellow-500" />
              {rating.toFixed(1)}
            </span>
          )}
          {typeof distance === 'number' && (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
              <MapPin className="w-3 h-3" />
              {distance < 1609.34 ? `${Math.round(distance * 3.28084)}ft` : `${(distance * 0.000621371).toFixed(1)}mi`}
            </span>
          )}

          {/* Actions aligned to the end on the line */}
          <div className="ms-auto flex items-center gap-2 sm:ms-0 sm:ml-0">
            <button
              type="button"
              onClick={() => (fav ? remove(id) : add({ id, name }))}
              aria-pressed={fav}
              className={`px-2 py-1 text-xs rounded border ${fav ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-gray-300 text-gray-700'}`}
            >
              {fav ? '★ Saved' : '☆ Save'}
            </button>
            <button type="button" onClick={onSelect} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Select</button>
          </div>
        </div>
      </div>
    </div>
  );
});

NearbyRow.displayName = 'NearbyRow';

export default NearbyRow;
