import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LLMSettings, GenerationParams } from '@/types';

// Runtime config injected by Docker entrypoint (env vars)
const runtimeConfig = (window as any).__STORYTELLER_CONFIG__ as
  | { baseURL?: string; apiKey?: string; model?: string }
  | undefined;

interface SettingsState extends LLMSettings {
  connectionStatus: 'disconnected' | 'connected' | 'error';
  connectionError: string | null;
  availableModels: string[];
  generationParams: GenerationParams;
  updateSettings: (settings: Partial<LLMSettings>) => void;
  setConnectionStatus: (status: 'disconnected' | 'connected' | 'error', error?: string) => void;
  setAvailableModels: (models: string[]) => void;
  updateGenerationParams: (params: Partial<GenerationParams>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default LLM connection settings (runtime config overrides defaults)
      baseURL: runtimeConfig?.baseURL || 'http://localhost:1234/v1',
      apiKey: runtimeConfig?.apiKey || '',
      model: runtimeConfig?.model || '',
      connectionStatus: 'disconnected',
      connectionError: null,
      availableModels: [],

      // Default generation parameters (Balanced preset)
      generationParams: {
        temperature: 0.7,
        maxTokens: 512,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      },

      // Actions
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      setConnectionStatus: (status, error) =>
        set({ connectionStatus: status, connectionError: error || null }),
      setAvailableModels: (models) => set({ availableModels: models }),
      updateGenerationParams: (params) =>
        set((state) => ({
          generationParams: { ...state.generationParams, ...params },
        })),
    }),
    {
      name: 'storyteller-settings',
    }
  )
);
