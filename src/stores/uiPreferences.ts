import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UIPreferencesState = {
  showNearbyCategoryChip: boolean;
  showNearbyCardChip: boolean;
  setShowNearbyCategoryChip: (value: boolean) => void;
  setShowNearbyCardChip: (value: boolean) => void;
};

export const useUIPreferences = create<UIPreferencesState>()(
  persist(
    (set) => ({
      showNearbyCategoryChip: true,
      showNearbyCardChip: true,
      setShowNearbyCategoryChip: (value) => set({ showNearbyCategoryChip: value }),
      setShowNearbyCardChip: (value) => set({ showNearbyCardChip: value }),
    }),
    { name: 'ui-preferences' }
  )
);

// Ensure module
export {};
