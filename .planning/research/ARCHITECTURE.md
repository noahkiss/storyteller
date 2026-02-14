# Architecture Research

**Domain:** AI-Assisted Story Writing Tools
**Researched:** 2026-02-13
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Dashboard │  │  Editor  │  │ Library  │  │ Series   │    │
│  │   UI     │  │    UI    │  │    UI    │  │   UI     │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
├───────┴─────────────┴─────────────┴─────────────┴───────────┤
│                     APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Context Management Engine               │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │  Rolling   │  │  Retrieval  │  │ Hierarchical │  │   │
│  │  │Summarizer  │  │   System    │  │    Memory    │  │   │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Story Gen    │  │    Library   │  │   Series     │      │
│  │   Service    │  │   Service    │  │   Manager    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
├─────────┴─────────────────┴──────────────────┴──────────────┤
│                    INTEGRATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │         LLM Provider Adapter (OpenAI-Compatible)     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │LM Studio │  │ Kobold   │  │ OpenAI / Claude  │   │   │
│  │  │  Local   │  │   CPP    │  │     Cloud        │   │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                      DATA LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  SQLite    │  │  Vector    │  │   Cache    │            │
│  │Relational  │  │Embeddings  │  │   Store    │            │
│  │    DB      │  │  (Optional)│  │  (Memory)  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Dashboard UI** | Project overview, story management, navigation | React/Vue/Svelte SPA |
| **Editor UI** | Writing interface, AI generation controls, preview | Rich text editor + AI controls |
| **Library UI** | Character/setting/theme CRUD interface | Form-based interface with search |
| **Series UI** | Series management, story continuity tracking | Timeline view + metadata editor |
| **Context Management Engine** | Packs relevant context for small LLM windows | Core logic layer - critical component |
| **Rolling Summarizer** | Maintains condensed story state as narrative grows | Automated summarization service |
| **Retrieval System** | Finds relevant library items via embeddings/keywords | RAG-based or keyword search |
| **Hierarchical Memory** | Multi-tier context storage (short/medium/long-term) | Tiered caching with compression |
| **Story Generation Service** | Orchestrates LLM calls with context packing | API client wrapper |
| **Library Service** | Manages creative library (characters, settings, themes) | CRUD service + search indexing |
| **Series Manager** | Tracks continuity across multiple stories | Relationship mapping + versioning |
| **LLM Provider Adapter** | Abstracts different LLM backends (OpenAI-compatible API) | HTTP client with standardized interface |
| **SQLite Database** | Persistent storage for stories, library, series, sessions | File-based relational database |
| **Vector Embeddings** | Semantic search for similar characters/themes (optional) | Optional vector DB or SQLite extension |
| **Cache Store** | In-memory context cache for active sessions | Redis or in-memory object store |

## Recommended Project Structure

```
storyteller/
├── frontend/                  # Web UI (React/Vue/Svelte)
│   ├── src/
│   │   ├── components/        # UI components
│   │   │   ├── Dashboard/     # Dashboard views
│   │   │   ├── Editor/        # Story editor
│   │   │   ├── Library/       # Creative library UI
│   │   │   └── Series/        # Series management UI
│   │   ├── services/          # API client services
│   │   │   ├── api.ts         # Base API client
│   │   │   ├── stories.ts     # Story API calls
│   │   │   ├── library.ts     # Library API calls
│   │   │   └── generation.ts  # AI generation API calls
│   │   ├── stores/            # State management
│   │   └── utils/             # Frontend utilities
│   └── package.json
├── backend/                   # API server (Node.js/Python)
│   ├── src/
│   │   ├── api/               # HTTP API routes
│   │   │   ├── stories.ts     # Story endpoints
│   │   │   ├── library.ts     # Library endpoints
│   │   │   ├── series.ts      # Series endpoints
│   │   │   └── generation.ts  # AI generation endpoints
│   │   ├── services/          # Business logic
│   │   │   ├── context/       # Context management (CRITICAL)
│   │   │   │   ├── rolling-summarizer.ts
│   │   │   │   ├── retrieval.ts
│   │   │   │   ├── hierarchical-memory.ts
│   │   │   │   └── packer.ts  # Main context packing logic
│   │   │   ├── llm/           # LLM integration
│   │   │   │   ├── provider.ts        # Abstract provider interface
│   │   │   │   ├── openai-adapter.ts  # OpenAI-compatible adapter
│   │   │   │   └── client.ts          # HTTP client
│   │   │   ├── story-service.ts
│   │   │   ├── library-service.ts
│   │   │   └── series-service.ts
│   │   ├── db/                # Database layer
│   │   │   ├── schema.sql     # SQLite schema
│   │   │   ├── migrations/    # DB migrations
│   │   │   └── repositories/  # Data access objects
│   │   │       ├── stories.ts
│   │   │       ├── library.ts
│   │   │       ├── series.ts
│   │   │       └── sessions.ts
│   │   ├── utils/             # Backend utilities
│   │   └── index.ts           # Server entry point
│   └── package.json
├── shared/                    # Shared types/utilities
│   └── types/                 # TypeScript type definitions
│       ├── story.ts
│       ├── library.ts
│       ├── series.ts
│       └── context.ts
├── docker/                    # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
└── README.md
```

