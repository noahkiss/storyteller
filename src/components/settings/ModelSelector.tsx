import { useState } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { fetchModels } from '@/services/llm-client';
import './ModelSelector.css';

/**
 * Model selector with auto-discovery and manual input fallback
 * Shows dropdown if models discovered, text input otherwise
 */
export function ModelSelector() {
  const {
    baseURL,
    apiKey,
    model,
    availableModels,
    updateSettings,
    setAvailableModels,
  } = useSettingsStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [manualMode, setManualMode] = useState(availableModels.length === 0);

  const handleRefreshModels = async () => {
    setIsRefreshing(true);
    const models = await fetchModels(baseURL, apiKey);

    if (models.length > 0) {
      setAvailableModels(models);
      setManualMode(false);
    } else {
      setManualMode(true);
    }

    setIsRefreshing(false);
  };

  return (
    <div className="model-selector">
      {manualMode ? (
        <>
          <div className="form-group">
            <label htmlFor="model">Model Name</label>
            <input
              id="model"
              type="text"
              value={model}
              onChange={(e) => updateSettings({ model: e.target.value })}
              placeholder="e.g., gpt-3.5-turbo"
            />
          </div>
          <button
            className="btn-secondary refresh-btn"
            onClick={handleRefreshModels}
            disabled={isRefreshing || !baseURL}
          >
            {isRefreshing ? 'Refreshing...' : 'Try Auto-Discovery'}
          </button>
        </>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="model">Select Model</label>
            <select
              id="model"
              value={model}
              onChange={(e) => updateSettings({ model: e.target.value })}
            >
              <option value="">-- Select a model --</option>
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-secondary refresh-btn"
            onClick={handleRefreshModels}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Models'}
          </button>
          <button
            className="btn-text"
            onClick={() => setManualMode(true)}
          >
            Enter manually
          </button>
        </>
      )}
    </div>
  );
}
