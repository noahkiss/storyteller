import { useEffect } from 'react';
import './GenerationControls.css';
import { GenerationStats } from './GenerationStats';

interface GenerationControlsProps {
  isGenerating: boolean;
  isStopping: boolean;
  error: string | null;
  tokensGenerated: number;
  tokensPerSecond: number;
  hasOutput: boolean;
  onGenerate: () => void;
  onStop: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
  onRetry: () => void;
}

/**
 * Button bar with Generate/Stop/Regenerate/Copy + stats and error display
 */
export function GenerationControls({
  isGenerating,
  isStopping,
  error,
  tokensGenerated,
  tokensPerSecond,
  hasOutput,
  onGenerate,
  onStop,
  onRegenerate,
  onCopy,
  onRetry,
}: GenerationControlsProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter to generate (if not generating)
      if (e.key === 'Enter' && e.ctrlKey && !isGenerating && !isStopping) {
        e.preventDefault();
        onGenerate();
      }

      // Escape to stop
      if (e.key === 'Escape' && isGenerating) {
        e.preventDefault();
        onStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, isStopping, onGenerate, onStop]);

  return (
    <div className="generation-controls">
      <div className="button-bar">
        {isGenerating ? (
          <button className="btn btn-stop" onClick={onStop}>
            Stop
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onGenerate}
            disabled={isStopping}
          >
            Generate
          </button>
        )}

        {!isGenerating && hasOutput && (
          <>
            <button className="btn" onClick={onRegenerate}>
              Regenerate
            </button>
            <button className="btn" onClick={onCopy}>
              Copy
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button className="btn btn-small" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      <GenerationStats
        isGenerating={isGenerating}
        tokensGenerated={tokensGenerated}
        tokensPerSecond={tokensPerSecond}
      />
    </div>
  );
}
