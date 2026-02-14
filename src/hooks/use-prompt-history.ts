import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '@/services/db';
import type { Generation, GenerationParams } from '@/types';

const QUERY_KEY = ['generations'];

/**
 * Hook to load and save prompt/generation history from SQLite
 * Returns last 50 generations ordered by created_at DESC
 */
export function usePromptHistory() {
  const queryClient = useQueryClient();

  // Query for generations
  const { data: generations = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Generation[]> => {
      const db = await getDatabase();
      if (!db) return [];

      const results: Generation[] = [];

      db.exec({
        sql: `
          SELECT id, prompt, output, model, parameters, token_count, created_at
          FROM generations
          ORDER BY created_at DESC
          LIMIT 50
        `,
        callback: (row: unknown[]) => {
          results.push({
            id: row[0] as number,
            prompt: row[1] as string,
            output: row[2] as string,
            model: row[3] as string,
            parameters: row[4] as string,
            token_count: row[5] as number,
            created_at: row[6] as number,
          });
        },
      });

      return results;
    },
  });

  // Mutation to save a new generation
  const saveGeneration = useMutation({
    mutationFn: async (data: {
      prompt: string;
      output: string;
      model: string;
      parameters: GenerationParams;
      tokenCount: number;
    }) => {
      const db = await getDatabase();
      if (!db) throw new Error('Database not initialized');

      const createdAt = Date.now();

      db.exec({
        sql: `
          INSERT INTO generations (prompt, output, model, parameters, token_count, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        bind: [
          data.prompt,
          data.output,
          data.model,
          JSON.stringify(data.parameters),
          data.tokenCount,
          createdAt,
        ],
      });

      return createdAt;
    },
    onSuccess: () => {
      // Invalidate query to refresh generation list
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    generations,
    saveGeneration: saveGeneration.mutate,
  };
}
