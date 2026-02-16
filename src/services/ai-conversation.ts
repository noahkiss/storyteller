/**
 * AI Conversation Service
 *
 * Adaptive conversation state machine for premise development.
 * Handles mode transitions (Socratic → Suggestive → Extracting) and
 * asset extraction from developed premises.
 */

export type ConversationMode = 'socratic' | 'suggestive' | 'extracting';

export interface ConversationState {
  mode: ConversationMode;
  turnCount: number;
  stuckSignals: Array<{ turn: number; signal: string }>;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  extractedAssets: {
    characters: Array<{ name: string; description: string }>;
    settings: Array<{ name: string; description: string }>;
    plotPoints: string[];
  } | null;
}

/**
 * Create initial conversation state
 */
export function createConversationState(): ConversationState {
  return {
    mode: 'socratic',
    turnCount: 0,
    stuckSignals: [],
    conversationHistory: [],
    extractedAssets: null,
  };
}

/**
 * Detect if user input contains stuck signals
 */
function detectStuckSignals(userInput: string): string | null {
  const patterns = [
    { pattern: /i don't know/i, signal: "don't know" },
    { pattern: /not sure/i, signal: 'not sure' },
    { pattern: /help/i, signal: 'help request' },
    { pattern: /stuck/i, signal: 'stuck' },
    { pattern: /give me (some )?ideas?/i, signal: 'requesting ideas' },
  ];

  for (const { pattern, signal } of patterns) {
    if (pattern.test(userInput)) {
      return signal;
    }
  }

  return null;
}

/**
 * Check if user input is an explicit help request
 */
function isExplicitHelpRequest(userInput: string): boolean {
  return /give me (some )?ideas?/i.test(userInput) || /help me/i.test(userInput);
}

/**
 * Update conversation mode based on user input and conversation state
 */
export function updateConversationMode(
  state: ConversationState,
  userInput: string
): ConversationState {
  const newTurnCount = state.turnCount + 1;
  const stuckSignal = detectStuckSignals(userInput);

  let newStuckSignals = state.stuckSignals;
  if (stuckSignal) {
    newStuckSignals = [...state.stuckSignals, { turn: newTurnCount, signal: stuckSignal }];
  }

  // Determine new mode
  let newMode = state.mode;

  // Only transition from socratic → suggestive (not back)
  if (state.mode === 'socratic') {
    // Explicit help request → immediate switch
    if (isExplicitHelpRequest(userInput)) {
      newMode = 'suggestive';
    } else {
      // Count stuck signals in last 3 turns
      const recentTurns = newTurnCount - 3;
      const recentSignals = newStuckSignals.filter((s) => s.turn > recentTurns);

      // Need 2+ signals in last 3 turns to switch
      if (recentSignals.length >= 2) {
        newMode = 'suggestive';
      }
    }
  }

  return {
    ...state,
    mode: newMode,
    turnCount: newTurnCount,
    stuckSignals: newStuckSignals,
  };
}

/**
 * Generate conversation prompt based on current mode
 */
export function generateConversationPrompt(
  state: ConversationState,
  userInput: string,
  _storyContext?: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  // Build system prompt based on mode
  let systemPrompt = '';

  switch (state.mode) {
    case 'socratic':
      systemPrompt =
        'You are a story development assistant. The user is developing a story premise. Ask thoughtful clarifying questions to help them flesh out their idea. Focus on: characters and their motivations, relationships between characters, emotional core of the story, key settings and their atmosphere. Be concise — one question at a time. Be encouraging. Don\'t suggest plot ideas unless asked.';
      break;

    case 'suggestive':
      systemPrompt =
        'You are a story development assistant. The user is developing a story premise and needs some inspiration. Based on what they\'ve shared, suggest 2-3 specific, concrete ideas they could explore. Frame as possibilities, not prescriptions. Focus on slice-of-life elements: character dynamics, everyday settings, emotional themes.';
      break;

    case 'extracting':
      systemPrompt = `Based on the conversation about this story, extract the following in a structured format:

CHARACTERS:
- Name: description, role, key traits

SETTINGS:
- Name: description, atmosphere, character associations

OUTLINE:
- Chapter/Scene: summary, characters present, setting, mood

Format clearly so the user can review and edit.`;
      break;
  }

  // Build messages array
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  // Add conversation history
  for (const msg of state.conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current user input
  messages.push({ role: 'user', content: userInput });

  return messages;
}

/**
 * Determine if extraction should be offered
 */
export function shouldExtract(state: ConversationState): boolean {
  // Need at least 4 turns
  if (state.turnCount < 4) {
    return false;
  }

  // Need at least 2 substantive assistant responses (> 50 chars)
  const substantiveResponses = state.conversationHistory.filter(
    (msg) => msg.role === 'assistant' && msg.content.length > 50
  );

  return substantiveResponses.length >= 2;
}

/**
 * Parse extracted assets from AI response
 */
export function parseExtractedAssets(
  aiResponse: string
): ConversationState['extractedAssets'] {
  const result: ConversationState['extractedAssets'] = {
    characters: [],
    settings: [],
    plotPoints: [],
  };

  try {
    // Parse CHARACTERS section
    const charactersMatch = aiResponse.match(/CHARACTERS:\s*([\s\S]*?)(?=\n\n|SETTINGS:|OUTLINE:|$)/i);
    if (charactersMatch) {
      const charLines = charactersMatch[1].split('\n').filter((line) => line.trim());
      for (const line of charLines) {
        // Match "- Name: description" or "Name: description"
        const match = line.match(/^-?\s*([^:]+):\s*(.+)$/);
        if (match) {
          result.characters.push({
            name: match[1].trim(),
            description: match[2].trim(),
          });
        }
      }
    }

    // Parse SETTINGS section
    const settingsMatch = aiResponse.match(/SETTINGS:\s*([\s\S]*?)(?=\n\n|OUTLINE:|$)/i);
    if (settingsMatch) {
      const settingLines = settingsMatch[1].split('\n').filter((line) => line.trim());
      for (const line of settingLines) {
        const match = line.match(/^-?\s*([^:]+):\s*(.+)$/);
        if (match) {
          result.settings.push({
            name: match[1].trim(),
            description: match[2].trim(),
          });
        }
      }
    }

    // Parse OUTLINE section
    const outlineMatch = aiResponse.match(/OUTLINE:\s*([\s\S]*?)$/i);
    if (outlineMatch) {
      const outlineLines = outlineMatch[1].split('\n').filter((line) => line.trim());
      for (const line of outlineLines) {
        const match = line.match(/^-?\s*(.+)$/);
        if (match) {
          result.plotPoints.push(match[1].trim());
        }
      }
    }

    // Return null if nothing was extracted
    if (
      result.characters.length === 0 &&
      result.settings.length === 0 &&
      result.plotPoints.length === 0
    ) {
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error parsing extracted assets:', error);
    return null;
  }
}
