import { useEffect, useRef, useState } from 'react';
import { getDatabase } from '@/services/db';

const AUTO_SAVE_DELAY = 2000; // 2 seconds of inactivity

interface AutoSaveResult {
  isSaving: boolean;
  lastSavedAt: number | null;
}

export function useAutoSave(contentId: string, content: string): AutoSaveResult {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);
  const pendingSaveRef = useRef<string | null>(null);

  useEffect(() => {
    // Clear any pending timeout when content changes
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Skip if content hasn't changed since last save
    if (content === lastSavedContentRef.current) {
      return;
    }

    // Set up debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      // If a save is in progress, queue this one
      if (saveInProgressRef.current) {
        pendingSaveRef.current = content;
        return;
      }

      // Skip if content is empty or unchanged
      if (!content || content === lastSavedContentRef.current) {
        return;
      }

      setIsSaving(true);
      saveInProgressRef.current = true;

      try {
        const db = await getDatabase();
        const now = Date.now();

        db.exec({
          sql: `
            INSERT INTO versions (content_id, content, version_type, created_at)
            VALUES (?, ?, 'auto', ?)
          `,
          bind: [contentId, content, now]
        });

        lastSavedContentRef.current = content;
        setLastSavedAt(now);
      } catch (error) {
        console.error('[useAutoSave] Failed to save version:', error);
      } finally {
        setIsSaving(false);
        saveInProgressRef.current = false;

        // If there's a pending save, process it
        if (pendingSaveRef.current !== null) {
          const pendingContent = pendingSaveRef.current;
          pendingSaveRef.current = null;

          // Trigger another save cycle
          saveTimeoutRef.current = setTimeout(async () => {
            if (pendingContent !== lastSavedContentRef.current) {
              setIsSaving(true);
              saveInProgressRef.current = true;

              try {
                const db = await getDatabase();
                const now = Date.now();

                db.exec({
                  sql: `
                    INSERT INTO versions (content_id, content, version_type, created_at)
                    VALUES (?, ?, 'auto', ?)
                  `,
                  bind: [contentId, pendingContent, now]
                });

                lastSavedContentRef.current = pendingContent;
                setLastSavedAt(now);
              } catch (error) {
                console.error('[useAutoSave] Failed to save pending version:', error);
              } finally {
                setIsSaving(false);
                saveInProgressRef.current = false;
              }
            }
          }, 0);
        }
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [contentId, content]);

  return { isSaving, lastSavedAt };
}
