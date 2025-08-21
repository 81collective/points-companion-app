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
    <div className="flex items-center justify-between rounded-md border p-2 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="truncate max-w-[50%]">{name}</span>
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
      </div>
      <div className="flex items-center gap-2">
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
  );
});

NearbyRow.displayName = 'NearbyRow';

export default NearbyRow;
