// Outline CRUD operations using TanStack Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '@/services/db';
import type { Outline, LibraryReference, LibraryItem } from '@/types';
import { detectLibraryReferences } from '@/services/references';
import { v4 as uuidv4 } from 'uuid';

// Default outline template with chapter/scene structure
const DEFAULT_OUTLINE = `# Story Outline

## Chapter 1

### Scene 1
**Summary:**
**Characters:**
**Setting:**
**Mood:**

### Scene 2
**Summary:**
**Characters:**
**Setting:**
**Mood:**
`;

/**
 * Query outline for a story.
 * Returns the outline or null if it doesn't exist.
 * Disabled when storyId is null.
 */
export function useOutline(storyId: string | null) {
  return useQuery<Outline | null>({
    queryKey: ['outlines', storyId],
    queryFn: async () => {
      if (!storyId) return null;

      const db = await getDatabase();
      const result = db.exec('SELECT * FROM outlines WHERE story_id = ?', {
        bind: [storyId],
        returnValue: 'resultRows',
        rowMode: 'object'
      });
      return result?.[0] || null;
    },
    enabled: storyId !== null
  });
}

/**
 * Create a new outline for a story.
 * Uses default template content.
 */
export function useCreateOutline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      const db = await getDatabase();
      const now = Date.now();
      const id = uuidv4();

      db.exec(
        `INSERT INTO outlines (id, story_id, content, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        { bind: [id, storyId, DEFAULT_OUTLINE, now, now] }
      );

      return { id, story_id: storyId, content: DEFAULT_OUTLINE, created_at: now, updated_at: now };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['outlines', data.story_id] });
    }
  });
}

/**
 * Update outline content.
 * Updates the updated_at timestamp.
 */
export function useUpdateOutline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content, storyId }: { id: string; content: string; storyId: string }) => {
      const db = await getDatabase();
      const now = Date.now();

      db.exec(
        'UPDATE outlines SET content = ?, updated_at = ? WHERE id = ?',
        { bind: [content, now, id] }
      );

      return { id, content, storyId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['outlines', data.storyId] });
    }
  });
}

/**
 * Query outline references - auto-detected library item mentions.
 * Combines outline content with library items to detect references.
 * Uses 10s stale time to avoid recomputing on every keystroke.
 */
export function useOutlineReferences(storyId: string | null) {
  return useQuery<LibraryReference[]>({
    queryKey: ['outline-references', storyId],
    queryFn: async () => {
      if (!storyId) return [];

      const db = await getDatabase();

      // Fetch outline content
      const outlineResult = db.exec('SELECT content FROM outlines WHERE story_id = ?', {
        bind: [storyId],
        returnValue: 'resultRows',
        rowMode: 'object'
      });
      const outline = outlineResult?.[0];
      if (!outline) return [];

      // Fetch all library items (characters + settings)
      const libraryResult = db.exec(
        "SELECT * FROM library_items WHERE type IN ('character', 'setting') ORDER BY name",
        {
          returnValue: 'resultRows',
          rowMode: 'object'
        }
      );
      const libraryItems: LibraryItem[] = libraryResult || [];

      // Fetch story-forked items (they count too)
      const storyItemsResult = db.exec(
        'SELECT li.* FROM library_items li INNER JOIN story_items si ON li.id = si.library_id WHERE si.story_id = ?',
        {
          bind: [storyId],
          returnValue: 'resultRows',
          rowMode: 'object'
        }
      );
      const storyItems: LibraryItem[] = storyItemsResult || [];

      // Combine library items and story items (dedupe by id)
      const allItems = [...libraryItems];
      for (const storyItem of storyItems) {
        if (!allItems.find(item => item.id === storyItem.id)) {
          allItems.push(storyItem);
        }
      }

      // Run reference detection
      return detectLibraryReferences(outline.content, allItems);
    },
    enabled: storyId !== null,
    staleTime: 10000 // 10s stale time to debounce recomputation
  });
}
