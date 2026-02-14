import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '@/services/db';
import { CompressionEvent } from '@/types';

const QUERY_KEY = ['compression-events'];

/**
 * Hook to read and write compression events from SQLite
 * Returns last 50 events ordered by created_at DESC
 */
export function useCompressionLog() {
  const queryClient = useQueryClient();

  // Query for compression events
  const { data: events = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<CompressionEvent[]> => {
      const db = await getDatabase();
      if (!db) return [];

      const results: CompressionEvent[] = [];

      db.exec({
        sql: `
          SELECT id, source_tier, target_tier, original_tokens,
                 compressed_tokens, summary_text, created_at
          FROM compression_events
          ORDER BY created_at DESC
          LIMIT 50
        `,
        callback: (row: unknown[]) => {
          results.push({
            id: row[0] as number,
            source_tier: row[1] as string,
            target_tier: row[2] as string,
            original_tokens: row[3] as number,
            compressed_tokens: row[4] as number,
            summary_text: row[5] as string,
            created_at: row[6] as number,
          });
        },
      });

      return results;
    },
    refetchInterval: 5000, // Poll every 5s for new events
  });

  // Mutation to add a new event
  const addEvent = useMutation({
    mutationFn: async (event: Omit<CompressionEvent, 'id' | 'created_at'>) => {
      const db = await getDatabase();
      if (!db) throw new Error('Database not initialized');

      const createdAt = Date.now();

      db.exec({
        sql: `
          INSERT INTO compression_events
          (source_tier, target_tier, original_tokens, compressed_tokens, summary_text, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        bind: [
          event.source_tier,
          event.target_tier,
          event.original_tokens,
          event.compressed_tokens,
          event.summary_text,
          createdAt,
        ],
      });

      return createdAt;
    },
    onSuccess: () => {
      // Invalidate query to refresh event list
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  // Mutation to clear all events
  const clearEvents = useMutation({
    mutationFn: async () => {
      const db = await getDatabase();
      if (!db) throw new Error('Database not initialized');

      db.exec('DELETE FROM compression_events');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    events,
    addEvent: addEvent.mutate,
    clearEvents: clearEvents.mutate,
  };
}
