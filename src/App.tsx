import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import { initDatabase } from './services/db'
import { SplitLayout } from './components/split-layout/SplitLayout'
import { TabSystem, TabDefinition } from './components/tabs/TabSystem'
import { EnhancedTextarea } from './components/textarea/EnhancedTextarea'

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
      content: <div>Settings - coming soon</div>
    }
  ]

  return (
    <QueryClientProvider client={queryClient}>
      <SplitLayout
        leftContent={<TabSystem tabs={tabs} />}
        rightContent={
          <EnhancedTextarea
            contentId="scratch"
            placeholder="Start writing your story..."
          />
        }
      />
    </QueryClientProvider>
  )
}

export default App
