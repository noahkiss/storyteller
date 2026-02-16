// Forked content management
// Handles forking library items into stories and merging library updates

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '@/services/db';
import { mergeLibraryUpdate } from '@/services/merge';
import type { StoryItem, LibraryItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Query all story_items for a story
 * Returns items with their library source information
 */
export function useStoryItems(storyId: string | null) {
  return useQuery<StoryItem[]>({
    queryKey: ['story-items', storyId],
    queryFn: async () => {
      if (!storyId) return [];

      const db = await getDatabase();
      const result = db.exec('SELECT * FROM story_items WHERE story_id = ?', {
        bind: [storyId],
        returnValue: 'resultRows',
        rowMode: 'object'
      });

      // Parse has_local_changes from INTEGER to boolean
      return (result || []).map((item: any) => ({
        ...item,
        has_local_changes: Boolean(item.has_local_changes)
      }));
    },
    enabled: storyId !== null,
    refetchInterval: 5000
  });
}

/**
 * Fork a library item into a story
 * Creates a story-local copy with reference to the original library version
 */
export function useForkLibraryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { storyId: string; libraryItemId: string }) => {
      const db = await getDatabase();

      // Fetch the library item's current content and version
      const libraryResult = db.exec('SELECT * FROM library_items WHERE id = ?', {
        bind: [params.libraryItemId],
        returnValue: 'resultRows',
        rowMode: 'object'
      });

      if (!libraryResult || libraryResult.length === 0) {
        throw new Error('Library item not found');
      }

      const libraryItem = libraryResult[0] as LibraryItem;
      const now = Date.now();
      const id = uuidv4();

      // Create story_item with forked content
      // base_content stores the original library content for three-way merge
      db.exec(
        `INSERT INTO story_items (
          id, story_id, library_id, forked_from_version,
          content, has_local_changes, base_content, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
        {
          bind: [
            id,
            params.storyId,
            params.libraryItemId,
            libraryItem.version,
            libraryItem.content,
            libraryItem.content, // base_content = content at fork time
            now,
            now
          ]
        }
      );

      return {
        id,
        story_id: params.storyId,
        library_id: params.libraryItemId,
        forked_from_version: libraryItem.version,
        content: libraryItem.content,
        has_local_changes: false,
        created_at: now,
        updated_at: now
      } as StoryItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['story-items', variables.storyId] });
    }
  });
}

/**
 * Check for library updates on forked items
 * Returns items that have newer library versions available
 */
export function useCheckForUpdates(storyId: string | null) {
  return useQuery({
    queryKey: ['story-updates', storyId],
    queryFn: async () => {
      if (!storyId) return [];

      const db = await getDatabase();

      // Join story_items with library_items to compare versions
      const result = db.exec(
        `SELECT
          si.*,
          li.version as library_version,
          li.name as library_name,
          li.type as library_type
         FROM story_items si
         JOIN library_items li ON si.library_id = li.id
         WHERE si.story_id = ?`,
        {
          bind: [storyId],
          returnValue: 'resultRows',
          rowMode: 'object'
        }
      );

      if (!result) return [];

      return result.map((row: any) => ({
        storyItem: {
          id: row.id,
          story_id: row.story_id,
          library_id: row.library_id,
          forked_from_version: row.forked_from_version,
          content: row.content,
          has_local_changes: Boolean(row.has_local_changes),
          created_at: row.created_at,
          updated_at: row.updated_at
        } as StoryItem,
        libraryItem: {
          id: row.library_id,
          name: row.library_name,
          type: row.library_type,
          version: row.library_version
        },
        hasUpdate: row.library_version > row.forked_from_version
      }));
    },
    enabled: storyId !== null,
    refetchInterval: 30000 // Poll every 30s (updates are rare)
  });
}

/**
 * Merge library update into story item
 * Uses three-way merge to reconcile changes
 */
export function useMergeLibraryUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyItemId: string) => {
      const db = await getDatabase();

      // Fetch the story item
      const storyItemResult = db.exec('SELECT * FROM story_items WHERE id = ?', {
        bind: [storyItemId],
        returnValue: 'resultRows',
        rowMode: 'object'
      });

      if (!storyItemResult || storyItemResult.length === 0) {
        throw new Error('Story item not found');
      }

      const storyItem = storyItemResult[0] as StoryItem;

      // Fetch the latest library item
      const libraryResult = db.exec('SELECT * FROM library_items WHERE id = ?', {
        bind: [storyItem.library_id],
        returnValue: 'resultRows',
        rowMode: 'object'
      });

      if (!libraryResult || libraryResult.length === 0) {
        throw new Error('Library item not found');
      }

      const libraryItem = libraryResult[0] as LibraryItem;

      // Perform three-way merge
      // - storyItem.content = our changes (story version)
      // - storyItem.base_content = common ancestor (content at fork time)
      // - libraryItem.content = their changes (latest library version)
      const mergeResult = mergeLibraryUpdate(
        storyItem.content,
        storyItem.base_content || storyItem.content, // fallback if base_content is null
        libraryItem.content
      );

      const now = Date.now();

      if (mergeResult.success) {
        // Clean merge - update story item with merged content
        db.exec(
          `UPDATE story_items
           SET content = ?, forked_from_version = ?, base_content = ?, updated_at = ?
           WHERE id = ?`,
          {
            bind: [
              mergeResult.content,
              libraryItem.version,
              libraryItem.content, // Update base to latest library version
              now,
              storyItemId
            ]
          }
        );
      } else {
        // Conflicts exist - return merged content with markers for user to resolve
        // Don't auto-save - let user review and manually save
        console.log(`[Merge] ${mergeResult.conflictCount} conflicts found in story item ${storyItemId}`);
      }

      return mergeResult;
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['story-items'] });
      queryClient.invalidateQueries({ queryKey: ['story-updates'] });
    }
  });
}
