# Phase 1: Foundation + Context Engine - Research

**Researched:** 2026-02-14
**Domain:** Web-based LLM integration with intelligent context management
**Confidence:** HIGH

## Summary

Phase 1 establishes a desktop-first web application for generating text with OpenAI-compatible LLM endpoints, featuring a sophisticated context management system designed for small models (4K-8K context windows). The technical foundation uses React + TypeScript + Vite for the UI layer, SQLite WASM with OPFS for browser-based persistence, and CodeMirror 6 for the enhanced textarea component. The context engine implements hierarchical memory with multi-tier compression (recent verbatim + compressed summaries) and provides full transparency through visualization of what content enters each LLM call.

The standard stack is well-established with active maintenance and strong TypeScript support. Key architectural patterns center on state management (Zustand for UI state, TanStack Query for async operations), streaming LLM responses with abort controllers, and version-tracked content changes. The research identifies specific libraries to avoid reinventing (token counting with js-tiktoken, split panes with Allotment, summarization via LLM calls) and common pitfalls around SQLite WASM setup (COOP/COEP headers required for OPFS), CodeMirror extension architecture, and streaming response handling.

**Primary recommendation:** Use official SQLite WASM with OPFS for persistence, @uiw/react-codemirror for the textarea component, OpenAI Node SDK for API calls, and hierarchical summarization via LLM prompts rather than custom compression algorithms.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Design philosophy:**
- Power-user, text-first interface — everything is markdown files loaded into a textarea
- Desktop-first web app — no mobile considerations
- Advanced controls hidden behind collapsible sections, dropdowns, tabs, and panels
- Surface is clean and approachable; depth is one click away

**Application layout (foundation for all phases):**
- Split-screen: left pane for navigation/lists, right pane is always the reusable textarea component
- Left pane has tabs — Phase 1 activates initial tabs (generation workspace, app settings); Phase 2+ adds more (Stories, Characters, Settings, Templates, AI Config)
- Tab infrastructure must be extensible for future phases
- Single reusable textarea component with enhanced features — this is the core UI element of the entire app

**Reusable textarea component (Phase 1 builds this):**
- Multi-line markdown-aware text editing surface
- Version navigation: back/forward buttons to browse version history (not undo/redo — version timeline)
- Auto-save with chunked change tracking (not per-keystroke, natural chunks)
- Ctrl+S / Cmd+S supported as explicit save point
- Syntax highlighting for special markers (Phase 2 adds AI expansion markers)
- All content version-tracked in SQLite
- This single component is used everywhere: generation output, prompt editing, system prompt editing, and in Phase 2+ for characters, settings, outlines, AI config files

**LLM connection setup:**
- Dedicated settings area (accessible from left pane tabs or a settings icon)
- Form fields: base URL, API key, model name
- Connection test has two levels: quick status badge (green/red) + auto-fetch available models, and a "test generate" button for full pipeline validation
- Model selection: auto-discover from `/v1/models` endpoint with manual text input fallback when endpoint doesn't support model listing
- Connection failure mid-use: inline error where generation was happening + retry button (no context lost)

**Generation interface:**
- Generation workspace loads into the split-screen: left pane shows prompt history and controls, right pane is the textarea with generated output
- Prompt input uses the textarea component (same as everywhere else)
- Prompt history list shown in the left pane — click to re-use previous prompts
- Streaming text renders chunk-by-chunk (smooth append), not token-by-token
- During generation: stop button, live token count, and tokens/second readout visible
- After generation: user can copy output, regenerate (new result from same prompt), or edit text inline in the textarea
- Inline edits tracked as versions — original generation preserved (groundwork for Phase 4 version history)
- All generations (prompt + output) persisted to database across sessions

**Context visualization:**
- Always-visible panel (not on-demand or generation-only)
- Summary stacked bar at top: single horizontal bar with color-coded segments (system prompt, recent text, compressed history, outline, etc.) for quick glance
- Expandable itemized list below the bar: each context category as a row with label, token count, and progress bar
- Full text inspection: click any category to view the exact text/tokens being packed into the LLM call
- Compression event log: show when content moves between tiers ("Chapter 3 summary compressed from 450→120 tokens")

