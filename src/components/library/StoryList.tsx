import { useState } from 'react';
import { useStories, useCreateStory, useDeleteStory } from '@/hooks/use-stories';
import { useStoryItems, useForkLibraryItem, useCheckForUpdates } from '@/hooks/use-forked-content';
import { useLibraryItems, useLibraryItem } from '@/hooks/use-library-items';
import { useStoryStore } from '@/stores/story-store';
import type { Story, StoryItem, LibraryItem } from '@/types';
import './StoryList.css';

export function StoryList() {
  const { data: stories, isLoading } = useStories();
  const createStory = useCreateStory();
  const deleteStory = useDeleteStory();
  const { activeStoryId, setActiveStory } = useStoryStore();

  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);

  const handleCreateStart = () => {
    setIsCreating(true);
  };

  const handleCreateSubmit = async () => {
    if (!newStoryTitle.trim()) return;

    await createStory.mutateAsync(newStoryTitle);
    setNewStoryTitle('');
    setIsCreating(false);
  };

  const handleCreateCancel = () => {
    setNewStoryTitle('');
    setIsCreating(false);
  };

  const handleSelectStory = (story: Story) => {
    setActiveStory(story.id);
    setExpandedStoryId(expandedStoryId === story.id ? null : story.id);
  };

  const handleDeleteStory = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (confirm('Delete this story and all its content?')) {
      deleteStory.mutate(storyId);
      if (activeStoryId === storyId) {
        setActiveStory(null);
      }
    }
  };

  if (isLoading) {
    return <div className="story-list__loading">Loading stories...</div>;
  }

  return (
    <div className="story-list">
      <div className="story-list__header">
        {!isCreating ? (
          <button
            className="story-list__create-btn"
            onClick={handleCreateStart}
          >
            + New Story
          </button>
        ) : (
          <div className="story-list__create-form">
            <input
              type="text"
              className="story-list__title-input"
              placeholder="Story title..."
              value={newStoryTitle}
              onChange={(e) => setNewStoryTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateSubmit();
                if (e.key === 'Escape') handleCreateCancel();
              }}
              autoFocus
            />
            <div className="story-list__create-actions">
              <button
                className="story-list__create-confirm"
                onClick={handleCreateSubmit}
                disabled={!newStoryTitle.trim() || createStory.isPending}
              >
                Create
              </button>
              <button
                className="story-list__create-cancel"
                onClick={handleCreateCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="story-list__items">
        {stories?.length === 0 && (
          <div className="story-list__empty">
            No stories yet. Click "New Story" to create one.
          </div>
        )}

        {stories?.map(story => (
          <StoryCard
            key={story.id}
            story={story}
            isActive={activeStoryId === story.id}
            isExpanded={expandedStoryId === story.id}
            onSelect={handleSelectStory}
            onDelete={(e) => handleDeleteStory(e, story.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface StoryCardProps {
  story: Story;
  isActive: boolean;
  isExpanded: boolean;
  onSelect: (story: Story) => void;
  onDelete: (e: React.MouseEvent) => void;
}

function StoryCard({ story, isActive, isExpanded, onSelect, onDelete }: StoryCardProps) {
  const { data: storyItems } = useStoryItems(isExpanded ? story.id : null);
  const { data: updateCheck } = useCheckForUpdates(isExpanded ? story.id : null);
  const forkLibraryItem = useForkLibraryItem();

  const [showForkMenu, setShowForkMenu] = useState(false);
  const [forkType, setForkType] = useState<'character' | 'setting' | null>(null);

  // Conditionally query library items based on fork type selection
  const { data: characters } = useLibraryItems('character');
  const { data: settings } = useLibraryItems('setting');

  const handleForkItem = async (libraryItemId: string) => {
    await forkLibraryItem.mutateAsync({
      storyId: story.id,
      libraryItemId
    });
    setShowForkMenu(false);
    setForkType(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: Story['status']) => {
    return `story-card__status-badge story-card__status-badge--${status}`;
  };

  const hasUpdates = updateCheck?.some((item: { hasUpdate: boolean }) => item.hasUpdate) || false;

  return (
    <div
      className={`story-card ${isActive ? 'story-card--active' : ''}`}
      onClick={() => onSelect(story)}
    >
      <div className="story-card__header">
        <h3 className="story-card__title">{story.title}</h3>
        <button
          className="story-card__delete"
          onClick={onDelete}
          title="Delete story"
          aria-label="Delete story"
        >
          ×
        </button>
      </div>

      <div className="story-card__metadata">
        <span className={getStatusBadgeClass(story.status)}>
          {story.status}
        </span>
        <span className="story-card__date">
          {formatDate(story.created_at)}
        </span>
        {hasUpdates && (
          <span className="story-card__update-badge">
            Updates available
          </span>
        )}
      </div>

      {isExpanded && (
        <div className="story-card__content">
          <div className="story-card__fork-section">
            <div className="story-card__fork-header">
              <h4 className="story-card__fork-title">Story Items</h4>
              {!showForkMenu ? (
                <button
                  className="story-card__fork-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowForkMenu(true);
                  }}
                >
                  + Add Item
                </button>
              ) : (
                <div className="story-card__fork-menu" onClick={(e) => e.stopPropagation()}>
                  {!forkType ? (
                    <>
                      <button
                        className="story-card__fork-type-btn"
                        onClick={() => setForkType('character')}
                      >
                        Character
                      </button>
                      <button
                        className="story-card__fork-type-btn"
                        onClick={() => setForkType('setting')}
                      >
                        Setting
                      </button>
                      <button
                        className="story-card__fork-cancel"
                        onClick={() => setShowForkMenu(false)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="story-card__fork-list">
                      <div className="story-card__fork-list-header">
                        <span>Select {forkType}:</span>
                        <button
                          className="story-card__fork-back"
                          onClick={() => setForkType(null)}
                        >
                          ← Back
                        </button>
                      </div>
                      {(forkType === 'character' ? characters : settings)?.map((item: LibraryItem) => (
                        <button
                          key={item.id}
                          className="story-card__fork-item-btn"
                          onClick={() => handleForkItem(item.id)}
                          disabled={forkLibraryItem.isPending}
                        >
                          {item.name || 'Untitled'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="story-card__items">
              {storyItems?.length === 0 && (
                <div className="story-card__items-empty">
                  No items yet. Add characters or settings from your library.
                </div>
              )}

              {storyItems?.map(item => {
                const itemUpdate = updateCheck?.find((u: { storyItem: StoryItem }) => u.storyItem.id === item.id);
                return (
                  <ForkedItemCard
                    key={item.id}
                    storyItem={item}
                    hasUpdate={itemUpdate?.hasUpdate || false}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ForkedItemCardProps {
  storyItem: StoryItem;
  hasUpdate: boolean;
}

function ForkedItemCard({ storyItem, hasUpdate }: ForkedItemCardProps) {
  // Fetch library item to get name
  const { data: libraryItem } = useLibraryItem(storyItem.library_id);

  return (
    <div className="forked-item">
      <div className="forked-item__name">
        {libraryItem?.name || 'Unknown Item'}
      </div>
      <div className="forked-item__badges">
        {storyItem.has_local_changes && (
          <span className="forked-item__badge forked-item__badge--modified">
            Modified
          </span>
        )}
        {hasUpdate && (
          <span className="forked-item__badge forked-item__badge--update">
            Update Available
          </span>
        )}
      </div>
    </div>
  );
}
