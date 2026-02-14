import { create } from 'zustand';
import type { ContextTier } from '@/types';

interface GenerationState {
  currentPrompt: string;
  currentOutput: string;
  contextTiers: ContextTier[];
  maxContextTokens: number;
  isEditing: boolean;
  lastError: string | null;

  // Actions
  setCurrentPrompt: (prompt: string) => void;
  appendToOutput: (chunk: string) => void;
  setOutput: (output: string) => void;
  setContextTiers: (tiers: ContextTier[]) => void;
  setMaxContextTokens: (tokens: number) => void;
  setIsEditing: (editing: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  // Default state
  currentPrompt: '',
  currentOutput: '',
  contextTiers: [],
  maxContextTokens: 4096,
  isEditing: false,
  lastError: null,

  // Actions
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  appendToOutput: (chunk) =>
    set((state) => ({ currentOutput: state.currentOutput + chunk })),
  setOutput: (output) => set({ currentOutput: output }),
  setContextTiers: (tiers) => set({ contextTiers: tiers }),
  setMaxContextTokens: (tokens) => set({ maxContextTokens: tokens }),
  setIsEditing: (editing) => set({ isEditing: editing }),
  setError: (error) => set({ lastError: error }),
  clearError: () => set({ lastError: null }),
  reset: () =>
    set({
      currentPrompt: '',
      currentOutput: '',
      contextTiers: [],
      isEditing: false,
      lastError: null,
    }),
}));
