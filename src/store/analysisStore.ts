import { create } from 'zustand';
import type { AiResult } from '@types/models';

interface AnalysisState {
  lastResult: AiResult | null;
  setResult: (result: AiResult | null) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  lastResult: null,
  setResult: (result) => set({ lastResult: result }),
}));