### Structure Rationale

- **Monorepo structure**: Frontend, backend, and shared types in one repository simplifies development and deployment
- **Context management isolation**: Core context packing logic is isolated in `services/context/` as it's the most complex and critical component for small LLMs
- **Service layer pattern**: Business logic separated from API routes enables testing and reuse
- **Repository pattern**: Database access abstracted through repositories for easier testing and potential database migration
- **Shared types**: TypeScript type definitions shared between frontend and backend ensure type safety across the stack
- **Docker-first**: Docker configuration at root enables easy self-hosted deployment

## Architectural Patterns

### Pattern 1: Rolling Window Summarization

**What:** As story content exceeds LLM context window, older sections are progressively summarized while recent content remains verbatim. Creates a "rolling window" of full-detail recent text + compressed summaries of earlier text.

**When to use:** Essential for any story writing tool targeting 4K-8K context window models with 20K+ word stories. Industry standard approach for maintaining narrative continuity.

**Trade-offs:**
- **Pros**: Enables unlimited story length with small models; maintains narrative coherence; compresses exponentially (older = more compressed)
- **Cons**: Can lose fine details from early story; summarization quality depends on LLM capabilities; requires careful prompt engineering

**Example:**
```typescript
interface RollingWindow {
  // Most recent 2-3K tokens: full verbatim text
  recentText: string;

  // Medium-term: chapter/scene summaries (500-1K tokens)
  mediumTermSummaries: Summary[];

  // Long-term: ultra-compressed story arc (200-500 tokens)
  longTermSummary: string;

  // Total budget: ~4K tokens, fits in 4K-8K window with room for:
  // - Current generation (1-2K tokens)
  // - Library context (500-1K tokens)
  // - System prompt (200-500 tokens)
}

async function buildContextWindow(
  storyId: string,
  currentPosition: number,
  contextBudget: number
): Promise<RollingWindow> {
  // Allocate token budget across tiers
  const budget = {
    recent: Math.floor(contextBudget * 0.5),      // 50% for recent text
    medium: Math.floor(contextBudget * 0.3),      // 30% for summaries
    long: Math.floor(contextBudget * 0.2),        // 20% for arc summary
  };

  // Build window based on current position
  const recentText = await getRecentText(storyId, currentPosition, budget.recent);
  const mediumSummaries = await getMediumSummaries(storyId, currentPosition, budget.medium);
  const longSummary = await getLongTermSummary(storyId, budget.long);

  return { recentText, mediumTermSummaries: mediumSummaries, longTermSummary: longSummary };
}
```

