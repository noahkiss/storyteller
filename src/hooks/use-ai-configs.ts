import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '../services/db';
import type { AIConfig } from '../types';
import { stringifyMarkdown, extractName } from '../services/markdown';

/**
 * Query all AI configs, optionally filtered by story.
 * If storyId is provided, returns story-specific configs.
 * If omitted, returns global configs (is_global=1).
 */
export function useAIConfigs(storyId?: string) {
  return useQuery({
    queryKey: ['ai-configs', storyId],
    queryFn: async (): Promise<AIConfig[]> => {
      const db = await getDatabase();

      let sql: string;
      let params: any[];

      if (storyId) {
        // Story-specific configs
        sql = 'SELECT * FROM ai_configs WHERE is_global = 0 AND story_id = ? ORDER BY created_at DESC';
        params = [storyId];
      } else {
        // Global configs
        sql = 'SELECT * FROM ai_configs WHERE is_global = 1 ORDER BY created_at DESC';
        params = [];
      }

      const results: AIConfig[] = [];
      db.exec({
        sql,
        bind: params,
        callback: (row: any) => {
          results.push({
            id: row[0],
            name: row[1],
            content: row[2],
            is_global: Boolean(row[3]),
            story_id: row[4],
            created_at: row[5],
            updated_at: row[6]
          });
        }
      });

      return results;
    },
    refetchInterval: 5000, // Poll every 5s
  });
}

/**
 * Query a single AI config by ID.
 * Disabled when id is null.
 */
export function useAIConfig(id: string | null) {
  return useQuery({
    queryKey: ['ai-config', id],
    queryFn: async (): Promise<AIConfig | null> => {
      if (!id) return null;

      const db = await getDatabase();

      let result: AIConfig | null = null;
      db.exec({
        sql: 'SELECT * FROM ai_configs WHERE id = ?',
        bind: [id],
        callback: (row: any) => {
          result = {
            id: row[0],
            name: row[1],
            content: row[2],
            is_global: Boolean(row[3]),
            story_id: row[4],
            created_at: row[5],
            updated_at: row[6]
          };
        }
      });

      return result;
    },
    enabled: id !== null,
  });
}

/**
 * Create a new AI config.
 * Takes { name, isGlobal, storyId? }
 */
export function useCreateAIConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      isGlobal: boolean;
      storyId?: string;
    }): Promise<string> => {
      const db = await getDatabase();
      const now = Date.now();
      const id = `config_${now}_${Math.random().toString(36).substr(2, 9)}`;

      // Default content template
      const defaultContent = stringifyMarkdown(
        `# Writing Style

(Define the AI's writing approach here)

## Tone

## Voice

## Avoid`,
        {
          name: params.name,
          stage: 'general'
        }
      );

      db.exec({
        sql: `INSERT INTO ai_configs (id, name, content, is_global, story_id, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        bind: [
          id,
          params.name,
          defaultContent,
          params.isGlobal ? 1 : 0,
          params.storyId || null,
          now,
          now
        ]
      });

      return id;
    },
    onSuccess: (_, variables) => {
      // Invalidate the appropriate query
      queryClient.invalidateQueries({
        queryKey: ['ai-configs', variables.isGlobal ? undefined : variables.storyId]
      });
    },
  });
}

/**
 * Update an AI config's content and name (re-extracted from frontmatter).
 */
export function useUpdateAIConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      content: string;
    }): Promise<void> => {
      const db = await getDatabase();
      const now = Date.now();

      // Extract name from frontmatter
      const name = extractName(params.content);

      db.exec({
        sql: 'UPDATE ai_configs SET content = ?, name = ?, updated_at = ? WHERE id = ?',
        bind: [params.content, name, now, params.id]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configs'] });
      queryClient.invalidateQueries({ queryKey: ['ai-config'] });
    },
  });
}

/**
 * Delete an AI config by ID.
 * Prevents deleting the seeded default global config (name="Default").
 */
export function useDeleteAIConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const db = await getDatabase();

      // Check if this is the default config
      let isDefault = false;
      db.exec({
        sql: 'SELECT name FROM ai_configs WHERE id = ?',
        bind: [id],
        callback: (row: any) => {
          if (row[0] === 'Default') {
            isDefault = true;
          }
        }
      });

      if (isDefault) {
        throw new Error('Cannot delete the default AI config');
      }

      db.exec({
        sql: 'DELETE FROM ai_configs WHERE id = ?',
        bind: [id]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configs'] });
    },
  });
}
