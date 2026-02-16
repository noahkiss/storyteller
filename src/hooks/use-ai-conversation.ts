/**
 * AI Conversation Hook
 *
 * Integrates conversation state machine with LLM for premise development.
 * Manages conversation flow, asset extraction, and library integration.
 */

import { useState, useCallback } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { createLLMClient } from '@/services/llm-client';
import { getDatabase } from '@/services/db';
import type {
  ConversationState,
  ConversationMode,
} from '@/services/ai-conversation';
import {
  createConversationState,
  updateConversationMode,
  generateConversationPrompt,
  shouldExtract,
  parseExtractedAssets,
} from '@/services/ai-conversation';

export interface UseAIConversationResult {
  state: ConversationState;
  isGenerating: boolean;
  canExtract: boolean;
  sendMessage: (userInput: string, onChunk: (chunk: string) => void) => Promise<void>;
  extractAssets: (onChunk: (chunk: string) => void) => Promise<void>;
  acceptCharacter: (index: number, storyId: string) => Promise<void>;
  acceptSetting: (index: number, storyId: string) => Promise<void>;
  acceptOutline: (storyId: string) => Promise<void>;
  reset: () => void;
  setMode: (mode: ConversationMode) => void;
}

/**
 * Hook for AI-assisted premise development with conversation state machine
 */
