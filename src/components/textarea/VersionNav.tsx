import './VersionNav.css';

interface VersionNavProps {
  currentIndex: number | null;
  versionCount: number;
  isViewingHistory: boolean;
  onBack: () => void;
  onForward: () => void;
  onReturnToCurrent: () => void;
  isSaving?: boolean;
}

export function VersionNav({
  currentIndex,
  versionCount,
  isViewingHistory,
  onBack,
  onForward,
  onReturnToCurrent,
  isSaving = false
}: VersionNavProps) {
  const displayIndex = currentIndex !== null ? currentIndex + 1 : versionCount;
  const canGoBack = currentIndex !== null ? currentIndex > 0 : versionCount > 0;
  const canGoForward = currentIndex !== null && currentIndex < versionCount - 1;

  return (
    <div className="version-nav">
      <div className="version-nav__controls">
        <button
          className="version-nav__button"
          onClick={onBack}
          disabled={!canGoBack}
          aria-label="Go to previous version"
        >
          ←
        </button>
        <span className="version-nav__indicator">
          Version {displayIndex} of {versionCount || 1}
        </span>
        <button
          className="version-nav__button"
          onClick={onForward}
          disabled={!canGoForward}
          aria-label="Go to next version"
        >
          →
        </button>
      </div>
      <div className="version-nav__status">
        {isSaving && <span className="version-nav__saving">Saving...</span>}
        {isViewingHistory && (
          <button
            className="version-nav__return"
            onClick={onReturnToCurrent}
          >
            Return to current
          </button>
        )}
      </div>
    </div>
  );
}
