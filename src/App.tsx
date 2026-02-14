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
import { useCompressionLog } from './hooks/use-compression-log'
import { createContextTier } from './services/context-engine'

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
      content: <div>Generation workspace - coming soon</div>
    },
    {
      id: 'settings',
      label: 'Settings',
      content: <SettingsPanel />
    }
  ]

  // Right pane content with vertical split: textarea above, context viz below
  const RightPaneContent = () => {
    const { events, addEvent, clearEvents } = useCompressionLog();
    // Future use: addEvent for compression, clearEvents for reset
    void addEvent, clearEvents;

    // Mock data for demonstration - will be replaced with live data in Plan 06
    const mockSegments = [
      createContextTier('System Prompt', 'You are a creative writing assistant...', 100, '#4a9eff'),
      createContextTier('Recent Text', 'The story begins with a mysterious figure...', 90, '#4ade80'),
      createContextTier('History', 'Summary of previous chapters...', 50, '#fbbf24'),
    ];

    return (
      <Allotment vertical>
        <Allotment.Pane>
          <EnhancedTextarea
            contentId="scratch"
            placeholder="Start writing your story..."
          />
        </Allotment.Pane>
        <Allotment.Pane preferredSize={200} minSize={150}>
          <ContextVisualization
            segments={mockSegments}
            maxTokens={1000}
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
