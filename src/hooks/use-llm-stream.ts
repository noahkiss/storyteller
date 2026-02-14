import { useState, useRef, useCallback } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { createLLMClient } from '@/services/llm-client';
import type { GenerationParams } from '@/types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface UseLLMStreamResult {
  isGenerating: boolean;
  isStopping: boolean;
  error: string | null;
  tokensGenerated: number;
  tokensPerSecond: number;
  generate: (
    messages: ChatMessage[],
    params: GenerationParams,
    onChunk: (chunk: string) => void
  ) => Promise<void>;
  stop: () => void;
}

/**
 * Hook for streaming LLM generation with chunk buffering and abort support
 *
 * Key behaviors:
 * - Buffers chunks (~50 chars) for smooth append performance
 * - Tracks tokens/second for UI feedback
 * - Proper state transitions: isGenerating -> isStopping -> idle
 * - Generate button should be disabled when isGenerating OR isStopping
 */
export function useLLMStream(): UseLLMStreamResult {
  const { baseURL, apiKey, model } = useSettingsStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokensGenerated, setTokensGenerated] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const bufferRef = useRef<string>('');

  // Calculate tokens per second
  const tokensPerSecond =
    startTime && tokensGenerated > 0
      ? tokensGenerated / ((Date.now() - startTime) / 1000)
      : 0;

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStopping(true);

      // Clear isStopping after brief delay
      setTimeout(() => {
        setIsStopping(false);
      }, 500);
    }
  }, []);

  const generate = useCallback(
    async (
      messages: ChatMessage[],
      params: GenerationParams,
      onChunk: (chunk: string) => void
    ) => {
      // Validate connection settings
      if (!baseURL || !model) {
        setError('LLM connection not configured');
        return;
      }

      // Reset state
      setIsGenerating(true);
      setIsStopping(false);
      setError(null);
      setTokensGenerated(0);
      setStartTime(Date.now());
      bufferRef.current = '';

      // Create abort controller for this generation
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const client = createLLMClient(baseURL, apiKey);

        const stream = await client.chat.completions.create(
          {
            model,
            messages,
            temperature: params.temperature,
            max_tokens: params.maxTokens,
            top_p: params.topP,
            frequency_penalty: params.frequencyPenalty,
            presence_penalty: params.presencePenalty,
            stream: true,
          },
          {
            signal: controller.signal,
          }
        );

        let tokenCount = 0;

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';

          if (content) {
            tokenCount++;
            bufferRef.current += content;

            // Flush buffer when it reaches ~50 chars for smooth appending
            if (bufferRef.current.length >= 50) {
              onChunk(bufferRef.current);
              bufferRef.current = '';
            }
          }
        }

        // Flush any remaining buffer
        if (bufferRef.current.length > 0) {
          onChunk(bufferRef.current);
          bufferRef.current = '';
        }

        setTokensGenerated(tokenCount);
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            // Graceful abort - not an error
            setIsStopping(true);
            setTimeout(() => {
              setIsStopping(false);
            }, 500);
          } else {
            setError(err.message);
          }
        } else {
          setError('Unknown error during generation');
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    },
    [baseURL, apiKey, model]
  );

  return {
    isGenerating,
    isStopping,
    error,
    tokensGenerated,
    tokensPerSecond,
    generate,
    stop,
  };
}
