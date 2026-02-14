import { useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { testConnection, testGenerate } from '@/services/llm-client';
import { ConnectionStatus } from './ConnectionStatus';
import { ModelSelector } from './ModelSelector';
import { GenerationParams } from './GenerationParams';
import './SettingsPanel.css';

/**
 * Settings panel with connection configuration and generation parameters
 * Rendered as the content for the "Settings" tab in the left pane
 */
export function SettingsPanel() {
  const {
    baseURL,
    apiKey,
    model,
    connectionStatus,
    connectionError,
    updateSettings,
    setConnectionStatus,
    setAvailableModels,
  } = useSettingsStore();

  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingGenerate, setIsTestingGenerate] = useState(false);
  const [generateResult, setGenerateResult] = useState<string | null>(null);
  const [paramsExpanded, setParamsExpanded] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setGenerateResult(null);

    const result = await testConnection(baseURL, apiKey);

    if (result.success && result.models) {
      setConnectionStatus('connected');
      setAvailableModels(result.models);
    } else {
      setConnectionStatus('error', result.error || 'Connection failed');
    }

    setIsTesting(false);
  };

  const handleTestGenerate = async () => {
    if (!model) {
      setConnectionStatus('error', 'Please select a model first');
      return;
    }

    setIsTestingGenerate(true);
    setGenerateResult(null);

    const result = await testGenerate(baseURL, apiKey, model);

    if (result.success) {
      setGenerateResult(
        `✓ Generation successful (${result.latencyMs}ms)\nOutput: ${result.output}`
      );
      setConnectionStatus('connected');
    } else {
      setGenerateResult(`✗ Generation failed: ${result.error}`);
      setConnectionStatus('error', result.error || 'Generation failed');
    }

    setIsTestingGenerate(false);
  };

  const handleLoadSystemPrompt = () => {
    // TODO: Load system prompt into textarea
    // This will be implemented when integrating with the textarea component
    console.log('Load system prompt into textarea');
  };

  return (
    <div className="settings-panel">
      <div className="settings-section">
        <h3>Connection</h3>

        <div className="form-group">
          <label htmlFor="baseURL">Base URL</label>
          <input
            id="baseURL"
            type="text"
            value={baseURL}
            onChange={(e) => updateSettings({ baseURL: e.target.value })}
            placeholder="http://localhost:1234/v1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <div className="password-input">
            <input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
              placeholder="Optional for local LLMs"
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <ConnectionStatus
          status={connectionStatus}
          error={connectionError}
        />

        <div className="button-group">
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !baseURL}
            className="btn-primary"
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleTestGenerate}
            disabled={isTestingGenerate || !model || connectionStatus !== 'connected'}
            className="btn-secondary"
          >
            {isTestingGenerate ? 'Testing...' : 'Test Generate'}
          </button>
        </div>

        {generateResult && (
          <div className="generate-result">
            <pre>{generateResult}</pre>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>Model</h3>
        <ModelSelector />
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h3>Generation Parameters</h3>
          <button
            className="expand-toggle"
            onClick={() => setParamsExpanded(!paramsExpanded)}
          >
            {paramsExpanded ? '▼' : '▶'}
          </button>
        </div>
        {paramsExpanded && <GenerationParams />}
      </div>

      <div className="settings-section">
        <h3>System Prompt</h3>
        <button className="btn-secondary" onClick={handleLoadSystemPrompt}>
          Edit System Prompt
        </button>
        <p className="help-text">
          The system prompt defines how the AI behaves. Click to edit in the main textarea.
        </p>
      </div>
    </div>
  );
}
