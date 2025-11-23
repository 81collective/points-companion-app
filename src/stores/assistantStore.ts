import { create } from 'zustand';
import type { Recommendation } from '@/types/recommendation.types';

type AssistantContext = {
  mode: 'quick' | 'planning';
  category: string;
  place?: string;
};

interface AssistantState {
  latestRecs: Recommendation[];
  context: AssistantContext | null;
  setPicks: (recs: Recommendation[], ctx: AssistantContext) => void;
  clear: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  latestRecs: [],
  context: null,
  setPicks: (recs, ctx) => set({ latestRecs: recs, context: ctx }),
  clear: () => set({ latestRecs: [], context: null }),
}));
