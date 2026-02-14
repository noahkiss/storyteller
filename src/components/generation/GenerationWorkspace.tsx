import { useState } from 'react';
import './GenerationWorkspace.css';
import { GenerationControls } from './GenerationControls';
import { PromptHistory } from './PromptHistory';
import { useGeneration } from '@/hooks/use-generation';
import { usePromptHistory } from '@/hooks/use-prompt-history';
import { useGenerationStore } from '@/stores/generation-store';
import type { Generation } from '@/types';

/**
 * Generation workspace - left pane content for the Generation tab
 * Layout: prompt input → controls → history list
 */
export function GenerationWorkspace() {
  const [promptContent, setPromptContent] = useState('');
  const { generations } = usePromptHistory();
  const { currentOutput, setOutput } = useGenerationStore();

  const {
    isGenerating,
    isStopping,
    error,
    tokensGenerated,
    tokensPerSecond,
    generate,
    regenerate,
    stop,
    copyOutput,
  } = useGeneration();

  const handleGenerate = async () => {
    if (promptContent.trim()) {
      await generate(promptContent.trim());
    }
  };

  const handleRetry = async () => {
    if (promptContent.trim()) {
      await generate(promptContent.trim());
    }
  };

  const handleSelectHistory = (gen: Generation) => {
    // Load prompt into prompt textarea
    setPromptContent(gen.prompt);

    // Load output into generation output (will be shown in right pane)
    setOutput(gen.output);
  };

  return (
    <div className="generation-workspace">
      <div className="prompt-section">
        <label className="section-label">Prompt</label>
        <textarea
          className="prompt-input"
          value={promptContent}
          onChange={(e) => setPromptContent(e.target.value)}
          placeholder="Write your prompt here..."
          disabled={isGenerating}
        />
      </div>

      <GenerationControls
        isGenerating={isGenerating}
        isStopping={isStopping}
        error={error}
        tokensGenerated={tokensGenerated}
        tokensPerSecond={tokensPerSecond}
        hasOutput={!!currentOutput}
        onGenerate={handleGenerate}
        onStop={stop}
        onRegenerate={regenerate}
        onCopy={copyOutput}
        onRetry={handleRetry}
      />

      <PromptHistory generations={generations} onSelect={handleSelectHistory} />
    </div>
  );
}
