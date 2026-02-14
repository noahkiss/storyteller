// SQLite WASM database service
// Handles initialization, schema creation, and provides database access

let dbInstance: any = null;
let dbInitialized = false;
let initPromise: Promise<any> | null = null;

/**
 * Initialize SQLite WASM with OPFS backend
 * Creates schema tables and seeds built-in presets
 */
export async function initDatabase(): Promise<void> {
  // Return existing promise if initialization is in progress
  if (initPromise) {
    await initPromise;
    return;
  }

  // Return immediately if already initialized
  if (dbInitialized) {
    return;
  }

  // Start initialization
  initPromise = (async () => {
    try {
      console.log('[DB] Initializing SQLite WASM...');

      // Check for OPFS support
      const opfsSupported = 'storage' in navigator && 'getDirectory' in navigator.storage;
      if (!opfsSupported) {
        console.warn('[DB] OPFS not supported - falling back to in-memory database');
      }

      // Dynamically import SQLite WASM module from public directory
      // Note: In Vite, files in public/ are served at root during dev and copied to dist/ during build
      const module = await import(/* @vite-ignore */ `${import.meta.env.BASE_URL}sqlite-wasm/sqlite3.mjs`);
      const sqlite3InitModule = module.default;
      const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });

      console.log('[DB] SQLite WASM loaded:', sqlite3.version.libVersion);

      // Create database with OPFS if supported, otherwise in-memory
      if (opfsSupported && sqlite3.opfs) {
        dbInstance = new sqlite3.oo1.OpfsDb('/storyteller.db');
        console.log('[DB] Using OPFS persistent storage');
      } else {
        dbInstance = new sqlite3.oo1.DB();
        console.log('[DB] Using in-memory storage (non-persistent)');
      }

      // Create schema tables
      dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS versions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content_id TEXT NOT NULL,
          content TEXT NOT NULL,
          version_type TEXT DEFAULT 'auto' CHECK(version_type IN ('auto', 'manual', 'generation')),
          created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS generations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          prompt TEXT NOT NULL,
          output TEXT NOT NULL,
          model TEXT NOT NULL,
          parameters TEXT,
          token_count INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS presets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          temperature REAL NOT NULL,
          max_tokens INTEGER NOT NULL,
          top_p REAL NOT NULL,
          frequency_penalty REAL NOT NULL,
          presence_penalty REAL NOT NULL,
          is_builtin INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS compression_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source_tier TEXT NOT NULL,
          target_tier TEXT NOT NULL,
          original_tokens INTEGER NOT NULL,
          compressed_tokens INTEGER NOT NULL,
          summary_text TEXT,
          created_at INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_versions_content_id ON versions(content_id);
        CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
      `);

      console.log('[DB] Schema tables created');

      // Seed built-in presets if they don't exist
      const presetCount = dbInstance.selectValue('SELECT COUNT(*) FROM presets WHERE is_builtin = 1');
      if (presetCount === 0) {
        dbInstance.exec(`
          INSERT INTO presets (name, temperature, max_tokens, top_p, frequency_penalty, presence_penalty, is_builtin)
          VALUES
            ('Creative', 1.0, 2048, 0.95, 0.0, 0.0, 1),
            ('Balanced', 0.7, 2048, 0.9, 0.3, 0.3, 1),
            ('Precise', 0.3, 2048, 0.8, 0.5, 0.5, 1);
        `);
        console.log('[DB] Built-in presets seeded');
      }

      dbInitialized = true;
      console.log('[DB] Database initialized successfully');
    } catch (error) {
      console.error('[DB] Initialization failed:', error);
      throw error;
    }
  })();

  await initPromise;
}

/**
 * Get the initialized database instance
 * Automatically initializes if not already done
 */
export async function getDatabase(): Promise<any> {
  if (!dbInitialized) {
    await initDatabase();
  }
  return dbInstance;
}
