import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface FavoriteBusiness {
  id: string;
  name: string;
}

interface FavoritesState {
  items: FavoriteBusiness[];
  add: (b: FavoriteBusiness) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (b) => set((s) => (get().has(b.id) ? s : { items: [...s.items, b] })),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      has: (id) => get().items.some((x) => x.id === id),
    }),
    {
      name: 'favoritesStore',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

// Ensure this is recognized as a module
export {};