**Generation parameters:**
- Standard parameter set: temperature, max tokens, top_p, frequency penalty, presence penalty
- Presets: ship with built-in presets (Creative, Balanced, Precise) + user can create/save custom presets
- Parameters live in a collapsible section in the left pane — accessible but tucked away
- System prompt is fully user-editable in the textarea (loaded as a markdown file — aligns with Phase 2's AI config approach)

### Claude's Discretion

- Exact color palette and styling for context visualization segments
- Loading/skeleton states
- Toast vs inline for non-critical notifications
- Database schema design
- Context compression algorithm internals
- Specific streaming implementation details
- Auto-save debounce timing and change chunking strategy
- Tab visual design and left-pane layout details
- How settings area integrates with tab structure

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3+ | UI framework | De facto standard for component-based web UIs, excellent TypeScript support, massive ecosystem |
| TypeScript | 5.8+ | Type safety | Industry standard for large JavaScript applications, catches errors at compile time |
| Vite | 7.0+ | Build tool | Next-gen frontend tooling with instant HMR, optimized builds, first-class TypeScript support |
| @uiw/react-codemirror | 4.x | Code editor component | Best-maintained React wrapper for CodeMirror 6 with hooks support |
| @codemirror/lang-markdown | 6.x | Markdown syntax | Official CodeMirror markdown language support |
| openai | 6.1.0+ | LLM API client | Official OpenAI SDK with streaming support, works with any OpenAI-compatible endpoint |
| @sqlite.org/sqlite-wasm | Latest | Browser database | Official SQLite WASM build with OPFS support for persistence |
| js-tiktoken | Latest | Token counting | Pure JS port of tiktoken for client-side token estimation |
| zustand | 5.0+ | UI state management | Minimal boilerplate, excellent TypeScript support, lightweight (2KB) |
| @tanstack/react-query | 5.84+ | Async state management | Industry standard for server state, built-in caching and retry logic |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| allotment | 1.x | Split panes | Resizable split-screen layout (VS Code-derived implementation) |
| react-markdown | 9.x | Markdown rendering | Display formatted markdown in context visualization full-text view |
| immer | 10.x | Immutable state | Used with Zustand middleware for complex state updates |
| clsx | 2.x | CSS class composition | Conditional className handling |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React | Vue/Svelte | React has larger ecosystem, more libraries for complex features like CodeMirror integration |
| Vite | Webpack/Parcel | Vite offers faster dev experience and simpler config for modern apps |
| @uiw/react-codemirror | Manual CodeMirror setup | Manual setup gives more control but requires managing React lifecycle integration |
| Official SQLite WASM | wa-sqlite | wa-sqlite offers more VFS options but official build is actively maintained by SQLite team |
| Zustand | Redux/MobX | Zustand has less boilerplate; Redux adds complexity we don't need for this app |
| Allotment | react-split-pane | Allotment is more actively maintained and has better TypeScript support |

**Installation:**
```bash
npm install react react-dom typescript vite
npm install @uiw/react-codemirror @codemirror/lang-markdown
npm install openai js-tiktoken
npm install zustand @tanstack/react-query
npm install allotment react-markdown immer clsx
npm install --save-dev @types/react @types/react-dom
npm install --save-dev @vitejs/plugin-react
```

**SQLite WASM setup** (requires manual download from sqlite.org):
- Download latest sqlite-wasm from https://sqlite.org/download.html
- Extract `sqlite3.wasm` and `sqlite3.mjs` to `public/sqlite-wasm/`
- Import via dynamic import (see Code Examples section)

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/          # React components
│   ├── textarea/       # Reusable textarea component with version nav
│   ├── split-layout/   # Split pane layout wrapper
│   ├── tabs/           # Tab system for left pane
│   └── context-viz/    # Context visualization panel
├── stores/             # Zustand stores
│   ├── ui-store.ts     # UI state (active tab, panel visibility)
│   └── settings-store.ts # LLM connection settings
├── hooks/              # Custom React hooks
│   ├── use-llm-stream.ts    # Streaming LLM responses
│   ├── use-sqlite.ts        # SQLite database operations
│   └── use-auto-save.ts     # Debounced auto-save logic
├── services/           # Business logic
│   ├── llm-client.ts   # OpenAI SDK wrapper
│   ├── db.ts           # SQLite schema and queries
│   ├── tokens.ts       # Token counting utilities
│   └── context-engine.ts # Context packing and compression
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

### Pattern 1: Split Pane with Tab System

**What:** Left/right split with extensible tab navigation in left pane
**When to use:** Foundation layout for all phases
**Example:**

```typescript
// Source: Allotment docs + user requirements
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

function App() {
  return (
    <Allotment>
      <Allotment.Pane minSize={300} preferredSize="30%">
        <LeftPane>
          <Tabs>
            <Tab id="generation">Generation</Tab>
            <Tab id="settings">Settings</Tab>
            {/* Phase 2+ adds more tabs */}
          </Tabs>
          <TabContent />
        </LeftPane>
      </Allotment.Pane>
      <Allotment.Pane>
        <TextareaComponent />
      </Allotment.Pane>
    </Allotment>
  );
}
```

### Pattern 2: Reusable Textarea with Version Tracking

**What:** CodeMirror 6 component with auto-save and version navigation
**When to use:** Everywhere content is edited (prompts, outputs, settings, Phase 2+ library items)
**Example:**

```typescript
// Source: @uiw/react-codemirror docs + Context7
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';

interface TextareaProps {
  contentId: string;
  initialValue: string;
  onSave: (content: string) => void;
}

function EnhancedTextarea({ contentId, initialValue, onSave }: TextareaProps) {
  const [value, setValue] = useState(initialValue);
  const { versions, currentVersion, goBack, goForward } = useVersionHistory(contentId);

  // Debounced auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(value);
    }, 1000); // Claude's discretion: exact debounce timing
    return () => clearTimeout(timer);
  }, [value, onSave]);

  return (
    <div>
      <VersionNav onBack={goBack} onForward={goForward} />
      <CodeMirror
        value={value}
        onChange={setValue}
        extensions={[markdown()]}
        basicSetup={{
          lineNumbers: false, // Markdown editing, not code
          foldGutter: true,
        }}
      />
    </div>
  );
}
```

### Pattern 3: Streaming LLM Responses with Abort

**What:** OpenAI SDK streaming with AbortController for stop button
**When to use:** All LLM generation calls
**Example:**

```typescript
// Source: OpenAI Node SDK Context7 docs
import OpenAI from 'openai';

function useStreamGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = async (prompt: string, onChunk: (text: string) => void) => {
    const client = new OpenAI({
      baseURL: settings.baseURL,
      apiKey: settings.apiKey,
      dangerouslyAllowBrowser: true, // Only for local LLMs
    });

    abortControllerRef.current = new AbortController();
    setIsGenerating(true);

    try {
      const stream = await client.chat.completions.create({
        model: settings.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }, {
        signal: abortControllerRef.current.signal,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        onChunk(content);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        throw error;
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const stop = () => {
    abortControllerRef.current?.abort();
  };

  return { generate, stop, isGenerating };
}
```

### Pattern 4: SQLite WASM with OPFS Persistence

**What:** Initialize SQLite with OPFS backend for persistent storage
**When to use:** App initialization, before any database operations
**Example:**

```typescript
// Source: Official SQLite WASM docs + web research
// Note: Requires COOP/COEP headers in server config (see Common Pitfalls)
import sqlite3InitModule from '/sqlite-wasm/sqlite3.mjs';

async function initDatabase() {
  const sqlite3 = await sqlite3InitModule({
    print: console.log,
    printErr: console.error,
  });

  // OPFS requires 'opfs' VFS type
  const db = new sqlite3.oo1.DB('/storyteller.db', 'ct', 'opfs');

  // Schema setup
  db.exec(`
    CREATE TABLE IF NOT EXISTS versions (
      id INTEGER PRIMARY KEY,
      content_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS generations (
      id INTEGER PRIMARY KEY,
      prompt TEXT NOT NULL,
      output TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  return db;
}
```

### Pattern 5: Hierarchical Context Management

**What:** Multi-tier memory with token budget allocation
**When to use:** Before each LLM generation call
**Example:**

```typescript
// Source: Web research on hierarchical summarization patterns
import { encoding_for_model } from 'js-tiktoken';

interface ContextTier {
  label: string;
  content: string;
  tokens: number;
  priority: number; // Higher = more important
}

async function packContext(
  systemPrompt: string,
  recentText: string,
  compressedHistory: string,
  maxTokens: number
): Promise<ContextTier[]> {
  const encoding = encoding_for_model('gpt-4');

  const tiers: ContextTier[] = [
    {
      label: 'System Prompt',
      content: systemPrompt,
      tokens: encoding.encode(systemPrompt).length,
      priority: 100,
    },
    {
      label: 'Recent Text (verbatim)',
      content: recentText,
      tokens: encoding.encode(recentText).length,
      priority: 90,
    },
    {
      label: 'Compressed History',
      content: compressedHistory,
      tokens: encoding.encode(compressedHistory).length,
      priority: 50,
    },
  ];

  // Sort by priority, trim lower-priority tiers if over budget
  let totalTokens = tiers.reduce((sum, t) => sum + t.tokens, 0);
  const sorted = tiers.sort((a, b) => b.priority - a.priority);

  if (totalTokens > maxTokens) {
    // Trim from lowest priority tiers
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (totalTokens <= maxTokens) break;
      const tier = sorted[i];
      const overage = totalTokens - maxTokens;

      // Truncate this tier's content
      const tokensToRemove = Math.min(tier.tokens, overage);
      const newTokenCount = tier.tokens - tokensToRemove;
      const encoded = encoding.encode(tier.content);
      tier.content = encoding.decode(encoded.slice(0, newTokenCount));
      tier.tokens = newTokenCount;
      totalTokens -= tokensToRemove;
    }
  }

  encoding.free(); // Important: free WASM memory
  return sorted;
}
```

### Pattern 6: Zustand Store with Persistence

**What:** Type-safe state management with localStorage persistence
**When to use:** UI state (tabs, panels) and settings (API config)
**Example:**

```typescript
// Source: Zustand Context7 docs
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  baseURL: string;
  apiKey: string;
  model: string;
  updateSettings: (partial: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      baseURL: 'http://localhost:1234/v1',
      apiKey: '',
      model: '',
      updateSettings: (partial) => set((state) => ({ ...state, ...partial })),
    }),
    {
      name: 'storyteller-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Pattern 7: TanStack Query for Async Operations

**What:** Server state management with caching for database operations
**When to use:** Loading prompts, versions, generation history from SQLite
**Example:**

```typescript
// Source: TanStack Query Context7 docs
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function usePromptHistory() {
  const queryClient = useQueryClient();

  const { data: prompts } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const db = await getDatabase();
      return db.exec('SELECT * FROM generations ORDER BY created_at DESC LIMIT 50');
    },
  });

  const saveGeneration = useMutation({
    mutationFn: async ({ prompt, output }: { prompt: string; output: string }) => {
      const db = await getDatabase();
      db.exec(`
        INSERT INTO generations (prompt, output, created_at)
        VALUES (?, ?, ?)
      `, [prompt, output, Date.now()]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });

  return { prompts, saveGeneration };
}
```

### Anti-Patterns to Avoid

- **Global state for everything:** Use Zustand for UI state, TanStack Query for server/DB state, React context sparingly
- **Re-render entire app on textarea change:** CodeMirror handles its own DOM updates, don't lift all content to top-level state
- **Custom debounce implementations:** Use standard patterns with `setTimeout` cleanup in `useEffect`
- **Synchronous SQLite WASM calls in render:** All DB operations should be async and wrapped in TanStack Query
- **Token-by-token streaming render:** Chunk updates for smoother UI (buffer 10-20 tokens before appending)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token counting | Custom tokenizer, regex-based estimation | js-tiktoken | BPE tokenization is complex, js-tiktoken handles all OpenAI encodings (o200k_base, cl100k_base, etc.) |
| Split pane resize | Custom drag handlers and state management | Allotment | Edge cases: nested panes, min/max constraints, keyboard accessibility |
| Markdown syntax highlighting | Custom regex-based highlighter | @codemirror/lang-markdown | Full markdown spec support, extensible for custom syntax (Phase 2 markers) |
| SQLite persistence | IndexedDB wrapper, localStorage fallback | Official SQLite WASM with OPFS | Official build handles OPFS/IndexedDB fallback, cross-browser compatibility |
| Text summarization | String truncation, keyword extraction | LLM-based summarization | LLMs preserve semantic meaning better than algorithmic approaches |
| Streaming response parsing | Custom SSE parser | OpenAI SDK streaming | Handles reconnection, error recovery, partial JSON parsing |
| State persistence | Manual localStorage read/write | Zustand persist middleware | Handles serialization, versioning, storage errors |

**Key insight:** Browser persistence and LLM streaming have subtle edge cases (OPFS browser support, COOP/COEP headers, abort timing, partial responses). Use well-tested libraries instead of custom implementations.

## Common Pitfalls

### Pitfall 1: SQLite WASM OPFS Requires Specific Headers

**What goes wrong:** OPFS VFS fails silently or throws SharedArrayBuffer errors
**Why it happens:** OPFS requires Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers for SharedArrayBuffer access
**How to avoid:** Configure Vite dev server and production server with correct headers
**Warning signs:** "SharedArrayBuffer is not defined" errors, OPFS VFS initialization fails

**Solution:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  // For production builds served via nginx/apache, add headers in server config
});
```

**Sources:**
- [SQLite WASM Persistent Storage](https://sqlite.org/wasm/doc/trunk/persistence.md)
- [The Current State Of SQLite Persistence On The Web](https://www.powersync.com/blog/sqlite-persistence-on-the-web)

### Pitfall 2: CodeMirror Extension Order Matters

**What goes wrong:** Syntax highlighting doesn't work, keybindings conflict
**Why it happens:** Extensions are applied in array order; later extensions can override earlier ones
**How to avoid:** Place language support extensions first, then keymaps, then custom behavior
**Warning signs:** Markdown syntax not highlighting, Ctrl+S not working

**Solution:**
```typescript
import { basicSetup } from 'codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { keymap } from '@codemirror/view';

