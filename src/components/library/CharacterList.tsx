import { useState } from 'react';
import { useLibraryItems, useCreateLibraryItem } from '@/hooks/use-library-items';
import { useLibraryStore } from '@/stores/library-store';
import { LibraryItem } from '@/types';
import { LibraryItemCard } from './LibraryItemCard';
import './CharacterList.css';

export function CharacterList() {
  const { data: characters, isLoading } = useLibraryItems('character');
  const createCharacter = useCreateLibraryItem();
  const { setActiveItem } = useLibraryStore();
  const [searchFilter, setSearchFilter] = useState('');

  const handleCreate = async () => {
    const newItem = await createCharacter.mutateAsync('character');
    // Auto-select the new item
    setActiveItem(newItem.id, newItem.type);
  };

  const handleSelect = (item: LibraryItem) => {
    setActiveItem(item.id, item.type);
  };

  // Filter characters by name
  const filteredCharacters = characters?.filter(char =>
    char.name.toLowerCase().includes(searchFilter.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="character-list__loading">Loading characters...</div>;
  }

  return (
    <div className="character-list">
      <div className="character-list__header">
        <button
          className="character-list__create-btn"
          onClick={handleCreate}
          disabled={createCharacter.isPending}
        >
          + New Character
        </button>
      </div>

      {(characters?.length || 0) > 0 && (
        <div className="character-list__search">
          <input
            type="text"
            className="character-list__search-input"
            placeholder="Search characters..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      )}

      <div className="character-list__items">
        {filteredCharacters.length === 0 && !searchFilter && (
          <div className="character-list__empty">
            No characters yet. Click "New Character" to create one.
          </div>
        )}

        {filteredCharacters.length === 0 && searchFilter && (
          <div className="character-list__empty">
            No characters match "{searchFilter}"
          </div>
        )}

        {filteredCharacters.map(character => (
          <LibraryItemCard
            key={character.id}
            item={character}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
