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

        CREATE TABLE IF NOT EXISTS library_items (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK(type IN ('character', 'setting', 'theme')),
          name TEXT NOT NULL,
          category TEXT DEFAULT '',
          tags TEXT DEFAULT '[]',
          content TEXT NOT NULL,
          version INTEGER DEFAULT 1,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS stories (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          premise TEXT DEFAULT '',
          status TEXT DEFAULT 'setup' CHECK(status IN ('setup', 'outlining', 'writing', 'complete')),
          ai_config_id TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS story_items (
          id TEXT PRIMARY KEY,
          story_id TEXT NOT NULL,
          library_id TEXT NOT NULL,
          forked_from_version INTEGER NOT NULL,
          content TEXT NOT NULL,
          has_local_changes INTEGER DEFAULT 0,
          base_content TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (story_id) REFERENCES stories(id),
          FOREIGN KEY (library_id) REFERENCES library_items(id)
        );

        CREATE TABLE IF NOT EXISTS outlines (
          id TEXT PRIMARY KEY,
          story_id TEXT NOT NULL UNIQUE,
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (story_id) REFERENCES stories(id)
        );

        CREATE TABLE IF NOT EXISTS ai_configs (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          content TEXT NOT NULL,
          is_global INTEGER DEFAULT 0,
          story_id TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          FOREIGN KEY (story_id) REFERENCES stories(id)
        );

        CREATE TABLE IF NOT EXISTS templates (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL CHECK(type IN ('character', 'setting', 'theme', 'outline', 'ai_config')),
          name TEXT NOT NULL,
          content TEXT NOT NULL,
          is_builtin INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_versions_content_id ON versions(content_id);
        CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
        CREATE INDEX IF NOT EXISTS idx_library_items_type ON library_items(type);
        CREATE INDEX IF NOT EXISTS idx_story_items_story ON story_items(story_id);
        CREATE INDEX IF NOT EXISTS idx_story_items_library ON story_items(library_id);
        CREATE INDEX IF NOT EXISTS idx_outlines_story ON outlines(story_id);
        CREATE INDEX IF NOT EXISTS idx_ai_configs_story ON ai_configs(story_id);
        CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
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

      // Seed built-in templates if they don't exist
      const templateCount = dbInstance.selectValue('SELECT COUNT(*) FROM templates WHERE is_builtin = 1');
      if (templateCount === 0) {
        const now = Date.now();
        const characterTemplate = `---
name: ""
role: ""
category: Named
tags: []
traits: []
relationships: []
appearance: ""
voice: ""
backstory: ""
arc_notes: ""
---

# Character Notes

(Write additional notes, backstory details, or scene ideas here)`;

        const settingTemplate = `---
name: ""
type: ""
atmosphere: ""
sensory_details: ""
character_associations: []
---

# Setting Notes

(Write additional details, history, or mood descriptions here)`;

        dbInstance.exec(`
          INSERT INTO templates (id, type, name, content, is_builtin, created_at, updated_at)
          VALUES
            ('tpl_character_default', 'character', 'Default Character', ?, 1, ?, ?),
            ('tpl_setting_default', 'setting', 'Default Setting', ?, 1, ?, ?);
        `, [characterTemplate, now, now, settingTemplate, now, now]);
        console.log('[DB] Built-in templates seeded');
      }

      // Seed default global AI config if none exists
      const aiConfigCount = dbInstance.selectValue('SELECT COUNT(*) FROM ai_configs WHERE is_global = 1');
      if (aiConfigCount === 0) {
        const now = Date.now();
        const defaultAIConfig = `---
name: "Default"
stage: "general"
---

# AI Writing Style

Write in a natural, literary style. Focus on character voice and emotional authenticity. Show rather than tell. Keep dialogue grounded and realistic.

## Tone
- Intimate and observational
- Character-driven
- Slice-of-life warmth

## Avoid
- Purple prose
- Info-dumping
- Breaking character voice`;

        dbInstance.exec(`
          INSERT INTO ai_configs (id, name, content, is_global, story_id, created_at, updated_at)
          VALUES ('config_global_default', 'Default', ?, 1, NULL, ?, ?);
        `, [defaultAIConfig, now, now]);
        console.log('[DB] Default AI config seeded');
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
