// Story CRUD operations using TanStack Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '@/services/db';
import type { Story } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Query all stories ordered by updated_at DESC
 * Polls every 5s for real-time updates
 */
export function useStories() {
  return useQuery<Story[]>({
    queryKey: ['stories'],
    queryFn: async () => {
      const db = await getDatabase();
      const result = db.exec('SELECT * FROM stories ORDER BY updated_at DESC', {
        returnValue: 'resultRows',
        rowMode: 'object'
      });
      return result || [];
    },
    refetchInterval: 5000
  });
}

/**
 * Query single story by ID
 * Disabled when id is null
 */
export function useStory(id: string | null) {
  return useQuery<Story | null>({
    queryKey: ['stories', id],
    queryFn: async () => {
      if (!id) return null;

      const db = await getDatabase();
      const result = db.exec('SELECT * FROM stories WHERE id = ?', {
        bind: [id],
        returnValue: 'resultRows',
        rowMode: 'object'
      });
      return result?.[0] || null;
    },
    enabled: id !== null
  });
}

/**
 * Create a new story
 */
export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) => {
      const db = await getDatabase();
      const now = Date.now();
      const id = uuidv4();

      db.exec(
        `INSERT INTO stories (id, title, premise, status, ai_config_id, created_at, updated_at)
         VALUES (?, ?, '', 'setup', NULL, ?, ?)`,
        { bind: [id, title, now, now] }
      );

      return { id, title, premise: '', status: 'setup' as const, ai_config_id: null, created_at: now, updated_at: now };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });
}

/**
 * Update an existing story
 */
export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      title?: string;
      premise?: string;
      status?: Story['status'];
      ai_config_id?: string | null;
    }) => {
      const db = await getDatabase();
      const now = Date.now();

      // Build dynamic update query
      const updates: string[] = [];
      const binds: any[] = [];

      if (params.title !== undefined) {
        updates.push('title = ?');
        binds.push(params.title);
      }
      if (params.premise !== undefined) {
        updates.push('premise = ?');
        binds.push(params.premise);
      }
      if (params.status !== undefined) {
        updates.push('status = ?');
        binds.push(params.status);
      }
      if (params.ai_config_id !== undefined) {
        updates.push('ai_config_id = ?');
        binds.push(params.ai_config_id);
      }

      updates.push('updated_at = ?');
      binds.push(now);
      binds.push(params.id);

      db.exec(
        `UPDATE stories SET ${updates.join(', ')} WHERE id = ?`,
        { bind: binds }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['stories', variables.id] });
    }
  });
}

/**
 * Delete a story and all related data
 * Cascades to story_items, outlines, and ai_configs
 */
export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const db = await getDatabase();

      // Delete related data first (SQLite doesn't enforce FK cascades by default)
      db.exec('DELETE FROM story_items WHERE story_id = ?', { bind: [id] });
      db.exec('DELETE FROM outlines WHERE story_id = ?', { bind: [id] });
      db.exec('DELETE FROM ai_configs WHERE story_id = ?', { bind: [id] });

      // Delete the story
      db.exec('DELETE FROM stories WHERE id = ?', { bind: [id] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });
}
