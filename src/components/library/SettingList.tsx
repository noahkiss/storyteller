import { useState } from 'react';
import { useLibraryItems, useCreateLibraryItem } from '@/hooks/use-library-items';
import { useLibraryStore } from '@/stores/library-store';
import { LibraryItem } from '@/types';
import { LibraryItemCard } from './LibraryItemCard';
import './SettingList.css';

export function SettingList() {
  const { data: settings, isLoading } = useLibraryItems('setting');
  const createSetting = useCreateLibraryItem();
  const { setActiveItem } = useLibraryStore();
  const [searchFilter, setSearchFilter] = useState('');

  const handleCreate = async () => {
    const newItem = await createSetting.mutateAsync('setting');
    // Auto-select the new item
    setActiveItem(newItem.id, newItem.type);
  };

  const handleSelect = (item: LibraryItem) => {
    setActiveItem(item.id, item.type);
  };

  // Filter settings by name
  const filteredSettings = settings?.filter(setting =>
    setting.name.toLowerCase().includes(searchFilter.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="setting-list__loading">Loading settings...</div>;
  }

  return (
    <div className="setting-list">
      <div className="setting-list__header">
        <button
          className="setting-list__create-btn"
          onClick={handleCreate}
          disabled={createSetting.isPending}
        >
          + New Setting
        </button>
      </div>

      {(settings?.length || 0) > 0 && (
        <div className="setting-list__search">
          <input
            type="text"
            className="setting-list__search-input"
            placeholder="Search settings..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      )}

      <div className="setting-list__items">
        {filteredSettings.length === 0 && !searchFilter && (
          <div className="setting-list__empty">
            No settings yet. Click "New Setting" to create one.
          </div>
        )}

        {filteredSettings.length === 0 && searchFilter && (
          <div className="setting-list__empty">
            No settings match "{searchFilter}"
          </div>
        )}

        {filteredSettings.map(setting => (
          <LibraryItemCard
            key={setting.id}
            item={setting}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