const extensions = [
  basicSetup, // Must come first for base editor functionality
  markdown(), // Language support next
  keymap.of([
    { key: 'Mod-s', run: () => { saveContent(); return true; } }
  ]), // Custom keybindings last
];
```

**Sources:**
- [CodeMirror Documentation](https://codemirror.net/docs/guide)
- [React CodeMirror Integration](https://uiwjs.github.io/react-codemirror/)

### Pitfall 3: Token Count Estimation vs Actual Count

**What goes wrong:** Context budget calculations are off, generations fail with "context too long"
**Why it happens:** Different models use different tokenizers (o200k_base for GPT-4o, cl100k_base for GPT-4, etc.)
**How to avoid:** Use model-specific encoding from js-tiktoken, add 10% safety buffer
**Warning signs:** Consistent context overflow errors despite staying under calculated limit

**Solution:**
```typescript
import { encoding_for_model } from 'js-tiktoken';

// Always use model-specific encoding
const encoding = encoding_for_model('gpt-4o-mini'); // Not 'gpt-4'!
const tokens = encoding.encode(text).length;
encoding.free(); // Important: prevent memory leaks

// Add safety buffer for system overhead
const SAFETY_BUFFER = 0.9; // Use 90% of context window
const effectiveMaxTokens = Math.floor(modelContextWindow * SAFETY_BUFFER);
```

**Sources:**
- [js-tiktoken npm](https://www.npmjs.com/package/js-tiktoken)
- [Token Counting Guide 2025](https://www.propelcode.ai/blog/token-counting-tiktoken-anthropic-gemini-guide-2025)

### Pitfall 4: Streaming Abort Doesn't Stop Generation Immediately

**What goes wrong:** LLM continues generating tokens after user clicks stop
**Why it happens:** Abort signal cancels network request, but server-side generation may continue
**How to avoid:** Show "stopping..." state, don't allow new generation until stream fully closed
**Warning signs:** Duplicate generations, tokens appearing after stop clicked

**Solution:**
```typescript
const stop = () => {
  abortControllerRef.current?.abort();
  setStatus('stopping'); // Intermediate state
  // Wait for stream cleanup
  setTimeout(() => setStatus('idle'), 500);
};

