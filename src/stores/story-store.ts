// Story state management
// Tracks which story is currently active for editing

import { create } from 'zustand';

interface StoryState {
  activeStoryId: string | null;
  setActiveStory: (id: string | null) => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  activeStoryId: null,
  setActiveStory: (id) => set({ activeStoryId: id })
}));
