import { create } from 'zustand';
import type { AiResult } from '../types/models';

interface AnalysisState {
  lastResult: AiResult | null;
  lastInterpretation: string | null;
  setResult: (result: AiResult | null) => void;
  setInterpretation: (text: string | null) => void;
  clearAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  lastResult: null,
  lastInterpretation: null,
  setResult: (result) => set({ lastResult: result }),
  setInterpretation: (text) => set({ lastInterpretation: text }),
  clearAnalysis: () => set({ lastResult: null, lastInterpretation: null }),
}));

