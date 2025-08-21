import React from 'react';
import ChatBubble from '@/components/chat/ChatBubble';
import { useFavoritesStore } from '@/stores/favoritesStore';

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
          {items.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <span className="truncate max-w-[55%]">{b.name}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onSelect(b.id, b.name)} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Select</button>
                <button type="button" onClick={() => remove(b.id)} className="px-2 py-1 text-xs rounded border border-gray-300">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    />
  );
});

FavoritesList.displayName = 'FavoritesList';

export default FavoritesList;
