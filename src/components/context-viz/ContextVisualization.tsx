import { ContextTier, CompressionEvent } from '@/types';
import { ContextBar } from './ContextBar';
import { ContextItemList } from './ContextItemList';
import { CompressionLog } from './CompressionLog';
import './ContextVisualization.css';

interface ContextVisualizationProps {
  segments: ContextTier[];
  maxTokens: number;
  compressionEvents: CompressionEvent[];
}

export function ContextVisualization({
  segments,
  maxTokens,
  compressionEvents,
}: ContextVisualizationProps) {
  const totalTokens = segments.reduce((sum, seg) => sum + seg.tokens, 0);
  const percentage = maxTokens > 0 ? Math.round((totalTokens / maxTokens) * 100) : 0;

  return (
    <div className="context-visualization">
      <div className="context-header">
        <h3>Context Budget</h3>
        <div className="token-counter">
          {totalTokens} / {maxTokens} tokens ({percentage}%)
        </div>
      </div>

      {segments.length === 0 ? (
        <div className="empty-state">
          Generate text to see context breakdown
        </div>
      ) : (
        <>
          <ContextBar segments={segments} maxTokens={maxTokens} />
          <ContextItemList segments={segments} maxTokens={maxTokens} />
          <CompressionLog events={compressionEvents} />
        </>
      )}
    </div>
  );
}
