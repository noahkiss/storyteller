import { useCallback } from 'react';
import { useLLMStream } from './use-llm-stream';
import { usePromptHistory } from './use-prompt-history';
import { useCompressionLog } from './use-compression-log';
import { useGenerationStore } from '@/stores/generation-store';
import { useSettingsStore } from '@/stores/settings-store';
import { packContext, createContextTier } from '@/services/context-engine';
import { truncateToTokens } from '@/services/tokens';
import { getDatabase } from '@/services/db';
import type { ChatMessage } from './use-llm-stream';

const RECENT_TEXT_TOKEN_LIMIT = 500;

export interface UseGenerationResult {
  isGenerating: boolean;
  isStopping: boolean;
  error: string | null;
  tokensGenerated: number;
  tokensPerSecond: number;
  generate: (prompt: string) => Promise<void>;
  regenerate: () => Promise<void>;
  stop: () => void;
  copyOutput: () => Promise<void>;
}

/**
 * Orchestration hook that ties together:
 * - LLM streaming
 * - Context engine packing
 * - Prompt history persistence
 * - Context visualization
 * - Version tracking
 */
export function useGeneration(): UseGenerationResult {
  const {
    currentPrompt,
    currentOutput,
    maxContextTokens,
    setCurrentPrompt,
    appendToOutput,
    setOutput,
    setContextTiers,
    setError,
    clearError,
  } = useGenerationStore();

  const { model, generationParams } = useSettingsStore();
  const { saveGeneration } = usePromptHistory();
  const { addEvent } = useCompressionLog();
  const llmStream = useLLMStream();

  /**
   * Load system prompt from version history
   */
  const loadSystemPrompt = useCallback(async (): Promise<string> => {
    const db = await getDatabase();
    if (!db) return '';

    let systemPrompt = '';

    db.exec({
      sql: `
        SELECT content
        FROM versions
        WHERE content_id = 'system-prompt'
        ORDER BY created_at DESC
        LIMIT 1
      `,
      callback: (row: unknown[]) => {
        systemPrompt = row[0] as string;
      },
    });

    return systemPrompt;
  }, []);

  /**
   * Save generation output as a version
   */
  const saveOutputVersion = useCallback(
    async (output: string) => {
      const db = await getDatabase();
      if (!db) return;

      const now = Date.now();

      db.exec({
        sql: `
        INSERT INTO versions (content_id, content, version_type, created_at)
        VALUES ('generation-output', ?, 'generation', ?)
      `,
        bind: [output, now],
      });
    },
    []
  );

  /**
   * Main generation function
   */
  const generate = useCallback(
    async (prompt: string) => {
      try {
        clearError();
        setCurrentPrompt(prompt);
        setOutput(''); // Reset output for new generation

        // Load system prompt from version history
        const systemPrompt = await loadSystemPrompt();

        // Build context tiers
        const tiers = [];

        // System prompt tier (priority 100, always included)
        if (systemPrompt) {
          tiers.push(
            createContextTier(
              'System Prompt',
              systemPrompt,
              100,
              '#4a9eff' // blue
            )
          );
        }

        // Recent text tier (priority 90, last 500 tokens of current output)
        if (currentOutput) {
          const recentText = truncateToTokens(
            currentOutput,
            RECENT_TEXT_TOKEN_LIMIT
          );
          tiers.push(
            createContextTier(
              'Recent Text',
              recentText,
              90,
              '#4ade80' // green
            )
          );

          // Compressed history tier (priority 50, simple truncation for Phase 1)
          // In Phase 3, this will use LLM-based summarization
          const historyText = currentOutput.slice(
            0,
            currentOutput.length - recentText.length
          );
          if (historyText.trim()) {
            tiers.push(
              createContextTier(
                'Compressed History',
                historyText,
                50,
                '#fbbf24' // amber
              )
            );
          }
        }

        // Pack context into budget
        const contextBudget = maxContextTokens - generationParams.maxTokens;
        const packed = packContext(tiers, contextBudget);

        // Update context visualization
        setContextTiers(packed.packed);

        // Log compression if it occurred
        if (packed.overflow) {
          addEvent({
            source_tier: 'System Prompt',
            target_tier: 'Truncated',
            original_tokens: tiers[0].tokens,
            compressed_tokens: packed.packed[0]?.tokens || 0,
            summary_text: 'System prompt truncated to fit budget',
          });
        }

        // Build messages array for LLM
        const messages: ChatMessage[] = [];

        // System message from system prompt tier
        const systemTier = packed.packed.find(
          (t) => t.label === 'System Prompt'
        );
        if (systemTier) {
          messages.push({
            role: 'system',
            content: systemTier.content,
          });
        }

        // User message with prompt (and recent text context if present)
        const recentTier = packed.packed.find((t) => t.label === 'Recent Text');
        let userMessage = prompt;
        if (recentTier) {
          userMessage = `Context from recent text:\n\n${recentTier.content}\n\n---\n\nPrompt: ${prompt}`;
        }

        messages.push({
          role: 'user',
          content: userMessage,
        });

        // Stream generation - accumulate output locally
        let accumulatedOutput = '';
        await llmStream.generate(
          messages,
          generationParams,
          (chunk: string) => {
            accumulatedOutput += chunk;
            appendToOutput(chunk);
          }
        );

        // On completion: save to history and create version
        if (accumulatedOutput) {
          saveGeneration({
            prompt,
            output: accumulatedOutput,
            model,
            parameters: generationParams,
            tokenCount: llmStream.tokensGenerated,
          });

          saveOutputVersion(accumulatedOutput);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error during generation';
        setError(errorMessage);
      }
    },
    [
      currentOutput,
      maxContextTokens,
      generationParams,
      model,
      loadSystemPrompt,
      saveGeneration,
      saveOutputVersion,
      addEvent,
      llmStream,
      clearError,
      setCurrentPrompt,
      setOutput,
      setContextTiers,
      setError,
      appendToOutput,
    ]
  );

  /**
   * Regenerate with the same prompt
   */
  const regenerate = useCallback(async () => {
    if (currentPrompt) {
      await generate(currentPrompt);
    }
  }, [currentPrompt, generate]);

  /**
   * Copy output to clipboard
   */
  const copyOutput = useCallback(async () => {
    if (currentOutput) {
      await navigator.clipboard.writeText(currentOutput);
    }
  }, [currentOutput]);

  return {
    isGenerating: llmStream.isGenerating,
    isStopping: llmStream.isStopping,
    error: llmStream.error,
    tokensGenerated: llmStream.tokensGenerated,
    tokensPerSecond: llmStream.tokensPerSecond,
    generate,
    regenerate,
    stop: llmStream.stop,
    copyOutput,
  };
}
