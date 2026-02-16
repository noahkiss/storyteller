import { create } from 'zustand';

export type ActiveContentType =
  | 'library'
  | 'story-item'
  | 'outline'
  | 'ai-config'
  | 'template'
  | 'premise'
  | 'generation'
  | null;

interface ActiveContent {
  type: ActiveContentType;
  id: string | null;
  contentId: string | null;
}

interface UIState {
  activeTab: string;
  leftPaneWidth: number;
  contextVizExpanded: boolean;
  activeContent: ActiveContent;
  showAppSettings: boolean;
  setActiveTab: (tab: string) => void;
  setLeftPaneWidth: (width: number) => void;
  setContextVizExpanded: (expanded: boolean) => void;
  setActiveContent: (type: ActiveContentType, id: string | null, contentId?: string | null) => void;
  clearActiveContent: () => void;
  setShowAppSettings: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial UI state
  activeTab: 'stories',
  leftPaneWidth: 300,
  contextVizExpanded: false,
  activeContent: {
    type: null,
    id: null,
    contentId: null,
  },
  showAppSettings: false,

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setLeftPaneWidth: (width) => set({ leftPaneWidth: width }),
  setContextVizExpanded: (expanded) => set({ contextVizExpanded: expanded }),
  setActiveContent: (type, id, contentId) => set({
    activeContent: {
      type,
      id,
      contentId: contentId || (id ? `${type}-${id}` : null)
    }
  }),
  clearActiveContent: () => set({
    activeContent: { type: null, id: null, contentId: null }
  }),
  setShowAppSettings: (show) => set({ showAppSettings: show }),
}));
