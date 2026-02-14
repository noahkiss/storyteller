import './ConnectionStatus.css';

interface ConnectionStatusProps {
  status: 'disconnected' | 'connected' | 'error';
  error: string | null;
}

/**
 * Status badge showing LLM connection state
 * Green (connected), red (error), gray (disconnected)
 */
export function ConnectionStatus({ status, error }: ConnectionStatusProps) {
  const statusConfig = {
    connected: { color: '#4ade80', label: 'Connected' },
    error: { color: '#f87171', label: 'Error' },
    disconnected: { color: '#666', label: 'Not connected' },
  };

  const config = statusConfig[status];

  return (
    <div className="connection-status">
      <div className="status-badge">
        <span
          className="status-dot"
          style={{ backgroundColor: config.color }}
        />
        <span className="status-label">{config.label}</span>
      </div>
      {error && status === 'error' && (
        <div className="status-error">{error}</div>
      )}
    </div>
  );
}
