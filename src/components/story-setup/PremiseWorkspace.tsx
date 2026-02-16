/**
 * Premise Workspace Component
 *
 * Left-pane controls for AI-assisted premise development.
 * Provides mode selection, conversation controls, and asset extraction UI.
 */

import { useState } from 'react';
import { useAIConversation } from '@/hooks/use-ai-conversation';
import { useUpdateStory } from '@/hooks/use-stories';
import './PremiseWorkspace.css';

interface PremiseWorkspaceProps {
  storyId: string;
  currentContent?: string;
  onContentAppend: (text: string) => void;
}

export function PremiseWorkspace({
  storyId,
  onContentAppend,
}: PremiseWorkspaceProps) {
  const [conversationMode, setConversationMode] = useState<'free-form' | 'guided'>('guided');
  const [userInput, setUserInput] = useState('');

  const {
    state,
    isGenerating,
    canExtract,
    sendMessage,
    extractAssets,
    acceptCharacter,
    acceptSetting,
    acceptOutline,
    setMode,
  } = useAIConversation();

  const updateStory = useUpdateStory();

  /**
   * Send user message to AI
   */
  const handleSendMessage = async () => {
    if (!userInput.trim() || isGenerating) return;

    // Append user message to content
    const userMessage = `\n\n**You:** ${userInput}\n\n`;
    onContentAppend(userMessage);

    const currentInput = userInput;
    setUserInput(''); // Clear input immediately

    // Stream AI response
    onContentAppend('**AI:** ');

    await sendMessage(currentInput, (chunk) => {
      onContentAppend(chunk);
    });

    // After streaming, append newline
    onContentAppend('\n');
  };

  /**
   * Start guided conversation
   */
  const handleStartGuided = async () => {
    if (isGenerating) return;

    // Set mode to socratic
    setMode('socratic');

    // Send initial prompt
    const initialPrompt =
      "I want to develop a story premise. Can you help me by asking questions to flesh out my ideas?";

    const userMessage = `\n\n**You:** ${initialPrompt}\n\n`;
    onContentAppend(userMessage);

    // Stream AI response
    let aiResponseContent = '';
    onContentAppend('**AI:** ');

    await sendMessage(initialPrompt, (chunk) => {
      aiResponseContent += chunk;
      onContentAppend(chunk);
    });

    onContentAppend('\n');
  };

  /**
   * Extract assets from conversation
   */
  const handleExtractAssets = async () => {
    if (isGenerating) return;

    const extractionMessage = `\n\n**Extracting Assets...**\n\n`;
    onContentAppend(extractionMessage);

    let extractedContent = '';
    await extractAssets((chunk) => {
      extractedContent += chunk;
      onContentAppend(chunk);
    });

    onContentAppend('\n\n---\n\n');
  };

  /**
   * Move story to outlining phase
   */
  const handleMoveToOutlining = () => {
    updateStory.mutate({
      id: storyId,
      status: 'outlining',
    });
  };

  return (
    <div className="premise-workspace">
      <div className="premise-workspace__header">
        <h2 className="premise-workspace__title">Premise Development</h2>
      </div>

      {/* Mode Selector */}
      <div className="premise-workspace__mode-selector">
        <button
          className={`premise-workspace__mode-btn ${
            conversationMode === 'free-form' ? 'premise-workspace__mode-btn--active' : ''
          }`}
          onClick={() => setConversationMode('free-form')}
          disabled={isGenerating}
        >
          Free-form
        </button>
        <button
          className={`premise-workspace__mode-btn ${
            conversationMode === 'guided' ? 'premise-workspace__mode-btn--active' : ''
          }`}
          onClick={() => setConversationMode('guided')}
          disabled={isGenerating}
        >
          Guided
        </button>
      </div>

      {/* Conversation Controls */}
      {conversationMode === 'guided' && (
        <div className="premise-workspace__conversation">
          <div className="premise-workspace__input-group">
            <textarea
              className="premise-workspace__input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response or question..."
              rows={3}
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSendMessage();
                }
              }}
            />
            <button
              className="premise-workspace__send-btn"
              onClick={handleSendMessage}
              disabled={!userInput.trim() || isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Send (Ctrl+Enter)'}
            </button>
          </div>

          {state.turnCount === 0 && (
            <button
              className="premise-workspace__start-btn"
              onClick={handleStartGuided}
              disabled={isGenerating}
            >
              Start Guided Conversation
            </button>
          )}
        </div>
      )}

      {/* Extract Assets Button */}
      {canExtract && (
        <div className="premise-workspace__extract">
          <button
            className="premise-workspace__extract-btn"
            onClick={handleExtractAssets}
            disabled={isGenerating}
          >
            Extract Assets
          </button>
          <p className="premise-workspace__extract-hint">
            Extract characters, settings, and outline from your conversation
          </p>
        </div>
      )}

      {/* Extraction Results */}
      {state.extractedAssets && (
        <div className="premise-workspace__results">
          <h3 className="premise-workspace__results-title">Extracted Assets</h3>

          {/* Characters */}
          {state.extractedAssets.characters.length > 0 && (
            <div className="premise-workspace__assets-group">
              <h4 className="premise-workspace__assets-heading">Characters</h4>
              {state.extractedAssets.characters.map((char, index) => (
                <div key={index} className="premise-workspace__asset-card">
                  <div className="premise-workspace__asset-header">
                    <strong>{char.name}</strong>
                    <button
                      className="premise-workspace__accept-btn"
                      onClick={() => acceptCharacter(index, storyId)}
                    >
                      Accept
                    </button>
                  </div>
                  <p className="premise-workspace__asset-desc">{char.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Settings */}
          {state.extractedAssets.settings.length > 0 && (
            <div className="premise-workspace__assets-group">
              <h4 className="premise-workspace__assets-heading">Settings</h4>
              {state.extractedAssets.settings.map((setting, index) => (
                <div key={index} className="premise-workspace__asset-card">
                  <div className="premise-workspace__asset-header">
                    <strong>{setting.name}</strong>
                    <button
                      className="premise-workspace__accept-btn"
                      onClick={() => acceptSetting(index, storyId)}
                    >
                      Accept
                    </button>
                  </div>
                  <p className="premise-workspace__asset-desc">{setting.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Outline */}
          {state.extractedAssets.plotPoints.length > 0 && (
            <div className="premise-workspace__assets-group">
              <h4 className="premise-workspace__assets-heading">Outline</h4>
              <div className="premise-workspace__asset-card">
                <ul className="premise-workspace__plot-list">
                  {state.extractedAssets.plotPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
                <button
                  className="premise-workspace__accept-btn premise-workspace__accept-btn--full"
                  onClick={() => acceptOutline(storyId)}
                >
                  Accept Outline
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Move to Outlining */}
      <div className="premise-workspace__actions">
        <button
          className="premise-workspace__transition-btn"
          onClick={handleMoveToOutlining}
        >
          Move to Outlining
        </button>
      </div>
    </div>
  );
}
