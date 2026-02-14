import { useEffect, useState } from 'react';
import './GenerationStats.css';

interface GenerationStatsProps {
  isGenerating: boolean;
  tokensGenerated: number;
  tokensPerSecond: number;
}

/**
 * Compact stats bar showing token count, speed, and elapsed time
 * Visible during and after generation
 */
export function GenerationStats({
  isGenerating,
  tokensGenerated,
  tokensPerSecond,
}: GenerationStatsProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Track elapsed time during generation
  useEffect(() => {
    if (!isGenerating) {
      setElapsedSeconds(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Hide when not generating and no output
  if (!isGenerating && tokensGenerated === 0) {
    return null;
  }

  return (
    <div className="generation-stats">
      <span className="stat">
        <strong>{tokensGenerated}</strong> tokens
      </span>
      <span className="stat">
        <strong>{tokensPerSecond.toFixed(1)}</strong> tokens/sec
      </span>
      {isGenerating && (
        <span className="stat">
          <strong>{elapsedSeconds}</strong>s
        </span>
      )}
    </div>
  );
}