**Sources:**
- [Context Window Management Strategies](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)
- [Enhancing Conversational Continuity with Context Summarization](https://community.openai.com/t/enhancing-conversational-continuity-with-context-summarization/395851)

### Pattern 2: Hierarchical Memory Architecture

**What:** Multi-tier memory system with different retention and compression characteristics. Short-term memory holds verbatim recent content, medium-term holds compressed summaries, long-term holds key facts and relationships.

**When to use:** When story complexity requires tracking many characters, plot threads, and relationships beyond what fits in context window. Particularly valuable for series with shared continuity.

**Trade-offs:**
- **Pros**: Maintains rich detail while fitting in small context windows; enables selective retrieval of relevant context; supports complex multi-story continuity
- **Cons**: Adds architectural complexity; requires careful tuning of compression ratios; more storage requirements

**Example:**
```typescript
interface HierarchicalMemory {
  shortTerm: {
    maxTokens: 2000;
    retention: 'verbatim';
    content: string[];
  };

  mediumTerm: {
    maxTokens: 1000;
    retention: 'summarized';
    compressionRatio: 3;  // 3:1 compression from short-term
    summaries: {
      content: string;
      sourceRange: [number, number];  // Original text positions
      timestamp: Date;
    }[];
  };

  longTerm: {
    maxTokens: 500;
    retention: 'facts';
    compressionRatio: 10;  // 10:1 compression from medium-term
    facts: {
      type: 'character' | 'event' | 'relationship' | 'setting';
      content: string;
      importance: number;  // 0-1 relevance score
    }[];
  };
}
```

**Sources:**
- [LLM Development in 2026: Hierarchical Memory](https://medium.com/@vforqa/llm-development-in-2026-transforming-ai-with-hierarchical-memory-for-deep-context-understanding-32605950fa47)
- [Context Window Management Strategies](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)

### Pattern 3: Retrieval-Augmented Generation (RAG) for Creative Library

**What:** Character descriptions, settings, themes, and other creative library content are stored as embeddings and retrieved via semantic similarity. Only relevant library items are injected into context window, not entire library.

**When to use:** When creative library grows beyond what fits in context window (typically >10 characters or >5 detailed settings). Essential for series with large casts or complex worlds.

**Trade-offs:**
- **Pros**: Enables unlimited library size without context window bloat; retrieves semantically relevant context automatically; supports "show me characters similar to X" queries
- **Cons**: Requires embeddings infrastructure (vector DB or SQLite extension); adds latency for retrieval; embedding quality affects relevance; overkill for small libraries (<20 items)

**Example:**
```typescript
interface LibraryRetrieval {
  async retrieveRelevantContext(
    query: string,              // Current story context or user query
    maxTokens: number,          // Token budget for library context
    types?: LibraryItemType[]   // Filter by character/setting/theme
  ): Promise<LibraryItem[]> {
    // 1. Generate embedding for current context
    const queryEmbedding = await this.embeddings.create(query);

    // 2. Similarity search in vector store
    const similar = await this.vectorDB.search(queryEmbedding, {
      limit: 20,                // Retrieve top 20 candidates
      filter: { type: types },  // Optional type filter
      threshold: 0.7,           // Minimum similarity score
    });

    // 3. Rank by relevance and pack into token budget
    const ranked = this.rankByRelevance(similar, query);
    const packed = this.packIntoTokenBudget(ranked, maxTokens);

    return packed;
  }
}

// Alternative: Keyword-based retrieval for simpler implementation
interface KeywordRetrieval {
  async retrieveByKeywords(
    text: string,
    maxTokens: number
  ): Promise<LibraryItem[]> {
    // Extract character names, locations from text
    const keywords = this.extractEntities(text);

    // Direct lookup by name/tag
    const items = await this.db.query(`
      SELECT * FROM library_items
      WHERE name IN (?) OR tags LIKE ?
      LIMIT 20
    `, [keywords, `%${keywords.join('%')}%`]);

    return this.packIntoTokenBudget(items, maxTokens);
  }
}
```

**Sources:**
- [RAG in 2026: How Retrieval-Augmented Generation Works](https://www.techment.com/blogs/rag-in-2026/)
- [10 Types of RAG Architectures](https://newsletter.rakeshgohel.com/p/10-types-of-rag-architectures-and-their-use-cases-in-2026)

### Pattern 4: Outline-Driven Context Packing

**What:** Story outline serves as navigational structure for context packing. Instead of purely chronological summarization, context is organized around outline hierarchy (acts, chapters, scenes). Current scene gets full detail, sibling scenes get summaries, parent/ancestor context provides story arc.

**When to use:** When story has clear hierarchical structure (chapters/scenes). Particularly effective for plotted fiction vs. discovery writing. Enables jumping between scenes while maintaining coherent context.

**Trade-offs:**
- **Pros**: More structured than pure rolling window; enables non-linear editing; maintains story arc awareness; natural fit for plotted writing workflows
- **Cons**: Requires outline management UI; less suitable for discovery writers; outline must be kept in sync with actual text

**Example:**
```typescript
interface OutlineNode {
  id: string;
  type: 'act' | 'chapter' | 'scene';
  title: string;
  summary: string;           // Auto-generated or user-written
  text?: string;             // Full text (scenes only)
  children: OutlineNode[];
}

async function packFromOutline(
  currentSceneId: string,
  outline: OutlineNode,
  tokenBudget: number
): Promise<string> {
  // Find current scene in outline tree
  const path = findPath(outline, currentSceneId);
  const [act, chapter, scene] = path;

  let context = '';
  let tokensUsed = 0;

  // 1. Story arc (top-level summary) - 10% of budget
  context += `Story: ${outline.summary}\n\n`;
  tokensUsed += estimateTokens(outline.summary);

  // 2. Current act context - 15% of budget
  context += `Act ${act.title}: ${act.summary}\n\n`;
  tokensUsed += estimateTokens(act.summary);

  // 3. Preceding chapters in act (summaries) - 20% of budget
  for (const prevChapter of act.children.slice(0, chapter.index)) {
    context += `${prevChapter.title}: ${prevChapter.summary}\n`;
    tokensUsed += estimateTokens(prevChapter.summary);
  }

  // 4. Current chapter preceding scenes (summaries) - 20% of budget
  for (const prevScene of chapter.children.slice(0, scene.index)) {
    context += `${prevScene.title}: ${prevScene.summary}\n`;
    tokensUsed += estimateTokens(prevScene.summary);
  }

  // 5. Current scene (full text) - 35% of budget
  const maxSceneTokens = Math.floor(tokenBudget * 0.35);
  const sceneText = truncateToTokens(scene.text, maxSceneTokens);
  context += `\n=== Current Scene: ${scene.title} ===\n${sceneText}\n`;

  return context;
}
```

## Data Flow

### Story Generation Request Flow

```
[User Action: "Generate next paragraph"]
    ↓
[Editor UI] → POST /api/generation/continue
    ↓
[Generation API Route]
    ↓
[Story Generation Service]
    ↓
┌───────────────────────────────────┐
│  Context Management Engine        │
│  1. Load story from DB            │
│  2. Build rolling window          │
│  3. Retrieve relevant library     │
│  4. Pack into token budget        │
└───────────────────────────────────┘
    ↓
[LLM Provider Adapter] → POST to OpenAI-compatible API
    ↓ (LM Studio / Kobold / Cloud API)
[LLM Response] ← Generated text
    ↓
[Story Generation Service]
    ↓
┌───────────────────────────────────┐
│  Post-processing                  │
│  1. Update rolling summaries      │
│  2. Cache new context state       │
│  3. Save to DB                    │
└───────────────────────────────────┘
    ↓
[Generation API Route] ← Return generated text
    ↓
[Editor UI] → Display to user
```

### Library Retrieval Flow (RAG Pattern)

```
[Story Context: "The detective entered the dimly lit bar"]
    ↓
[Retrieval System]
    ↓
┌───────────────────────────────────┐
│  Option A: Vector Search          │
│  1. Generate embedding            │
│  2. Similarity search vector DB   │
│  3. Return top-k matches          │
└───────────────────────────────────┘
    OR
┌───────────────────────────────────┐
│  Option B: Keyword Search         │
│  1. Extract entities (detective)  │
│  2. Query SQLite by name/tags     │
│  3. Return matching items         │
└───────────────────────────────────┘
    ↓
[Relevant Library Items]
    ↓
[Context Packer] → Fit into token budget
    ↓
[Include in LLM prompt]
```

### Session Memory Persistence Flow

```
[User writes in editor]
    ↓
[Frontend] → Debounced save (every 2-3 seconds)
    ↓
[Story API] → Update story content
    ↓
┌───────────────────────────────────┐
│  SQLite Transaction               │
│  1. UPDATE stories SET text=...   │
│  2. INSERT session_history        │
│  3. UPDATE context_cache           │
└───────────────────────────────────┘
    ↓
[On next generation request]
    ↓
[Load from cache] → Use cached rolling summary if available
    OR
[Rebuild from DB] → Regenerate if cache miss/stale
```

**Sources:**
- [Sessions - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/sessions/)
- [SQLite Persistence in LangGraph](https://deepwiki.com/langchain-ai/langchain-academy/5.3-external-memory-with-sqlitesaver)

## Key Data Flows

1. **Story Creation → Generation → Save:** User creates story → generates content via LLM → context automatically managed → content saved with updated summaries
2. **Library Item → Retrieval → Context Injection:** User creates character → stored with metadata/tags → automatically retrieved when relevant → injected into generation context
3. **Series Continuity:** Story A establishes facts → saved to series context → Story B inherits series context → maintains continuity
4. **Session Resume:** User closes app → session state saved to SQLite → user reopens → context restored from DB → continues seamlessly

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-10 stories, 1 user | Monolith: Single container, SQLite, in-memory cache. All components in one Node.js process. No vector DB needed (keyword search sufficient). |
| 10-100 stories, 1-10 users | Same architecture, add Redis for shared cache. Consider SQLite vector extension (sqlite-vss) if library grows >50 items. Still single container. |
| 100+ stories, 10+ users | Split frontend/backend into separate containers. Add dedicated vector DB (Qdrant, Milvec) if using embeddings. Consider PostgreSQL migration from SQLite. Add API rate limiting. |

### Scaling Priorities

1. **First bottleneck: Context packing latency**
   - **What breaks:** Context packing takes >2-3 seconds as stories grow to 50K+ words
   - **Fix:** Implement aggressive caching of rolling summaries. Pre-compute summaries on save, don't regenerate on every request. Cache in Redis or in-memory.

2. **Second bottleneck: SQLite write contention**
   - **What breaks:** Multiple concurrent writes to SQLite cause lock timeouts (unlikely for single-user, but possible with auto-save + generation)
   - **Fix:** Use WAL mode (Write-Ahead Logging) in SQLite. Batch writes. Eventually migrate to PostgreSQL if multi-user.

3. **Third bottleneck: LLM API latency**
   - **What breaks:** User waiting 10-30 seconds for generation from slow local LLM
   - **Fix:** Implement streaming responses. Show partial text as it generates. Add progress indicators. This is UX, not architecture.

## Anti-Patterns

### Anti-Pattern 1: Naive Full-Text Context

**What people do:** Send entire story text to LLM on every generation request, truncating at context window limit.

**Why it's wrong:**
- Loses early story content (truncation from beginning)
- No semantic awareness (truncates mid-sentence, mid-scene)
- Inefficient token usage (repeats unchanged text)
- Breaks with stories >8K tokens

**Do this instead:** Implement rolling window summarization from day one. Start with simple approach: last 2K tokens verbatim + single summary of everything before.

### Anti-Pattern 2: Premature Vector Database

**What people do:** Add vector database (Pinecone, Qdrant) and embeddings from start, even for 5 characters and 3 settings.

**Why it's wrong:**
- Over-engineered for small libraries (<20 items)
- Adds deployment complexity (additional service)
- Adds latency (embedding generation + vector search)
- SQLite full-text search is sufficient for small scale

**Do this instead:** Start with simple keyword matching or SQLite FTS (Full-Text Search). Add vector embeddings only when library exceeds 50 items or when users report poor retrieval quality.

### Anti-Pattern 3: Stateless Context Rebuilding

**What people do:** Rebuild entire context window from scratch on every generation request by re-summarizing all previous text.

**Why it's wrong:**
- Extremely slow (summarization takes time)
- Wasteful (re-computing unchanged summaries)
- Inconsistent (summaries may vary between requests)
- Makes generation feel sluggish (adds 5-10s latency)

**Do this instead:** Cache rolling summaries aggressively. When user saves/generates, update only the affected summary tier (recent text becomes medium-term summary). Store summaries in DB, not regenerate.

### Anti-Pattern 4: Tight Coupling to Single LLM Provider

**What people do:** Hardcode calls to OpenAI API or specific local model format throughout codebase.

**Why it's wrong:**
- Can't switch between local (LM Studio) and cloud (OpenAI/Claude)
- Can't adapt to different providers' API quirks
- Hard to test (must call real LLM APIs)
- Limits user choice

**Do this instead:** Abstract LLM provider behind interface. Implement OpenAI-compatible adapter that works with LM Studio, Kobold, and cloud providers. Make provider configurable at runtime.

**Example:**
```typescript
// BAD: Tight coupling
async function generateText(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0].message.content;
}

// GOOD: Abstracted provider
interface LLMProvider {
  complete(prompt: string, options?: GenerationOptions): Promise<string>;
}

class OpenAICompatibleProvider implements LLMProvider {
  constructor(
    private baseURL: string,   // e.g., http://localhost:1234/v1 for LM Studio
    private apiKey?: string     // Optional for local servers
  ) {}

  async complete(prompt: string, options?: GenerationOptions): Promise<string> {
    // Standard OpenAI-compatible API call
    // Works with LM Studio, Kobold, OpenAI, etc.
  }
}

// Configure at runtime
const provider = new OpenAICompatibleProvider(
  config.LLM_BASE_URL,
  config.LLM_API_KEY
);
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **LM Studio** | OpenAI-compatible HTTP API (http://localhost:1234/v1) | Local model hosting. No API key needed. User manages model loading. |
| **Kobold CPP** | OpenAI-compatible HTTP API | Local alternative to LM Studio. Has story-specific features (memory, world info). |
| **OpenAI / Claude** | Standard cloud API with API key | Optional cloud fallback. Requires user API key. Better for large context windows. |
| **Vector DB (optional)** | HTTP API (Qdrant) or embedded (sqlite-vss) | Only if using embeddings for library retrieval. Embedded SQLite extension preferred for simplicity. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Frontend ↔ Backend** | REST API (JSON over HTTP) | Standard CRUD + generation endpoints. Consider WebSocket for streaming generation responses. |
| **API Routes ↔ Services** | Direct function calls | Same process, no serialization. Services are injected dependencies. |
| **Services ↔ Repositories** | Direct function calls | Repository pattern isolates database access. Services never write raw SQL. |
| **Context Engine ↔ LLM Provider** | Provider interface | Loose coupling via abstraction. Context engine doesn't know if LLM is local or cloud. |
| **Services ↔ Cache** | Get/Set interface | Abstract cache (Redis or in-memory) behind interface. Switch implementation without code changes. |

## Build Order Implications

Based on dependencies between components, recommended build order:

**Phase 1: Foundation (Weeks 1-2)**
1. Database schema (stories, library, series, sessions)
2. Repository layer (data access)
3. Basic API routes (CRUD for stories)
4. Simple frontend (list stories, basic editor)

**Phase 2: LLM Integration (Week 3)**
5. LLM provider abstraction + OpenAI-compatible adapter
6. Story generation service (without sophisticated context management)
7. Generation API endpoint
8. Frontend integration (generation button, display results)

**Phase 3: Context Management (Weeks 4-5) ⚠️ CRITICAL**
9. Rolling window summarization (start simple: recent text + single summary)
10. Context packer (assemble context window from components)
11. Session cache (avoid rebuilding context on every request)
12. Integrate with generation service

**Phase 4: Creative Library (Week 6)**
13. Library CRUD (characters, settings, themes)
14. Library UI
15. Simple keyword-based retrieval (defer embeddings/vector DB)
16. Library context injection into generation

**Phase 5: Series & Continuity (Week 7)**
17. Series management
18. Series context inheritance
19. Cross-story continuity tracking

**Phase 6: Optimization & Advanced Features (Week 8+)**
20. Hierarchical memory (multi-tier summaries)
21. Outline-driven context packing
22. Vector embeddings + semantic retrieval (if needed)
23. Streaming generation responses
24. Advanced caching strategies

**Critical Path:**
- Phase 3 (Context Management) is the hardest and most important. Everything else is standard CRUD. Budget extra time for context packing iteration.
- Can't effectively test Phase 2 (LLM Integration) without at least basic Phase 3 (context management) for stories >500 words.
- Phase 4 and 5 can be developed in parallel after Phase 3 is solid.

**Defer to Later:**
- Vector database / embeddings (Phase 6+)
- Multi-user features (out of initial scope)
- Advanced outline features (Phase 6+)

## Sources

### Context Management & Architecture
- [Context Window Management Strategies for AI Agents](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)
- [LLM Development in 2026: Hierarchical Memory](https://medium.com/@vforqa/llm-development-in-2026-transforming-ai-with-hierarchical-memory-for-deep-context-understanding-32605950fa47)
- [Best LLMs for Extended Context Windows in 2026](https://aimultiple.com/ai-context-window)
- [Context Engineering: The New AI Architecture](https://www.infoworld.com/article/4127462/what-is-context-engineering-and-why-its-the-new-ai-architecture.html)
- [Enhancing Conversational Continuity with Context Summarization](https://community.openai.com/t/enhancing-conversational-continuity-with-context-summarization/395851)

### Long-Form Narrative Generation
- [From Context to EDUs: Faithful Context Compression](https://arxiv.org/pdf/2512.14244)
- [NEXUSSUM: Hierarchical LLM Agents for Long-Form Generation](https://aclanthology.org/2025.acl-long.500.pdf)
- [Multi-Agent Framework for Long Story Generation](https://arxiv.org/pdf/2506.16445)
- [COMI: Coarse-to-fine Context Compression](https://arxiv.org/html/2602.01719)
- [HERA: Improving Long Document Summarization](https://arxiv.org/html/2502.00448v1)

### RAG & Retrieval Systems
- [RAG in 2026: How Retrieval-Augmented Generation Works](https://www.techment.com/blogs/rag-in-2026/)
- [10 Types of RAG Architectures in 2026](https://newsletter.rakeshgohel.com/p/10-types-of-rag-architectures-and-their-use-cases-in-2026)
- [RAG at Scale: Building Production AI Systems](https://redis.io/blog/rag-at-scale/)
- [Vertex AI RAG Engine Overview](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/rag-engine/rag-overview)

### Story Bible & Writing Software
- [Series Bible Software for Writers - Plottr](https://plottr.com/series-bible-software/)
- [Creating a Story Bible for Your Book or Series](https://atmospherepress.com/creating-a-story-bible/)
- [Worldbuilding Software for Writers](https://plottr.com/worldbuilding-software/)

### Local LLM Tools
- [Local AI Text Generation: KoboldCPP & LM Studio](https://nozsh.com/blog/en/local-ai-text-generation-koboldcpp-sillytavern-lm-studio/)
- [3 Things Koboldcpp Can Do That LM Studio Cannot](https://www.xda-developers.com/3-things-koboldcpp-can-do-that-lm-studio-cannot/)
- [LM Studio - Local AI on Your Computer](https://lmstudio.ai)

### Vector Databases & Embeddings
- [Building a Graph Database with Vector Embeddings](https://medium.com/thedeephub/building-a-graph-database-with-vector-embeddings-a-python-tutorial-with-neo4j-and-embeddings-277ce608634d)
- [Vectors and Graphs: Better Together - Neo4j](https://neo4j.com/blog/developer/vectors-graphs-better-together/)
- [Story Embedding: Learning Based on Character Networks](https://www.sciencedirect.com/science/article/pii/S0004370220300023)

### Session Persistence
- [Sessions - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/sessions/)
- [Customizing Memory in LangGraph Agents](https://focused.io/lab/customizing-memory-in-langgraph-agents-for-better-conversations)
- [External Memory with SqliteSaver - LangGraph](https://deepwiki.com/langchain-ai/langchain-academy/5.3-external-memory-with-sqlitesaver)
- [Advanced SQLite Sessions - OpenAI Agents SDK](https://openai.github.io/openai-agents-python/sessions/advanced_sqlite_session/)
- [LlamaIndex Agent Memory: Short- & Long-Term Guide](https://www.llamaindex.ai/blog/improved-long-and-short-term-memory-for-llamaindex-agents)

---
*Architecture research for: AI-Assisted Story Writing Tools*
*Researched: 2026-02-13*
