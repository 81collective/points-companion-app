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
    <div className="rounded-lg border border-gray-200 bg-white p-2.5 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" data-mobile-two-line>
        {/* Top line: Business name */}
        <div className="min-w-0 w-full">
          <span className="block font-medium text-gray-900 text-[15px] leading-5 break-words">{name}</span>
        </div>

        {/* Second line: rating, distance, actions */}
        <div className="flex w-full items-center gap-1 flex-nowrap mt-1 sm:mt-0 sm:gap-2 sm:flex-wrap">
          {typeof rating === 'number' && (
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200 whitespace-nowrap"
              aria-label={`Rating ${rating.toFixed(1)} out of 5`}
              title={`Rating ${rating.toFixed(1)}/5`}
            >
              <Star className="w-3 h-3 fill-current text-yellow-500" />
              {rating.toFixed(1)}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap"
            aria-label={typeof distance === 'number' ? `Distance ${distance < 1609.34 ? `${Math.round(distance * 3.28084)} feet` : `${(distance * 0.000621371).toFixed(1)} miles`}` : 'Distance unknown'}
            title={typeof distance === 'number' ? (distance < 1609.34 ? `${Math.round(distance * 3.28084)} ft` : `${(distance * 0.000621371).toFixed(1)} mi`) : 'Unknown distance'}
          >
            <MapPin className="w-3 h-3" />
            {typeof distance === 'number' ? (distance < 1609.34 ? `${Math.round(distance * 3.28084)}ft` : `${(distance * 0.000621371).toFixed(1)}mi`) : '—'}
          </span>

          {/* Actions aligned to the end on the line */}
          <div className="ms-auto flex items-center gap-1 sm:gap-2 sm:ms-0 sm:ml-0">
            <button
              type="button"
              onClick={() => (fav ? remove(id) : add({ id, name }))}
              aria-pressed={fav}
              aria-label={`${fav ? 'Unsave' : 'Save'} ${name}`}
              title={`${fav ? 'Unsave' : 'Save'} ${name}`}
              className={`px-2 py-1 h-7 text-[11px] leading-none rounded-md border active:scale-[0.98] transition sm:px-3 sm:py-1.5 sm:h-9 sm:text-xs sm:rounded-lg ${fav ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-white border-gray-300 text-gray-700'}`}
            >
              {fav ? '★ Saved' : '☆ Save'}
            </button>
            <button
              type="button"
              onClick={onSelect}
              aria-label={`Select ${name}`}
              title={`Select ${name}`}
              className="px-2 py-1 h-7 text-[11px] leading-none rounded-md bg-blue-600 text-white active:scale-[0.98] transition sm:px-3 sm:py-1.5 sm:h-9 sm:text-xs sm:rounded-lg"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

NearbyRow.displayName = 'NearbyRow';

export default NearbyRow;