export function useAIConversation(): UseAIConversationResult {
  const [state, setState] = useState<ConversationState>(createConversationState());
  const [isGenerating, setIsGenerating] = useState(false);
  const { baseURL, apiKey, model, generationParams } = useSettingsStore();

  const canExtract = shouldExtract(state);

  /**
   * Send a user message and get AI response
   */
  const sendMessage = useCallback(
    async (userInput: string, onChunk: (chunk: string) => void) => {
      if (!baseURL || !model) {
        console.error('LLM not configured');
        return;
      }

      setIsGenerating(true);

      try {
        // Update conversation mode based on user input
        const updatedState = updateConversationMode(state, userInput);

        // Generate conversation prompt
        const messages = generateConversationPrompt(updatedState, userInput);

        // Stream AI response
        const client = createLLMClient(baseURL, apiKey);
        const stream = await client.chat.completions.create({
          model,
          messages,
          temperature: generationParams.temperature,
          max_tokens: generationParams.maxTokens,
          top_p: generationParams.topP,
          frequency_penalty: generationParams.frequencyPenalty,
          presence_penalty: generationParams.presencePenalty,
          stream: true,
        });

        let fullResponse = '';
        let buffer = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            buffer += content;

            // Flush buffer at ~50 chars for smooth rendering
            if (buffer.length >= 50) {
              onChunk(buffer);
              buffer = '';
            }
          }
        }

        // Flush remaining buffer
        if (buffer.length > 0) {
          onChunk(buffer);
        }

        // Update conversation history
        setState({
          ...updatedState,
          conversationHistory: [
            ...updatedState.conversationHistory,
            { role: 'user', content: userInput },
            { role: 'assistant', content: fullResponse },
          ],
        });
      } catch (error) {
        console.error('Error generating AI response:', error);
      } finally {
        setIsGenerating(false);
      }
    },
    [state, baseURL, apiKey, model, generationParams]
  );

  /**
   * Trigger asset extraction mode
   */
  const extractAssets = useCallback(
    async (onChunk: (chunk: string) => void) => {
      if (!baseURL || !model) {
        console.error('LLM not configured');
        return;
      }

      setIsGenerating(true);

      try {
        // Switch to extraction mode
        const extractionState: ConversationState = {
          ...state,
          mode: 'extracting',
        };

        // Generate extraction prompt
        const messages = generateConversationPrompt(
          extractionState,
          'Extract the characters, settings, and outline from our conversation.'
        );

        // Stream extraction response
        const client = createLLMClient(baseURL, apiKey);
        const stream = await client.chat.completions.create({
          model,
          messages,
          temperature: 0.3, // Lower temperature for more structured output
          max_tokens: generationParams.maxTokens,
          stream: true,
        });

        let fullResponse = '';
        let buffer = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            buffer += content;

            if (buffer.length >= 50) {
              onChunk(buffer);
              buffer = '';
            }
          }
        }

        if (buffer.length > 0) {
          onChunk(buffer);
        }

        // Parse extracted assets
        const assets = parseExtractedAssets(fullResponse);

        // Update state with extraction
        setState({
          ...extractionState,
          conversationHistory: [
            ...state.conversationHistory,
            {
              role: 'user',
              content: 'Extract the characters, settings, and outline from our conversation.',
            },
            { role: 'assistant', content: fullResponse },
          ],
          extractedAssets: assets,
        });
      } catch (error) {
        console.error('Error extracting assets:', error);
      } finally {
        setIsGenerating(false);
      }
    },
    [state, baseURL, apiKey, model, generationParams]
  );

  /**
   * Accept a character from extraction and create it in library
   */
  const acceptCharacter = useCallback(
    async (index: number, _storyId: string) => {
      if (!state.extractedAssets || index >= state.extractedAssets.characters.length) {
        return;
      }

      const character = state.extractedAssets.characters[index];
      const db = await getDatabase();
      const now = Date.now();
      const id = crypto.randomUUID();

      // Create markdown content with frontmatter
      const content = `---
category: main
tags: []
---

# ${character.name}

${character.description}
`;

      db.exec({
        sql: `INSERT INTO library_items (id, type, name, category, tags, content, version, created_at, updated_at)
              VALUES (?, 'character', ?, 'main', '[]', ?, 1, ?, ?)`,
        bind: [id, character.name, content, now, now],
      });

      // Remove from extracted assets
      const updatedAssets = { ...state.extractedAssets };
      updatedAssets.characters = updatedAssets.characters.filter((_, i) => i !== index);
      setState({ ...state, extractedAssets: updatedAssets });
    },
    [state]
  );

  /**
   * Accept a setting from extraction and create it in library
   */
  const acceptSetting = useCallback(
    async (index: number, _storyId: string) => {
      if (!state.extractedAssets || index >= state.extractedAssets.settings.length) {
        return;
      }

      const setting = state.extractedAssets.settings[index];
      const db = await getDatabase();
      const now = Date.now();
      const id = crypto.randomUUID();

      // Create markdown content with frontmatter
      const content = `---
category: primary
tags: []
---

# ${setting.name}

${setting.description}
`;

      db.exec({
        sql: `INSERT INTO library_items (id, type, name, category, tags, content, version, created_at, updated_at)
              VALUES (?, 'setting', ?, 'primary', '[]', ?, 1, ?, ?)`,
        bind: [id, setting.name, content, now, now],
      });

      // Remove from extracted assets
      const updatedAssets = { ...state.extractedAssets };
      updatedAssets.settings = updatedAssets.settings.filter((_, i) => i !== index);
      setState({ ...state, extractedAssets: updatedAssets });
    },
    [state]
  );

  /**
   * Accept outline and create it for the story
   */
  const acceptOutline = useCallback(
    async (storyId: string) => {
      if (!state.extractedAssets) {
        return;
      }

      const db = await getDatabase();
      const now = Date.now();
      const id = crypto.randomUUID();

      // Build outline markdown from plot points
      let outlineContent = '# Story Outline\n\n';
      state.extractedAssets.plotPoints.forEach((point, index) => {
        outlineContent += `## Chapter ${index + 1}\n\n${point}\n\n`;
      });

      // Check if outline already exists
      const existingOutline = db.exec('SELECT id FROM outlines WHERE story_id = ?', {
        bind: [storyId],
        returnValue: 'resultRows',
        rowMode: 'object',
      });

      if (existingOutline && existingOutline.length > 0) {
        // Update existing outline
        db.exec('UPDATE outlines SET content = ?, updated_at = ? WHERE story_id = ?', {
          bind: [outlineContent, now, storyId],
        });
      } else {
        // Create new outline
        db.exec(
          'INSERT INTO outlines (id, story_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          { bind: [id, storyId, outlineContent, now, now] }
        );
      }

      // Clear outline from extracted assets
      const updatedAssets = { ...state.extractedAssets };
      updatedAssets.plotPoints = [];
      setState({ ...state, extractedAssets: updatedAssets });
    },
    [state]
  );

  /**
   * Reset conversation state
   */
  const reset = useCallback(() => {
    setState(createConversationState());
  }, []);

  /**
   * Manually set conversation mode
   */
  const setMode = useCallback(
    (mode: ConversationMode) => {
      setState({ ...state, mode });
    },
    [state]
  );

  return {
    state,
    isGenerating,
    canExtract,
    sendMessage,
    extractAssets,
    acceptCharacter,
    acceptSetting,
    acceptOutline,
    reset,
    setMode,
  };
}
