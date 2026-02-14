import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LLMSettings } from '@/types';

interface SettingsState extends LLMSettings {
  connectionStatus: 'disconnected' | 'connected' | 'error';
  availableModels: string[];
  updateSettings: (settings: Partial<LLMSettings>) => void;
  setConnectionStatus: (status: 'disconnected' | 'connected' | 'error') => void;
  setAvailableModels: (models: string[]) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Default LLM connection settings
      baseURL: 'http://localhost:1234/v1',
      apiKey: '',
      model: '',
      connectionStatus: 'disconnected',
      availableModels: [],

      // Actions
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      setConnectionStatus: (status) => set({ connectionStatus: status }),
      setAvailableModels: (models) => set({ availableModels: models }),
    }),
    {
      name: 'storyteller-settings',
    }
  )
);
