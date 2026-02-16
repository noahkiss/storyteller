// Outline editor UI for story outlines
// Shows outline status, edit button, and auto-detected library references

import { useOutline, useCreateOutline, useOutlineReferences } from '@/hooks/use-outlines';
import './OutlineEditor.css';

interface OutlineEditorProps {
  storyId: string;
  onEditOutline?: (outlineId: string, content: string) => void;
}

export function OutlineEditor({ storyId, onEditOutline }: OutlineEditorProps) {
  const { data: outline, isLoading } = useOutline(storyId);
  const { data: references = [] } = useOutlineReferences(storyId);
  const createOutline = useCreateOutline();

  const handleEditClick = async () => {
    let outlineToEdit = outline;

    // Create outline if it doesn't exist
    if (!outlineToEdit) {
      const newOutline = await createOutline.mutateAsync(storyId);
      outlineToEdit = newOutline;
    }

    // Trigger the edit callback with outline ID and content
    if (outlineToEdit && onEditOutline) {
      onEditOutline(outlineToEdit.id, outlineToEdit.content);
    }
  };

  if (isLoading) {
    return <div className="outline-editor__loading">Loading outline...</div>;
  }

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group references by type
  const characters = references.filter(ref => ref.type === 'character');
  const settings = references.filter(ref => ref.type === 'setting');

  return (
    <div className="outline-editor">
      <div className="outline-editor__header">
        <button
          className="outline-editor__edit-btn"
          onClick={handleEditClick}
          disabled={createOutline.isPending}
        >
          {outline ? 'Edit Outline' : 'Create Outline'}
        </button>

        <div className="outline-editor__status">
          {outline ? (
            <span className="outline-editor__status-text">
              Last edited: {formatDate(outline.updated_at)}
            </span>
          ) : (
            <span className="outline-editor__status-text outline-editor__status-text--empty">
              No outline yet
            </span>
          )}
        </div>
      </div>

      {outline && (
        <div className="outline-editor__references">
          <h4 className="outline-editor__references-title">Detected References</h4>

          {references.length === 0 && (
            <p className="outline-editor__references-empty">
              No library items detected in outline
            </p>
          )}

          {characters.length > 0 && (
            <div className="outline-editor__reference-group">
              <div className="outline-editor__reference-label">Characters:</div>
              <div className="outline-editor__reference-chips">
                {characters.map(ref => (
                  <span
                    key={ref.id}
                    className="outline-editor__reference-chip outline-editor__reference-chip--character"
                    title={`${ref.name} (${ref.occurrences} mentions)`}
                  >
                    {ref.name} ({ref.occurrences})
                  </span>
                ))}
              </div>
            </div>
          )}

          {settings.length > 0 && (
            <div className="outline-editor__reference-group">
              <div className="outline-editor__reference-label">Settings:</div>
              <div className="outline-editor__reference-chips">
                {settings.map(ref => (
                  <span
                    key={ref.id}
                    className="outline-editor__reference-chip outline-editor__reference-chip--setting"
                    title={`${ref.name} (${ref.occurrences} mentions)`}
                  >
                    {ref.name} ({ref.occurrences})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