// Disable generate button during stopping
<button disabled={isGenerating || status === 'stopping'}>
  {status === 'stopping' ? 'Stopping...' : 'Generate'}
</button>
```

**Sources:**
- [Advanced: Stopping Streams (AI SDK)](https://ai-sdk.dev/docs/advanced/stopping-streams)
- [OpenAI Streaming API Reference](https://platform.openai.com/docs/guides/streaming-responses)

### Pitfall 5: Auto-Save Race Conditions with Version History

**What goes wrong:** Version history gets polluted with partial edits, versions saved out of order
**Why it happens:** Debounced auto-save fires while user is still typing, multiple saves in flight
**How to avoid:** Use version "chunks" (save only on pause >2s), serialize saves with mutex
**Warning signs:** Dozens of nearly-identical versions, versions with timestamps out of order

**Solution:**
```typescript
function useAutoSave(contentId: string, content: string) {
  const saveInProgressRef = useRef(false);
  const lastSaveRef = useRef(content);

  useEffect(() => {
    // Only save if content actually changed
    if (content === lastSaveRef.current) return;

    const timer = setTimeout(async () => {
      if (saveInProgressRef.current) return; // Skip if save in progress

      saveInProgressRef.current = true;
      try {
        await db.exec(`
          INSERT INTO versions (content_id, content, created_at)
          VALUES (?, ?, ?)
        `, [contentId, content, Date.now()]);
        lastSaveRef.current = content;
      } finally {
        saveInProgressRef.current = false;
      }
    }, 2000); // 2 second debounce = natural pause

    return () => clearTimeout(timer);
  }, [contentId, content]);
}
```

### Pitfall 6: Hierarchical Summarization Token Drift

**What goes wrong:** Summaries grow over time, defeating compression purpose
**Why it happens:** Each summarization pass adds tokens (e.g., "In summary...", "The story so far...")
**How to avoid:** Specify strict token limits in summarization prompts, re-compress periodically
**Warning signs:** Context visualization shows "compressed" tier growing toward verbatim size

**Solution:**
```typescript
async function compressText(text: string, targetTokens: number): Promise<string> {
  const prompt = `Summarize the following text in EXACTLY ${targetTokens} tokens or fewer. Be concise and preserve key details.

Text to summarize:
${text}

Summary (${targetTokens} tokens max):`;

  const response = await llm.generate(prompt);

  // Verify compression worked
  const actualTokens = countTokens(response);
  if (actualTokens > targetTokens * 1.1) { // Allow 10% overage
    console.warn(`Compression failed: ${actualTokens} > ${targetTokens}`);
    // Fallback: truncate
    return truncateToTokens(response, targetTokens);
  }

  return response;
}
```

**Sources:**
- [LLM Chat History Summarization Guide](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025)
- [Hierarchical Summarization Techniques](https://agenta.ai/blog/top-6-techniques-to-manage-context-length-in-llms)

## Code Examples

Verified patterns from official sources:

### Vite + React + TypeScript Setup

```bash
# Initialize project
npm create vite@latest storyteller -- --template react-ts
cd storyteller
npm install

