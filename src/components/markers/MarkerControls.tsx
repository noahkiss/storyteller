import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { detectMarkers } from '@/services/markdown';
import { processAllMarkers, type MarkerChange } from '@/services/marker-processor';
import { useSettingsStore } from '@/stores/settings-store';
import { createLLMClient } from '@/services/llm-client';
import { getDatabase } from '@/services/db';
import type { LibraryItem, StoryItem } from '@/types';
import './MarkerControls.css';

interface MarkerControlsProps {
  content: string;
  contentId: string;
  onContentUpdate: (content: string) => void;
}

/**
 * MarkerControls component
 * Provides marker processing, preview, and quick-insert controls
 */
export function MarkerControls({
  content,
  contentId,
  onContentUpdate,
}: MarkerControlsProps) {
  const { baseURL, apiKey, model, generationParams } = useSettingsStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<MarkerChange[]>([]);
  const [processedContent, setProcessedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showInsertMenu, setShowInsertMenu] = useState(false);

  // Detect markers in current content
  const markers = useMemo(() => detectMarkers(content), [content]);

  // Fetch all library items (characters, settings, themes)
  const { data: libraryItems = [] } = useQuery<LibraryItem[]>({
    queryKey: ['all-library-items'],
    queryFn: async () => {
      const db = await getDatabase();
      const rows = db.exec({
        sql: 'SELECT * FROM library_items ORDER BY name',
        returnValue: 'resultRows',
        rowMode: 'object',
      }) as any[];

      return (rows || []).map((row: any) => ({
        id: row.id,
        type: row.type,
        name: row.name,
        category: row.category,
        tags: JSON.parse(row.tags || '[]'),
        content: row.content,
        version: row.version,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    },
    refetchInterval: 5000,
  });

  // Fetch all story items (forked library items in the current story)
  const { data: _storyItems = [] } = useQuery<StoryItem[]>({
    queryKey: ['all-story-items'],
    queryFn: async () => {
      const db = await getDatabase();
      const rows = db.exec({
        sql: 'SELECT * FROM story_items',
        returnValue: 'resultRows',
        rowMode: 'object',
      }) as any[];

      return (rows || []).map((row: any) => ({
        id: row.id,
        story_id: row.story_id,
        library_id: row.library_id,
        forked_from_version: row.forked_from_version,
        content: row.content,
        has_local_changes: Boolean(row.has_local_changes),
        base_content: row.base_content,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    },
    refetchInterval: 5000,
  });

  /**
   * LLM generation function (non-streaming)
   */
  const llmGenerate = useCallback(
    async (prompt: string): Promise<string> => {
      if (!baseURL || !model) {
        throw new Error('LLM not configured');
      }

      const client = createLLMClient(baseURL, apiKey);

      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: generationParams.temperature,
        max_tokens: generationParams.maxTokens,
        top_p: generationParams.topP,
        frequency_penalty: generationParams.frequencyPenalty,
        presence_penalty: generationParams.presencePenalty,
        stream: false,
      });

      return response.choices[0]?.message?.content || '';
    },
    [baseURL, apiKey, model, generationParams]
  );

  /**
   * Create a version point before or after processing
   */
  const createVersionPoint = useCallback(
    async (content: string, versionType: 'auto' | 'manual' | 'generation') => {
      const db = await getDatabase();
      const now = Date.now();

      db.exec({
        sql: `INSERT INTO versions (content_id, content, version_type, created_at)
              VALUES (?, ?, ?, ?)`,
        bind: [contentId, content, versionType, now],
      });
    },
    [contentId]
  );

  /**
   * Process markers with preview
   */
  const handleProcessPreview = useCallback(async () => {
    if (markers.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processAllMarkers(content, libraryItems, llmGenerate);

      setPreview(result.changes);
      setProcessedContent(result.processed);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [content, markers.length, libraryItems, llmGenerate]);

  /**
   * Accept preview and apply changes
   */
  const handleAcceptPreview = useCallback(async () => {
    // Create pre-processing version point
    await createVersionPoint(content, 'manual');

    // Apply the processed content
    onContentUpdate(processedContent);

    // Create post-processing version point
    await createVersionPoint(processedContent, 'generation');

    // Clear preview
    setShowPreview(false);
    setPreview([]);
    setProcessedContent('');
  }, [content, processedContent, onContentUpdate, createVersionPoint]);

  /**
   * Cancel preview
   */
  const handleCancelPreview = useCallback(() => {
    setShowPreview(false);
    setPreview([]);
    setProcessedContent('');
  }, []);

  /**
   * Insert a marker at the current cursor position
   * For now, we'll just insert at the end of the content
   * (A full implementation would need CodeMirror integration to get cursor position)
   */
  const handleInsertMarker = useCallback(
    (markerType: string) => {
      const markerTemplate = `{{${markerType}:}}`;
      const newContent = content + markerTemplate;
      onContentUpdate(newContent);
      setShowInsertMenu(false);
    },
    [content, onContentUpdate]
  );

  return (
    <div className="marker-controls">
      <div className="marker-controls__status">
        {markers.length > 0 ? (
          <span className="marker-controls__count">{markers.length} marker{markers.length !== 1 ? 's' : ''} detected</span>
        ) : (
          <span className="marker-controls__count">No markers</span>
        )}
      </div>

      <div className="marker-controls__actions">
        {/* Process button */}
        <button
          className="marker-controls__button marker-controls__button--primary"
          onClick={handleProcessPreview}
          disabled={markers.length === 0 || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Process'}
        </button>

        {/* Insert marker dropdown */}
        <div className="marker-controls__insert-menu">
          <button
            className="marker-controls__button"
            onClick={() => setShowInsertMenu(!showInsertMenu)}
          >
            Insert Marker ▾
          </button>
          {showInsertMenu && (
            <div className="marker-controls__insert-dropdown">
              <button onClick={() => handleInsertMarker('character')}>
                Character Reference
              </button>
              <button onClick={() => handleInsertMarker('setting')}>
                Setting Reference
              </button>
              <button onClick={() => handleInsertMarker('expand')}>
                Expand Section
              </button>
              <button onClick={() => handleInsertMarker('instruct')}>
                AI Instruction
              </button>
              <button onClick={() => handleInsertMarker('ref')}>
                Generic Reference
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="marker-controls__error">
          Error: {error}
        </div>
      )}

      {/* Preview modal */}
      {showPreview && (
        <div className="marker-controls__preview-overlay">
          <div className="marker-controls__preview-modal">
            <h3>Preview Changes</h3>
            <div className="marker-controls__preview-list">
              {preview.map((change, index) => (
                <div key={index} className="marker-controls__preview-item">
                  <div className="marker-controls__preview-marker">
                    {change.marker}
                  </div>
                  <div className="marker-controls__preview-arrow">→</div>
                  <div className="marker-controls__preview-replacement">
                    {change.replacement.length > 200
                      ? change.replacement.slice(0, 200) + '...'
                      : change.replacement}
                  </div>
                </div>
              ))}
            </div>
            <div className="marker-controls__preview-actions">
              <button
                className="marker-controls__button marker-controls__button--primary"
                onClick={handleAcceptPreview}
              >
                Accept
              </button>
              <button
                className="marker-controls__button"
                onClick={handleCancelPreview}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
