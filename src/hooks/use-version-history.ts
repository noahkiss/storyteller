import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDatabase } from '@/services/db';
import type { Version } from '@/types';

interface VersionHistoryResult {
  versions: Version[];
  currentVersion: Version | null;
  versionCount: number;
  currentIndex: number | null;
  isViewingHistory: boolean;
  goBack: () => void;
  goForward: () => void;
  goToCurrent: () => void;
  saveManualVersion: (content: string) => Promise<void>;
}

export function useVersionHistory(contentId: string): VersionHistoryResult {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Load versions from SQLite
  const { data: versions = [] } = useQuery({
    queryKey: ['versions', contentId],
    queryFn: async () => {
      const db = await getDatabase();
      const result: Version[] = [];

      db.exec({
        sql: `
          SELECT id, content_id, content, version_type, created_at
          FROM versions
          WHERE content_id = ?
          ORDER BY created_at DESC
        `,
        bind: [contentId],
        callback: (row: unknown[]) => {
          result.push({
            id: row[0] as number,
            content_id: row[1] as string,
            content: row[2] as string,
            version_type: row[3] as 'auto' | 'manual' | 'generation',
            created_at: row[4] as number,
          });
        }
      });

      return result;
    },
    refetchInterval: 3000, // Poll for new versions
  });

  const versionCount = versions.length;
  const isViewingHistory = currentIndex !== null;
  const currentVersion = isViewingHistory ? versions[currentIndex] : null;

  const goBack = useCallback(() => {
    if (currentIndex === null) {
      // Start viewing history from the most recent version
      if (versions.length > 0) {
        setCurrentIndex(0);
      }
    } else if (currentIndex < versions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, versions.length]);

  const goForward = useCallback(() => {
    if (currentIndex !== null && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToCurrent = useCallback(() => {
    setCurrentIndex(null);
  }, []);

  const saveManualVersion = useCallback(async (content: string) => {
    const db = await getDatabase();
    const now = Date.now();

    db.exec({
      sql: `
        INSERT INTO versions (content_id, content, version_type, created_at)
        VALUES (?, ?, 'manual', ?)
      `,
      bind: [contentId, content, now]
    });

    // Invalidate query to refresh version list
    queryClient.invalidateQueries({ queryKey: ['versions', contentId] });
  }, [contentId, queryClient]);

  // Reset to current when versions change (new version added)
  useEffect(() => {
    if (isViewingHistory && currentIndex !== null && currentIndex >= versions.length) {
      setCurrentIndex(null);
    }
  }, [versions.length, currentIndex, isViewingHistory]);

  return {
    versions,
    currentVersion,
    versionCount,
    currentIndex,
    isViewingHistory,
    goBack,
    goForward,
    goToCurrent,
    saveManualVersion,
  };
}