# Install dependencies
npm install @uiw/react-codemirror @codemirror/lang-markdown
npm install openai js-tiktoken
npm install zustand @tanstack/react-query
npm install allotment react-markdown immer clsx
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

**Source:** [Vite Configuration Reference](https://context7.com/vitejs/vite/llms.txt)

### Token Counting with js-tiktoken

```typescript
// src/services/tokens.ts
import { encoding_for_model } from 'js-tiktoken';

export function countTokens(text: string, model: string = 'gpt-4o-mini'): number {
  const encoding = encoding_for_model(model);
  const tokens = encoding.encode(text).length;
  encoding.free(); // Critical: prevent memory leaks
  return tokens;
}

export function truncateToTokens(text: string, maxTokens: number, model: string = 'gpt-4o-mini'): string {
  const encoding = encoding_for_model(model);
  const tokens = encoding.encode(text);

  if (tokens.length <= maxTokens) {
    encoding.free();
    return text;
  }

  const truncated = encoding.decode(tokens.slice(0, maxTokens));
  encoding.free();
  return truncated;
}
```

**Source:** [js-tiktoken npm](https://www.npmjs.com/package/js-tiktoken)

### Testing LLM Connection

```typescript
// src/services/llm-client.ts
import OpenAI from 'openai';

export async function testConnection(
  baseURL: string,
  apiKey: string
): Promise<{ success: boolean; models?: string[]; error?: string }> {
  try {
    const client = new OpenAI({
      baseURL,
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // Quick test: list models
    const response = await client.models.list();
    const models = response.data.map(m => m.id);

    return { success: true, models };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function testGenerate(
  baseURL: string,
  apiKey: string,
  model: string
): Promise<{ success: boolean; output?: string; error?: string }> {
  try {
    const client = new OpenAI({ baseURL, apiKey, dangerouslyAllowBrowser: true });

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Reply with "OK" if you can read this.' }],
      max_tokens: 10,
    });

    return { success: true, output: response.choices[0].message.content || '' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Source:** [OpenAI Node SDK](https://context7.com/openai/openai-node/llms.txt)

### Context Visualization Component

```typescript
// src/components/context-viz/ContextVisualization.tsx
import { useState } from 'react';
import { countTokens } from '@/services/tokens';

interface ContextSegment {
  label: string;
  content: string;
  tokens: number;
  color: string; // Claude's discretion
}

interface Props {
  segments: ContextSegment[];
  maxTokens: number;
}

export function ContextVisualization({ segments, maxTokens }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [inspecting, setInspecting] = useState<string | null>(null);

  const totalTokens = segments.reduce((sum, s) => sum + s.tokens, 0);

  return (
    <div className="context-viz">
      {/* Summary bar */}
      <div className="summary-bar">
        {segments.map(segment => (
          <div
            key={segment.label}
            className="segment"
            style={{
              width: `${(segment.tokens / maxTokens) * 100}%`,
              backgroundColor: segment.color,
            }}
            title={`${segment.label}: ${segment.tokens} tokens`}
          />
        ))}
      </div>

      {/* Token count */}
      <div className="token-count">
        {totalTokens} / {maxTokens} tokens ({((totalTokens / maxTokens) * 100).toFixed(1)}%)
      </div>

      {/* Expandable itemized list */}
      <button onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Hide Details' : 'Show Details'}
      </button>

      {expanded && (
        <div className="segment-list">
          {segments.map(segment => (
            <div key={segment.label} className="segment-item">
              <div className="segment-header">
                <span className="label">{segment.label}</span>
                <span className="tokens">{segment.tokens} tokens</span>
                <button onClick={() => setInspecting(segment.label)}>
                  View Content
                </button>
              </div>
              <div className="segment-bar" style={{ backgroundColor: segment.color, width: `${(segment.tokens / totalTokens) * 100}%` }} />
            </div>
          ))}
        </div>
      )}

      {/* Full text inspection modal */}
      {inspecting && (
        <div className="inspection-modal">
          <h3>{inspecting}</h3>
          <pre>{segments.find(s => s.label === inspecting)?.content}</pre>
          <button onClick={() => setInspecting(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| IndexedDB for SQLite persistence | OPFS with SharedAccessHandle | SQLite 3.43.0 (2023) | 2-3x faster writes, cleaner API |
| CodeMirror 5 | CodeMirror 6 | 2021 | Extension-based architecture, better mobile support, smaller bundle |
| Custom React wrappers for CM6 | @uiw/react-codemirror | 2022 | Maintained package with hooks support, handles lifecycle correctly |
| Webpack | Vite | 2020-2021 | 10x faster dev server startup, simpler config |
| Redux for all state | Zustand for UI + TanStack Query for async | 2020-2022 | Less boilerplate, better TypeScript inference, built-in caching |
| Algorithmic summarization | LLM-based summarization | 2023+ | Better semantic preservation, but slower and costs tokens |

**Deprecated/outdated:**
- **sql.js:** Still works but official SQLite WASM is now preferred (actively maintained by SQLite team)
- **react-codemirror (CodeMirror 5):** Use @uiw/react-codemirror with CodeMirror 6
- **@dqbd/tiktoken:** Use js-tiktoken (pure JS, no WASM dependency)
- **react-split-pane:** Not actively maintained; use Allotment instead

## Open Questions

1. **Safari < 17 OPFS support**
   - What we know: Safari 17+ supports OPFS, older versions don't
   - What's unclear: IndexedDB fallback performance impact, how to detect and switch
   - Recommendation: Check `navigator.storage.getDirectory` existence, fall back to IndexedDB VFS if missing

2. **Optimal compression tier thresholds**
   - What we know: Hierarchical memory needs short/medium/long tiers with different compression ratios
   - What's unclear: Exact token thresholds (e.g., when does "recent" become "medium-term"?)
   - Recommendation: Start with 500 tokens verbatim, 2000 tokens compressed 3:1, rest compressed 6:1; tune based on user feedback

3. **Token count accuracy for non-OpenAI models**
   - What we know: js-tiktoken uses OpenAI tokenizers (o200k_base, cl100k_base)
   - What's unclear: How accurate is this for Llama, Mistral, etc. using different tokenizers?
   - Recommendation: Use o200k_base as default, add 15% safety buffer for non-OpenAI models, surface warning in UI

## Sources

### Primary (HIGH confidence)

- Context7: /websites/react_dev - React component patterns and best practices
- Context7: /vitejs/vite - Vite configuration and TypeScript setup
- Context7: /websites/codemirror_net - CodeMirror 6 API and extension system
- Context7: /openai/openai-node - OpenAI SDK streaming and chat completions
- Context7: /pmndrs/zustand - Zustand store patterns and middleware
- Context7: /tanstack/query - TanStack Query async state management
- [Official SQLite WASM Documentation](https://sqlite.org/wasm/doc/trunk/index.md) - OPFS setup and browser persistence
- [js-tiktoken npm](https://www.npmjs.com/package/js-tiktoken) - Token counting API

### Secondary (MEDIUM confidence)

- [The Current State Of SQLite Persistence On The Web](https://www.powersync.com/blog/sqlite-persistence-on-the-web) - OPFS vs IndexedDB comparison (Nov 2025)
- [React CodeMirror Integration Guide](https://uiwjs.github.io/react-codemirror/) - @uiw/react-codemirror usage patterns
- [LLM Chat History Summarization Guide](https://mem0.ai/blog/llm-chat-history-summarization-guide-2025) - Hierarchical summarization techniques
- [Token Counting Guide 2025](https://www.propelcode.ai/blog/token-counting-tiktoken-anthropic-gemini-guide-2025) - Cross-provider token counting
- [Context Window Management Strategies](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/) - Multi-tier memory architectures
- [Advanced: Stopping Streams (AI SDK)](https://ai-sdk.dev/docs/advanced/stopping-streams) - Abort controller patterns
- [Allotment GitHub](https://github.com/johnwalley/allotment) - Split pane component for React

### Tertiary (LOW confidence)

- Web search results for browser SQLite solutions (2026) - Ecosystem overview, requires official doc verification
- Community discussions on OPFS performance - Anecdotal benchmarks, needs testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries have official Context7 docs, active maintenance, strong TypeScript support
- Architecture patterns: HIGH - Patterns verified from official docs (React, Vite, CodeMirror, OpenAI SDK) and Context7 queries
- SQLite WASM: MEDIUM - Official docs available but OPFS browser support varies (Safari < 17), deployment requires COOP/COEP headers
- Context compression: MEDIUM - LLM-based summarization is proven but exact tier thresholds need experimentation
- Pitfalls: HIGH - All derived from official docs, web research cross-referenced with authoritative sources

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - standard stack is stable, but SQLite WASM and browser APIs evolve)

---

*Phase: 01-foundation-context-engine*
*Research completed: 2026-02-14*
