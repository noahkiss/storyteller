import { useSettingsStore } from '@/stores/settings-store';
import { PresetSelector } from './PresetSelector';
import './GenerationParams.css';

/**
 * Generation parameter controls with sliders and number inputs
 * Collapsible section (collapsed by default)
 */
export function GenerationParams() {
  const { generationParams, updateGenerationParams } = useSettingsStore();

  const handleChange = (key: keyof typeof generationParams, value: number) => {
    updateGenerationParams({ [key]: value });
  };

  return (
    <div className="generation-params">
      <PresetSelector />

      <div className="param-control">
        <label htmlFor="temperature">
          Temperature: {generationParams.temperature.toFixed(1)}
        </label>
        <div className="slider-group">
          <input
            id="temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={generationParams.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
          />
          <input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={generationParams.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            className="number-input"
          />
        </div>
      </div>

      <div className="param-control">
        <label htmlFor="maxTokens">
          Max Tokens: {generationParams.maxTokens}
        </label>
        <div className="slider-group">
          <input
            id="maxTokens"
            type="range"
            min="64"
            max="8192"
            step="64"
            value={generationParams.maxTokens}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
          />
          <input
            type="number"
            min="64"
            max="8192"
            step="64"
            value={generationParams.maxTokens}
            onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
            className="number-input"
          />
        </div>
      </div>

      <div className="param-control">
        <label htmlFor="topP">
          Top P: {generationParams.topP.toFixed(2)}
        </label>
        <div className="slider-group">
          <input
            id="topP"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={generationParams.topP}
            onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
          />
          <input
            type="number"
            min="0"
            max="1"
            step="0.05"
            value={generationParams.topP}
            onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
            className="number-input"
          />
        </div>
      </div>

      <div className="param-control">
        <label htmlFor="frequencyPenalty">
          Frequency Penalty: {generationParams.frequencyPenalty.toFixed(1)}
        </label>
        <div className="slider-group">
          <input
            id="frequencyPenalty"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={generationParams.frequencyPenalty}
            onChange={(e) => handleChange('frequencyPenalty', parseFloat(e.target.value))}
          />
          <input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={generationParams.frequencyPenalty}
            onChange={(e) => handleChange('frequencyPenalty', parseFloat(e.target.value))}
            className="number-input"
          />
        </div>
      </div>

      <div className="param-control">
        <label htmlFor="presencePenalty">
          Presence Penalty: {generationParams.presencePenalty.toFixed(1)}
        </label>
        <div className="slider-group">
          <input
            id="presencePenalty"
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={generationParams.presencePenalty}
            onChange={(e) => handleChange('presencePenalty', parseFloat(e.target.value))}
          />
          <input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={generationParams.presencePenalty}
            onChange={(e) => handleChange('presencePenalty', parseFloat(e.target.value))}
            className="number-input"
          />
        </div>
      </div>
    </div>
  );
}
