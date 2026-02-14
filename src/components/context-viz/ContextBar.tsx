import { ContextTier } from '@/types';
import './ContextBar.css';

interface ContextBarProps {
  segments: ContextTier[];
  maxTokens: number;
}

export function ContextBar({ segments, maxTokens }: ContextBarProps) {
  // Sort by priority (highest first) to match packing order
  const sorted = [...segments].sort((a, b) => b.priority - a.priority);

  const totalTokens = sorted.reduce((sum, seg) => sum + seg.tokens, 0);
  const unusedTokens = Math.max(0, maxTokens - totalTokens);

  return (
    <div className="context-bar-container">
      <div className="context-bar">
        {sorted.map((segment, idx) => {
          const widthPercent = (segment.tokens / maxTokens) * 100;
          // Minimum 2px width for visibility
          const minWidth = (2 / maxTokens) * 100;
          const finalWidth = Math.max(widthPercent, minWidth);
          const percentage = Math.round((segment.tokens / totalTokens) * 100);

          return (
            <div
              key={`${segment.label}-${idx}`}
              className="context-segment"
              style={{
                width: `${finalWidth}%`,
                backgroundColor: segment.color,
              }}
              title={`${segment.label}: ${segment.tokens} tokens (${percentage}%)`}
            />
          );
        })}

        {unusedTokens > 0 && (
          <div
            className="context-segment context-segment-unused"
            style={{
              width: `${(unusedTokens / maxTokens) * 100}%`,
            }}
            title={`Unused: ${unusedTokens} tokens`}
          />
        )}
      </div>
    </div>
  );
}
