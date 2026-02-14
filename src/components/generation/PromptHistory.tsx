import { formatDistanceToNow } from 'date-fns';
import './PromptHistory.css';
import type { Generation } from '@/types';

interface PromptHistoryProps {
  generations: Generation[];
  onSelect: (generation: Generation) => void;
}

/**
 * Scrollable list of previous generations with click-to-reuse
 */
export function PromptHistory({ generations, onSelect }: PromptHistoryProps) {
  if (generations.length === 0) {
    return (
      <div className="prompt-history empty">
        <p>No generations yet. Type a prompt and click Generate.</p>
      </div>
    );
  }

  return (
    <div className="prompt-history">
      <div className="history-header">
        <h3>Prompt History</h3>
      </div>
      <div className="history-list">
        {generations.map((gen) => {
          const firstLine = gen.prompt.split('\n')[0];
          const truncated =
            firstLine.length > 60
              ? firstLine.substring(0, 60) + '...'
              : firstLine;

          return (
            <button
              key={gen.id}
              className="history-item"
              onClick={() => onSelect(gen)}
            >
              <div className="item-prompt">{truncated}</div>
              <div className="item-meta">
                <span className="model">{gen.model}</span>
                <span className="tokens">{gen.token_count} tokens</span>
                <span className="time">
                  {formatDistanceToNow(gen.created_at, { addSuffix: true })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
