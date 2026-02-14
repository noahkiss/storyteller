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
import { GenerationWorkspace } from './components/generation/GenerationWorkspace'
import { useCompressionLog } from './hooks/use-compression-log'
import { useGenerationStore } from './stores/generation-store'
import { useUIStore } from './stores/ui-store'

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
    {
      id: 'generation',
      label: 'Generation',
      content: <GenerationWorkspace />
    },
    {
      id: 'settings',
      label: 'Settings',
      content: <SettingsPanel />
    }
  ]

  // Right pane content with vertical split: textarea above, context viz below
  // Content varies by active tab
  const RightPaneContent = () => {
    const { events } = useCompressionLog();
    const { contextTiers, maxContextTokens, currentOutput } = useGenerationStore();
    const { activeTab } = useUIStore();

    if (activeTab === 'settings') {
      // Settings tab: show system prompt editor
      return (
        <EnhancedTextarea
          contentId="system-prompt"
          placeholder="Enter your system prompt..."
        />
      );
    }

    // Generation tab: show output (using EnhancedTextarea with key trick to force re-mount when output changes)
    // TODO: Enhance EnhancedTextarea to support external value updates in Phase 2
    return (
      <Allotment vertical>
        <Allotment.Pane>
          <div style={{ height: '100%', background: '#1a1a1a', padding: '12px', overflow: 'auto' }}>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px', lineHeight: 1.6, color: '#e0e0e0', whiteSpace: 'pre-wrap' }}>
              {currentOutput || 'Generated text will appear here...'}
            </pre>
          </div>
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
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SplitLayout
        leftContent={<TabSystem tabs={tabs} />}
        rightContent={<RightPaneContent />}
      />
    </QueryClientProvider>
  )
}

export default App
