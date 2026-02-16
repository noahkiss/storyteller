import { create } from 'zustand';
import { LibraryItemType } from '@/types';

interface LibraryState {
  activeItemId: string | null;
  activeItemType: LibraryItemType | null;
  setActiveItem: (id: string | null, type: LibraryItemType | null) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  // Current library item being edited in the textarea
  activeItemId: null,
  activeItemType: null,

  // Actions
  setActiveItem: (id, type) => set({ activeItemId: id, activeItemType: type }),
}));
