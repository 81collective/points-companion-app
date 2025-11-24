import React from 'react';
import ChatBubble from '@/components/chat/ChatBubble';
import { useFavoritesStore, FavoriteBusiness } from '@/stores/favoritesStore';

interface FavoritesListProps {
  onSelect: (id: string, name: string) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = React.memo(({ onSelect }) => {
  const { items, remove } = useFavoritesStore();
  
  if (!items.length) {
    return (
      <ChatBubble 
        sender="assistant" 
        message="Your favorites" 
        richContent={<div className="text-xs text-gray-600">No favorites yet</div>} 
      />
    );
  }

  return (
    <ChatBubble
      sender="assistant"
      message="Your favorites"
      richContent={(
        <div className="mt-1 flex flex-col gap-2">
          {items.map((b: FavoriteBusiness) => (
            <div key={b.id} className="rounded-md border p-2 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 w-full">
                  <span className="block font-medium text-gray-900 text-[15px] leading-5 break-words">{b.name}</span>
                </div>
                <div className="flex w-full items-center gap-2 mt-1 sm:mt-0">
                  <div className="ms-auto flex items-center gap-2 sm:ms-0 sm:ml-0">
                    <button type="button" onClick={() => onSelect(b.id, b.name)} className="px-3 py-1.5 min-h-9 text-xs rounded-lg bg-blue-600 text-white">Select</button>
                    <button type="button" onClick={() => remove(b.id)} className="px-3 py-1.5 min-h-9 text-xs rounded-lg border border-gray-300">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    />
  );
});

FavoritesList.displayName = 'FavoritesList';

  // Explicit module marker
  export {};

export default FavoritesList;
