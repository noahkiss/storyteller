import { LibraryItem } from '@/types';
import { useLibraryStore } from '@/stores/library-store';
import { useDeleteLibraryItem } from '@/hooks/use-library-items';
import './LibraryItemCard.css';

interface LibraryItemCardProps {
  item: LibraryItem;
  onSelect: (item: LibraryItem) => void;
}

export function LibraryItemCard({ item, onSelect }: LibraryItemCardProps) {
  const { activeItemId } = useLibraryStore();
  const deleteItem = useDeleteLibraryItem();
  const isActive = activeItemId === item.id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger card click
    if (confirm(`Delete "${item.name}"?`)) {
      deleteItem.mutate({ id: item.id, type: item.type });
    }
  };

  return (
    <div
      className={`library-card ${isActive ? 'library-card--active' : ''}`}
      onClick={() => onSelect(item)}
    >
      <div className="library-card__header">
        <h3 className="library-card__name">{item.name || 'Untitled'}</h3>
        <button
          className="library-card__delete"
          onClick={handleDelete}
          title="Delete"
          aria-label="Delete item"
        >
          ×
        </button>
      </div>

      <div className="library-card__metadata">
        {item.category && (
          <span className="library-card__badge library-card__badge--category">
            {item.category}
          </span>
        )}
        {item.tags.map(tag => (
          <span key={tag} className="library-card__badge library-card__badge--tag">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
