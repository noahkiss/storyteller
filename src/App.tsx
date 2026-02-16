import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Allotment } from 'allotment'
import './App.css'
import { initDatabase } from './services/db'
import { SplitLayout } from './components/split-layout/SplitLayout'
import { TabSystem, TabDefinition } from './components/tabs/TabSystem'
import { EnhancedTextarea } from './components/textarea/EnhancedTextarea'
import { ContextVisualization } from './components/context-viz/ContextVisualization'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { StoryList } from './components/library/StoryList'
import { CharacterList } from './components/library/CharacterList'
import { SettingList } from './components/library/SettingList'
import { TemplateList } from './components/library/TemplateList'
import { AIConfigList } from './components/library/AIConfigList'
import { MarkerControls } from './components/markers/MarkerControls'
import { useCompressionLog } from './hooks/use-compression-log'
import { useGenerationStore } from './stores/generation-store'
import { useUIStore } from './stores/ui-store'
import { useLibraryStore } from './stores/library-store'
import { useLibraryItem, useUpdateLibraryItem } from './hooks/use-library-items'
import { useTemplate, useUpdateTemplate } from './hooks/use-templates'
import { useAIConfig, useUpdateAIConfig } from './hooks/use-ai-configs'

const queryClient = new QueryClient()

function App() {
  const [dbReady, setDbReady] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    initDatabase()
      .then(() => {
        console.log('[App] Database ready')
        setDbReady(true)
      })
      .catch((error) => {
        console.error('[App] Database initialization failed:', error)
        setDbError(error.message)
      })
  }, [])

  if (dbError) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Storyteller</h1>
        <p style={{ color: 'red' }}>Database initialization failed: {dbError}</p>
      </div>
    )
  }

  if (!dbReady) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Storyteller</h1>
        <p>Initializing database...</p>
      </div>
    )
  }

  const tabs: TabDefinition[] = [
    { id: 'stories', label: 'Stories', content: <StoryList /> },
    { id: 'characters', label: 'Characters', content: <CharacterList /> },
    { id: 'settings', label: 'Settings', content: <SettingList /> },
    { id: 'templates', label: 'Templates', content: <TemplateList /> },
    { id: 'ai-config', label: 'AI Config', content: <AIConfigList /> },
  ]

  // Right pane content with context-aware routing
  const RightPaneContent = () => {
    const { events } = useCompressionLog();
    const { contextTiers, maxContextTokens, currentOutput } = useGenerationStore();
    const { activeTab, activeContent, showAppSettings, setShowAppSettings } = useUIStore();
    const { activeItemId } = useLibraryStore();
    const { data: activeLibraryItem } = useLibraryItem(activeItemId);
    const updateLibraryItem = useUpdateLibraryItem();

    // Fetch template if active content is a template
    const { data: activeTemplate } = useTemplate(
      activeContent.type === 'template' ? activeContent.id : null
    );
    const updateTemplate = useUpdateTemplate();

    // Fetch AI config if active content is an AI config
    const { data: activeAIConfig } = useAIConfig(
      activeContent.type === 'ai-config' ? activeContent.id : null
    );
    const updateAIConfig = useUpdateAIConfig();

    // Listen for load-content events from list components
    useEffect(() => {
      const handleLoadContent = (e: Event) => {
        const customEvent = e as CustomEvent;
        const { contentId } = customEvent.detail;

        // Parse contentId to determine type and id
        if (contentId.startsWith('template-')) {
          const id = contentId.replace('template-', '');
          useUIStore.getState().setActiveContent('template', id);
        } else if (contentId.startsWith('ai-config-')) {
          const id = contentId.replace('ai-config-', '');
          useUIStore.getState().setActiveContent('ai-config', id);
        }
      };

      window.addEventListener('load-content', handleLoadContent);
      return () => window.removeEventListener('load-content', handleLoadContent);
    }, []);

    // Handle library item edits
    const handleLibraryItemEdit = (newContent: string) => {
      if (activeItemId) {
        updateLibraryItem.mutate({ id: activeItemId, content: newContent });
      }
    };

    // Handle template edits
    const handleTemplateEdit = (newContent: string) => {
      if (activeContent.type === 'template' && activeContent.id) {
        updateTemplate.mutate({ id: activeContent.id, content: newContent });
      }
    };

    // Handle AI config edits
    const handleAIConfigEdit = (newContent: string) => {
      if (activeContent.type === 'ai-config' && activeContent.id) {
        updateAIConfig.mutate({ id: activeContent.id, content: newContent });
      }
    };

    // App Settings modal/panel
    if (showAppSettings) {
      return (
        <div style={{ position: 'relative', height: '100%' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--background)',
            zIndex: 100,
            overflow: 'auto',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Application Settings</h2>
              <button
                onClick={() => setShowAppSettings(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--foreground)'
                }}
              >
                ×
              </button>
            </div>
            <SettingsPanel />
          </div>
        </div>
      );
    }

    // Template tab: if a template is active, show it in textarea
    if (activeTab === 'templates' && activeTemplate) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
            <MarkerControls
              content={activeTemplate.content}
              contentId={activeContent.contentId || ''}
              onContentUpdate={handleTemplateEdit}
            />
          </div>
          <div style={{ flex: 1 }}>
            <EnhancedTextarea
              contentId={activeContent.contentId || `template-${activeContent.id}`}
              externalValue={activeTemplate.content}
              onEdit={handleTemplateEdit}
              placeholder="Select a template to edit..."
            />
          </div>
        </div>
      );
    }

    // Templates tab with no selection
    if (activeTab === 'templates') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
          Select a template to edit
        </div>
      );
    }

    // AI Config tab: if a config is active, show it in textarea
    if (activeTab === 'ai-config' && activeAIConfig) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
            <MarkerControls
              content={activeAIConfig.content}
              contentId={activeContent.contentId || ''}
              onContentUpdate={handleAIConfigEdit}
            />
          </div>
          <div style={{ flex: 1 }}>
            <EnhancedTextarea
              contentId={activeContent.contentId || `ai-config-${activeContent.id}`}
              externalValue={activeAIConfig.content}
              onEdit={handleAIConfigEdit}
              placeholder="Select an AI config to edit..."
            />
          </div>
        </div>
      );
    }

    // AI Config tab with no selection
    if (activeTab === 'ai-config') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
          Select an AI config to edit
        </div>
      );
    }

    // Characters or Settings tab: show selected library item in textarea
    if ((activeTab === 'characters' || activeTab === 'settings') && activeItemId && activeLibraryItem) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
            <MarkerControls
              content={activeLibraryItem.content}
              contentId={`library-${activeItemId}`}
              onContentUpdate={handleLibraryItemEdit}
            />
          </div>
          <div style={{ flex: 1 }}>
            <EnhancedTextarea
              contentId={`library-${activeItemId}`}
              externalValue={activeLibraryItem.content}
              onEdit={handleLibraryItemEdit}
              placeholder="Select a library item to edit..."
            />
          </div>
        </div>
      );
    }

    // Characters or Settings tab with no selection: show placeholder
    if (activeTab === 'characters' || activeTab === 'settings') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
          Select a {activeTab === 'characters' ? 'character' : 'setting'} to edit
        </div>
      );
    }

    // Stories tab: show generation workspace (this will be extended later with premise/outline routing)
    if (activeTab === 'stories') {
      // For now, default to generation workspace
      // TODO: Add routing for premise editing, outline editing, etc.
      return (
        <Allotment vertical>
          <Allotment.Pane>
            <EnhancedTextarea
              contentId="generation-output"
              externalValue={currentOutput}
              placeholder="Generated text will appear here..."
            />
          </Allotment.Pane>
          <Allotment.Pane preferredSize={200} minSize={150}>
            <ContextVisualization
              segments={contextTiers}
              maxTokens={maxContextTokens}
              compressionEvents={events}
            />
          </Allotment.Pane>
        </Allotment>
      );
    }

    // Default: empty state
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
        Select an item from the left pane to begin
      </div>
    );
  };

  // Header with gear icon for app settings
  const AppHeader = () => {
    const { setShowAppSettings } = useUIStore();

    return (
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 50,
      }}>
        <button
          onClick={() => setShowAppSettings(true)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            color: 'var(--foreground)',
            fontSize: '16px'
          }}
          title="Application Settings"
        >
          ⚙
        </button>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ position: 'relative', height: '100vh' }}>
        <AppHeader />
        <SplitLayout
          leftContent={<TabSystem tabs={tabs} />}
          rightContent={<RightPaneContent />}
        />
      </div>
    </QueryClientProvider>
  )
}

export default App
