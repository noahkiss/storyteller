import { useState } from 'react';
import { ContextTier } from '@/types';
import { ContextInspector } from './ContextInspector';
import './ContextItemList.css';

interface ContextItemListProps {
  segments: ContextTier[];
  maxTokens: number;
}

export function ContextItemList({ segments, maxTokens }: ContextItemListProps) {
  const [expanded, setExpanded] = useState(false);
  const [inspecting, setInspecting] = useState<ContextTier | null>(null);

  // Sort by priority (highest first)
  const sorted = [...segments].sort((a, b) => b.priority - a.priority);
  const totalTokens = sorted.reduce((sum, seg) => sum + seg.tokens, 0);

  return (
    <>
      <div className="context-item-list-container">
        <button
          className="expand-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '▼' : '▶'} {expanded ? 'Hide Details' : 'Show Details'}
        </button>

        {expanded && (
          <div className="context-items">
            {sorted.map((segment, idx) => {
              const percentage = Math.round((segment.tokens / totalTokens) * 100);
              const barWidth = (segment.tokens / maxTokens) * 100;

              return (
                <div key={`${segment.label}-${idx}`} className="context-item">
                  <div className="item-header">
                    <div className="item-label">
                      <span
                        className="color-dot"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="label-text">{segment.label}</span>
                    </div>
                    <div className="item-stats">
                      <span className="token-count">{segment.tokens} tokens</span>
                      <span className="percentage">({percentage}%)</span>
                      <button
                        className="inspect-button"
                        onClick={() => setInspecting(segment)}
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                  <div className="item-progress">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: segment.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {inspecting && (
        <ContextInspector
          tier={inspecting}
          onClose={() => setInspecting(null)}
        />
      )}
    </>
  );
}
