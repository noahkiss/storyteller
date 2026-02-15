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

    // Generation tab: show output with EnhancedTextarea for inline editing
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
