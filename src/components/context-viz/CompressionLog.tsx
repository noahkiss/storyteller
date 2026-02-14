import { useState } from 'react';
import { CompressionEvent } from '@/types';
import './CompressionLog.css';

interface CompressionLogProps {
  events: CompressionEvent[];
  onClear?: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

export function CompressionLog({ events, onClear }: CompressionLogProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="compression-log-container">
      <button
        className="log-toggle"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▼' : '▶'} Compression Log
        {events.length > 0 && (
          <span className="event-count-badge">{events.length}</span>
        )}
      </button>

      {expanded && (
        <div className="compression-log">
          {events.length === 0 ? (
            <div className="log-empty">No compression events yet</div>
          ) : (
            <>
              <div className="log-events">
                {events.map((event) => {
                  const ratio = (event.original_tokens / event.compressed_tokens).toFixed(1);

                  return (
                    <div key={event.id} className="log-event">
                      <span className="event-time">
                        {formatRelativeTime(event.created_at)}
                      </span>
                      <span className="event-description">
                        {event.source_tier} → {event.target_tier}:{' '}
                        {event.original_tokens} → {event.compressed_tokens} tokens
                      </span>
                      <span className="event-ratio">({ratio}x)</span>
                    </div>
                  );
                })}
              </div>
              {onClear && (
                <button className="log-clear-button" onClick={onClear}>
                  Clear Log
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
