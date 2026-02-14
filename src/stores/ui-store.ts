import { create } from 'zustand';

interface UIState {
  activeTab: string;
  leftPaneWidth: number;
  contextVizExpanded: boolean;
  setActiveTab: (tab: string) => void;
  setLeftPaneWidth: (width: number) => void;
  setContextVizExpanded: (expanded: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial UI state
  activeTab: 'generation',
  leftPaneWidth: 300,
  contextVizExpanded: false,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLeftPaneWidth: (width) => set({ leftPaneWidth: width }),
  setContextVizExpanded: (expanded) => set({ contextVizExpanded: expanded }),
}));
