import { useEffect, useState } from 'react'
import './App.css'
import { initDatabase } from './services/db'

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

  return (
    <div>
      <h1>Storyteller</h1>
      <p>Database ready!</p>
    </div>
  )
}

export default App
