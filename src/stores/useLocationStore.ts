import { create } from 'zustand';
import { Business, Location } from '@/types/location.types';

interface LocationState {
  location: Location | null;
  permissionState: { granted: boolean; denied: boolean };
  businesses: Business[];
  error: string | null;
  loading: boolean;
  setLocation: (location: Location | null) => void;
  setPermissionState: (state: { granted: boolean; denied: boolean }) => void;
  setBusinesses: (businesses: Business[]) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  permissionState: { granted: false, denied: false },
  businesses: [],
  error: null,
  loading: false,
  setLocation: (location) => set({ location }),
  setPermissionState: (permissionState) => set({ permissionState }),
  setBusinesses: (businesses) => set({ businesses }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),
}));
