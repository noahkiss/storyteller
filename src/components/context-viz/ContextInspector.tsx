import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ContextTier } from '@/types';
import './ContextInspector.css';

interface ContextInspectorProps {
  tier: ContextTier;
  onClose: () => void;
}

export function ContextInspector({ tier, onClose }: ContextInspectorProps) {
  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="inspector-overlay" onClick={onClose}>
      <div className="inspector-panel" onClick={(e) => e.stopPropagation()}>
        <div className="inspector-header">
          <div className="inspector-title">
            <span
              className="inspector-color-dot"
              style={{ backgroundColor: tier.color }}
            />
            <h4>{tier.label}</h4>
            <span className="inspector-token-count">{tier.tokens} tokens</span>
          </div>
          <button className="inspector-close" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>
        <div className="inspector-body">
          <ReactMarkdown>{tier.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
