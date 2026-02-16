import { useState } from 'react';
import { useAIConfigs, useCreateAIConfig, useDeleteAIConfig } from '@/hooks/use-ai-configs';
import { useStoryStore } from '@/stores/story-store';
import { AIConfig } from '@/types';
import { parseMarkdown } from '@/services/markdown';
import type { AIConfigFrontmatter } from '@/types';
import './AIConfigList.css';

export function AIConfigList() {
  const { activeStoryId } = useStoryStore();
  const { data: globalConfigs, isLoading: loadingGlobal } = useAIConfigs();
  const { data: storyConfigs, isLoading: loadingStory } = useAIConfigs(activeStoryId || undefined);
  const createAIConfig = useCreateAIConfig();
  const deleteAIConfig = useDeleteAIConfig();
  const [newConfigName, setNewConfigName] = useState('');
  const [showNewConfigInput, setShowNewConfigInput] = useState<'global' | 'story' | null>(null);

  const handleCreateGlobal = async () => {
    if (!newConfigName.trim()) return;
    await createAIConfig.mutateAsync({
      name: newConfigName.trim(),
      isGlobal: true
    });
    setNewConfigName('');
    setShowNewConfigInput(null);
  };

  const handleCreateStory = async () => {
    if (!newConfigName.trim() || !activeStoryId) return;
    await createAIConfig.mutateAsync({
      name: newConfigName.trim(),
      isGlobal: false,
      storyId: activeStoryId
    });
    setNewConfigName('');
    setShowNewConfigInput(null);
  };

  const handleDuplicate = async (config: AIConfig) => {
    if (!activeStoryId) return;
    const { data } = parseMarkdown<AIConfigFrontmatter>(config.content);
    await createAIConfig.mutateAsync({
      name: `${data.name} (Story Copy)`,
      isGlobal: false,
      storyId: activeStoryId
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this AI config?')) {
      try {
        await deleteAIConfig.mutateAsync(id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete');
      }
    }
  };

  const handleLoadConfig = (id: string) => {
    // Signal to load this config into the textarea
    // This will be handled by the parent component through contentId
    window.dispatchEvent(new CustomEvent('load-content', {
      detail: { contentId: `ai-config-${id}` }
    }));
  };

  const renderConfigCard = (config: AIConfig, showDuplicate: boolean = false) => {
    const { data } = parseMarkdown<AIConfigFrontmatter>(config.content);
    const isDefault = config.name === 'Default';

    return (
      <div key={config.id} className="ai-config-card">
        <div className="ai-config-card__header" onClick={() => handleLoadConfig(config.id)}>
          <h3 className="ai-config-card__name">{config.name}</h3>
          <span className="ai-config-card__badge">{data.stage || 'general'}</span>
        </div>
        <div className="ai-config-card__meta">
          {config.is_global ? (
            <span className="ai-config-card__scope">Global</span>
          ) : (
            <span className="ai-config-card__scope ai-config-card__scope--story">Story</span>
          )}
        </div>
        <div className="ai-config-card__actions">
          {showDuplicate && (
            <button
              className="ai-config-card__duplicate-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicate(config);
              }}
              disabled={!activeStoryId}
              title="Create story-specific copy"
            >
              Duplicate to Story
            </button>
          )}
          {!isDefault && (
            <button
              className="ai-config-card__delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(config.id);
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  };

  if (loadingGlobal) {
    return <div className="ai-config-list__loading">Loading AI configs...</div>;
  }

  return (
    <div className="ai-config-list">
      {/* Global Configs Section */}
      <section className="ai-config-section">
        <div className="ai-config-section__header">
          <h2 className="ai-config-section__title">Global Configs</h2>
          {showNewConfigInput !== 'global' ? (
            <button
              className="ai-config-section__new-btn"
              onClick={() => setShowNewConfigInput('global')}
            >
              + New
            </button>
          ) : (
            <div className="ai-config-section__new-input">
              <input
                type="text"
                placeholder="Config name..."
                value={newConfigName}
                onChange={(e) => setNewConfigName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateGlobal();
                  if (e.key === 'Escape') {
                    setShowNewConfigInput(null);
                    setNewConfigName('');
                  }
                }}
                autoFocus
              />
              <button onClick={handleCreateGlobal} disabled={!newConfigName.trim()}>
                Create
              </button>
              <button onClick={() => {
                setShowNewConfigInput(null);
                setNewConfigName('');
              }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="ai-config-section__list">
          {globalConfigs?.length === 0 && (
            <div className="ai-config-list__empty">No global configs yet.</div>
          )}
          {globalConfigs?.map(config => renderConfigCard(config, true))}
        </div>
      </section>

      {/* Story Configs Section (only if story is active) */}
      {activeStoryId && (
        <section className="ai-config-section">
          <div className="ai-config-section__header">
            <h2 className="ai-config-section__title">Story Configs</h2>
            {showNewConfigInput !== 'story' ? (
              <button
                className="ai-config-section__new-btn"
                onClick={() => setShowNewConfigInput('story')}
              >
                + New
              </button>
            ) : (
              <div className="ai-config-section__new-input">
                <input
                  type="text"
                  placeholder="Config name..."
                  value={newConfigName}
                  onChange={(e) => setNewConfigName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateStory();
                    if (e.key === 'Escape') {
                      setShowNewConfigInput(null);
                      setNewConfigName('');
                    }
                  }}
                  autoFocus
                />
                <button onClick={handleCreateStory} disabled={!newConfigName.trim()}>
                  Create
                </button>
                <button onClick={() => {
                  setShowNewConfigInput(null);
                  setNewConfigName('');
                }}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="ai-config-section__list">
            {loadingStory && <div className="ai-config-list__loading">Loading...</div>}
            {storyConfigs?.length === 0 && (
              <div className="ai-config-list__empty">
                No story-specific configs. Create a new one or duplicate a global config.
              </div>
            )}
            {storyConfigs?.map(config => renderConfigCard(config, false))}
          </div>
        </section>
      )}
    </div>
  );
}
