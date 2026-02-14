# Project Research Summary

**Project:** Storyteller - AI-Assisted Long-Form Fiction Writing Tool
**Domain:** Self-hosted creative writing software with local LLM integration
**Researched:** 2026-02-13
**Confidence:** HIGH

## Executive Summary

Storyteller is an AI-assisted story writing tool for self-hosted deployment that integrates with local LLM servers (LM Studio, Ollama) or cloud APIs. Research shows this domain's central challenge is **context window management** for long-form content (20K+ words) using small models (7B-14B parameters, 4K-8K context windows). Industry leaders like Sudowrite and NovelCrafter are cloud-based SaaS products; Storyteller's self-hosted, privacy-first approach is a strong differentiator but requires excellent local LLM optimization.

The recommended approach uses **Next.js 15 + NestJS 11** with **better-sqlite3** for simplicity, deployed via Docker with OpenAI-compatible API integration. Architecture centers on a **context management engine** with rolling window summarization and retrieval-augmented generation (RAG) for the creative library. This engine is the critical component — without intelligent context packing, long-form generation fails regardless of other features.

The primary risk is **context degradation**: advertised context windows overstate usable capacity by >99%, and small models produce poor summaries. Mitigation requires hierarchical memory architecture with tested context budgets, multiple compression tiers, and outline-driven context packing. Secondary risks include model API compatibility variance and theme drift in long narratives. Early focus on context management and multi-model testing prevents costly rework later.

## Key Findings

### Recommended Stack

Modern TypeScript full-stack with production-ready tooling. Next.js 15 (not beta v16) provides stable server components and optimized builds. NestJS 11 offers structured backend architecture with improved performance. better-sqlite3's synchronous API is faster and simpler than async alternatives for single-user scenarios. OpenAI SDK v6 works with any OpenAI-compatible endpoint via `baseURL` configuration.

**Core technologies:**
- **Next.js 15** — Full-stack React framework with SSR/API routes, 135K GitHub stars, industry standard for 2025
- **NestJS 11** — TypeScript-first backend with modular architecture, clean separation of concerns, improved startup performance
- **better-sqlite3 12** — Fastest SQLite driver for Node.js with synchronous API, perfect for single-user self-hosted apps
- **OpenAI SDK 6** — Official client library, works with LM Studio/Ollama/cloud via custom baseURL
- **Zod 4** — Runtime validation for LLM responses and API inputs, 14x faster than v3, TypeScript-first
- **MUI 6** — Battle-tested UI components with 3.3M weekly downloads, comprehensive forms/tables/dialogs

**Critical versions:** Node.js 20+ (NestJS requirement), React 19 (Next.js 15 compatible). Use multi-stage Docker builds to separate build/runtime dependencies (50-80% size reduction). Rebuild better-sqlite3 in production container.

### Expected Features

Research shows clear feature tiers. Table stakes are non-negotiable — users expect them based on competing tools. Differentiators provide competitive advantage through self-hosting and local LLM support.

**Must have (table stakes):**
- Story Bible / Codex — centralized character/setting/lore database with search
- AI Prose Generation — context-aware generation via OpenAI-compatible API
- Outline → Prose Workflow — guided path from premise to beats to draft
- Chapter/Scene Organization — hierarchical document structure
- Context Window Management — RAG for long stories with small models
- Export to DOCX/Markdown — publishable output formats
- Revision/Editing Tools — regenerate, rewrite, expand/contract text
- Self-Hosted Docker Deployment — single-user, local-only, privacy-first

**Should have (competitive differentiators):**
- Local LLM Integration (LM Studio, Ollama) — users own compute, no subscriptions
- Bring Your Own API Key — cost transparency, model choice
- Intelligent Context Pruning — relevance-scored injection from story bible
- Progressive Story Generation — 20K+ words with 7B models in 4K windows
- Version History for Variants — git-like branching for experiments
- Series Continuity Management — multi-book tracking with shared world state
- Offline-First Architecture — work without internet

**Defer (v2+):**
- Advanced Style/Voice Fine-Tuning — high complexity, prompt engineering may suffice
- Theme/Motif Tracking — literary depth feature, not launch-critical
- Vector embeddings for semantic search — overkill for libraries <50 items
- Advanced outline visualization — polish on core workflow

**Anti-features (avoid):**
- Real-time collaboration — defeats self-hosted model, adds months of complexity
- Cloud sync — conflicts with privacy-first value proposition
- Built-in publishing — narrow use case, maintenance burden
- Mobile app — story writing is desktop activity, responsive web sufficient

### Architecture Approach

Industry standard is three-tier architecture with specialized context management engine. Frontend (React SPA) communicates with backend API (NestJS) which orchestrates LLM calls and database access. The context management engine is the make-or-break component.

**Major components:**

1. **Context Management Engine** — packs relevant context for small LLM windows using rolling window summarization, hierarchical memory (short/medium/long-term), and retrieval-augmented generation (RAG) for creative library. This is the critical path component.

2. **Story Generation Service** — orchestrates LLM calls with context packing. Abstracts LLM provider behind interface (supports LM Studio, Ollama, OpenAI, Claude via OpenAI-compatible API). Implements streaming for real-time feedback.

3. **Creative Library Service** — manages characters, settings, themes with CRUD + search. Retrieval system finds relevant items via keywords (start) or embeddings (later). Injects into context budget.

4. **Data Layer** — SQLite for relational data (stories, library, series, sessions). Optional vector embeddings via sqlite-vss extension (defer until library >50 items). In-memory cache for active session context.

**Key architectural patterns:**

- **Rolling Window Summarization** — recent 2-3K tokens verbatim, medium-term chapter/scene summaries (500-1K tokens), long-term ultra-compressed arc (200-500 tokens). Essential for unlimited story length with small models.

- **Hierarchical Memory Architecture** — multi-tier retention with different compression ratios. Short-term: verbatim. Medium-term: 3:1 compression. Long-term: 10:1 compression to facts/relationships.

- **Outline-Driven Context Packing** — organize context around story structure (acts/chapters/scenes) instead of purely chronological. Current scene gets full detail, siblings get summaries, ancestors provide arc context.

- **LLM Provider Abstraction** — interface separates business logic from API specifics. Handles model-specific quirks (chat templates, system message support, special tokens). Critical for multi-model support.

### Critical Pitfalls

Research identified seven critical pitfalls. Top five that impact roadmap planning:

1. **Context Window Illusion** — Models advertise 128K+ tokens but degrade severely before reaching limit. Research shows >99% falloff from maximum. Small models (4K-8K) degrade even faster. **Avoid:** Test empirical usable context, design for 50-70% of advertised limit, implement monitoring/warnings, plan summarization assuming smaller windows. **Phase 1 foundational.**

2. **Theme Drift** — As generation progresses, model loses memory of outline, story veers off-track. Most prominent problem in long-form AI generation. Rolling summaries degrade outline fidelity over compression cycles. **Avoid:** Dual memory storage (outline + events), hierarchical summaries (paragraph + chapter levels), periodic outline re-injection, knowledge graph for character goals. **Phase 1-2 architectural support needed.**

3. **Character Amnesia** — Character traits become inconsistent as story exceeds effective context. Details scatter and get lost in summarization ("brown eyes" → "attractive appearance" → lost). **Avoid:** Structured character sheets separate from narrative, injection at scene boundaries, "non-negotiable" core traits preserved in summaries, retrieval system for details. **Phase 2 dedicated system required.**

4. **Summarization Quality Degradation** — Small models (4K-8K context) produce poor summaries. Quality degrades beyond 8-16K tokens. Each compression pass loses critical details, errors compound. **Avoid:** Hierarchical summarization (multiple granularities), preserve raw chunks longer, consider larger model for summarization only, test quality explicitly. **Phase 1 foundational strategy.**

5. **Prompt Complexity Creep** — Developers pack more instructions as issues arise, context fills with rules leaving little room for story. Small models struggle with complex multi-requirement prompts. **Avoid:** Structure prompts like UX design, prioritize ruthlessly, move static context to retrieval, use CO-STAR framework, budget tokens explicitly (X% instructions, Y% outline, Z% narrative). **Phase 1 prompt strategy.**

**Other significant pitfalls:**

6. **Model-Specific Assumptions** — "OpenAI-compatible API" doesn't guarantee behavioral compatibility. Models have different chat templates, system message support, tokenization. **Avoid:** Abstraction layer from day one, test with multiple model families (Llama, Mistral, Qwen), graceful system message fallback. **Phase 1 + Phase 6.**

7. **No User Control Over Generation** — Batch generation with no streaming = users wait minutes for unusable output with no intervention. **Avoid:** Streaming from day one, token-by-token display, mid-generation stopping, progress indicators. **Phase 1 architectural, Phase 3 UX.**

## Implications for Roadmap

Based on dependencies and risk mitigation, suggested 6-phase structure:

### Phase 1: Foundation + Context Management
**Rationale:** Context management is the critical path — everything depends on it working correctly. Build database, basic API, and core context engine before adding features that rely on it. Without this, long-form generation fails regardless of other features.

**Delivers:**
- SQLite database schema (stories, library, sessions)
- Repository layer for data access
- Basic API routes (CRUD for stories)
- LLM provider abstraction + OpenAI-compatible adapter
- **Core context management engine** (rolling window summarization, basic RAG)
- Simple frontend (list stories, basic editor, generation button)

**Addresses features:**
- Story Bible (foundation)
- AI Prose Generation (basic)
- Context Window Management (critical path)

**Avoids pitfalls:**
- Context Window Illusion (tested empirically, 50-70% limits)
- Summarization Quality Degradation (hierarchical strategy from start)
- Prompt Complexity Creep (structured prompt budget)
- Model-Specific Assumptions (abstraction layer)
- No User Control (streaming architecture)

**Research flags:** Needs deep research on context packing algorithms, tokenization across models, summarization prompt engineering. Phase-specific research likely beneficial.

### Phase 2: Creative Library + Character Management
**Rationale:** Phase 1 proves generation works. Now add the knowledge layer that makes generation contextually aware. Character/setting management builds on database and context engine from Phase 1.

**Delivers:**
- Character profiles with structured data
- Setting/location tracking
- Library CRUD UI
- Keyword-based retrieval (defer embeddings)
- Library context injection into generation

**Addresses features:**
- Character Profiles (table stakes)
- Setting/Location Tracking (table stakes)
- Story Bible completion (table stakes)

**Avoids pitfalls:**
- Character Amnesia (dedicated character sheet system with retrieval)
- Theme Drift (outline + library provide anchors)

**Research flags:** Standard patterns, minimal research needed. CRUD + retrieval well-documented.

### Phase 3: Outline → Prose Workflow
**Rationale:** With library in place, add structured workflow from premise to draft. Outline-driven context packing depends on outline system existing. This completes core value proposition.

**Delivers:**
- Premise refinement UI
- Chapter/scene outline editor
- Beat-based generation
- Outline-driven context packing
- Hierarchical document organization

**Addresses features:**
- Outline → Prose Workflow (table stakes)
- Chapter/Scene Organization (table stakes)
- Outline-driven context (differentiator)

**Avoids pitfalls:**
- Theme Drift (outline re-injection, structure-aware context)

**Research flags:** Standard patterns for hierarchical editors. Outline-to-generation workflow is well-documented in competitors.

### Phase 4: Revision + Export
**Rationale:** Core generation complete. Add iteration tools and output formats. Users need to refine generated content and export final work.

**Delivers:**
- Regenerate paragraph/section
- Expand/contract text
- Tone adjustment controls
- Version history for variants (git-like branching)
- Export to Markdown, DOCX, PDF

**Addresses features:**
- Revision/Editing Tools (table stakes)
- Export to Standard Formats (table stakes)
- Version History for Variants (differentiator)

**Research flags:** Standard patterns. Export libraries well-documented. Version control patterns established.

### Phase 5: Series Continuity
**Rationale:** Single-story workflow solid. Extend to multi-book tracking. Series features build on library and story systems from earlier phases.

**Delivers:**
- Series management (multi-book projects)
- Shared world state across stories
- Cross-book character development tracking
- Timeline/chronology management
- Series-level context inheritance

**Addresses features:**
- Series Continuity Management (differentiator)

**Research flags:** Novel territory, limited prior art. Likely benefits from phase-specific research on series tracking patterns.

### Phase 6: Polish + Advanced Features
**Rationale:** MVP complete. Add nice-to-haves based on user feedback and usage patterns.

**Delivers:**
- Intelligent context pruning (semantic relevance scoring)
- Enhanced character/setting templates
- Theme/motif tracking
- EPUB export
- Multi-model optimization (test with Llama, Mistral, Qwen)
- Performance optimization (caching, batching)

**Addresses features:**
- Intelligent Context Pruning (differentiator)
- Theme/Motif Tracking (deferred feature)
- Model Flexibility (differentiator)

**Avoids pitfalls:**
- Model-Specific Assumptions (multi-model testing)

**Research flags:** Advanced features, defer research until Phase 5 complete.

### Phase Ordering Rationale

- **Phase 1 first:** Context management is foundational. Can't test LLM integration effectively without it. All features depend on it working correctly for stories >500 words.

- **Phase 2 before Phase 3:** Library provides the data that outline workflow references (characters, settings). Better to have library data available when building outline UI.

- **Phase 3 before Phase 4:** Need complete generation workflow before adding revision tools. Can't revise what doesn't exist yet.

- **Phase 4 before Phase 5:** Series builds on single-story features. Must be solid before extending to multi-book.

- **Phase 6 last:** Polish after core value proven. User feedback guides priorities.

- **Critical path:** Phases 1-3 are sequential dependencies. Phases 4-5 could theoretically parallelize but series makes little sense without good export (users need to track final outputs).

### Research Flags

**Phases likely needing `/gsd:research-phase`:**

- **Phase 1:** Complex context management algorithms, multi-model tokenization differences, summarization quality — DEFINITELY research-phase this.
- **Phase 5:** Series continuity tracking is novel territory, sparse prior art — likely benefits from dedicated research.

**Phases with standard patterns (skip research-phase):**

- **Phase 2:** CRUD + keyword search is well-documented, standard patterns apply.
- **Phase 3:** Hierarchical editors are common, outline-based generation has prior art in competitors.
- **Phase 4:** Export libraries are mature, version control patterns established.
- **Phase 6:** Can research specific features as needed, but most are well-documented.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Context7 + official docs verify all versions are production-ready. Next.js 15, NestJS 11, React 19 stable. Clear migration guides. Multi-stage Docker patterns well-documented. |
| Features | HIGH | Competitor analysis (Sudowrite, NovelCrafter, Squibler) reveals clear table stakes. Self-hosted differentiator validated via user requirements. Anti-features well-reasoned. |
| Architecture | HIGH | Industry-standard three-tier with domain-specific context management patterns. Rolling window, hierarchical memory, RAG all have academic and production precedent. Build order validated by dependencies. |
| Pitfalls | MEDIUM-HIGH | Context window degradation and theme drift are research-backed (multiple papers). Model compatibility issues documented in LM Studio/Ollama forums. Summarization quality concerns validated empirically. Some pitfalls are predictive based on architectural analysis. |

**Overall confidence:** HIGH

Research draws from Context7 verified libraries (Next.js, NestJS, OpenAI SDK, better-sqlite3), official documentation, academic papers on context management, and competitor analysis. Stack recommendations use production-ready versions (not beta). Architecture patterns have precedent in both academic research (SCORE, NEXUSSUM papers) and production tools. Pitfalls are evidence-based where possible, inference-based where necessary.

### Gaps to Address

Areas where research was inconclusive or needs validation during implementation:

- **Optimal context budget allocation:** Theory suggests 50% recent text, 30% summaries, 20% arc, but this needs empirical tuning per model. Validate in Phase 1 with A/B testing.

- **Summarization model selection:** Unclear whether using same model for summarization vs. generation is sufficient, or if larger model needed just for summaries. Experiment during Phase 1.

- **Embedding necessity threshold:** Research suggests >50 library items before vector embeddings pay off, but this is inference not validated. Monitor in Phase 2, defer embeddings unless retrieval quality suffers.

- **Series continuity data model:** Limited prior art on series-level context tracking. Phase 5 may need dedicated architecture research before implementation.

- **Small model (7B-14B) viability:** Research shows they work but with caveats. Need validation with actual user stories to confirm 4K-8K context windows are sufficient with good context management. Test during Phase 1.

## Sources

### Primary (HIGH confidence)
- `/websites/nextjs` — Next.js documentation, version compatibility, React 19 support
- `/websites/nestjs` — NestJS documentation, v11 features, migration guides
- `/openai/openai-node` — OpenAI SDK official docs, OpenAI-compatible API usage
- `/wiselibs/better-sqlite3` — better-sqlite3 documentation, performance characteristics

### Secondary (MEDIUM-HIGH confidence)
- [Next.js v15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [NestJS v11 Migration Guide](https://docs.nestjs.com/migration-guide)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [Context Window Management Strategies](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)
- [LLM Hierarchical Memory 2026](https://medium.com/@vforqa/llm-development-in-2026-transforming-ai-with-hierarchical-memory-for-deep-context-understanding-32605950fa47)
- [RAG in 2026 Guide](https://www.techment.com/blogs/rag-in-2026/)
- [Sudowrite vs. NovelCrafter Comparison](https://sudowrite.com/blog/sudowrite-vs-novelcrafter-the-ultimate-ai-showdown-for-novelists/)
- [Top 20 AI Writing Tools for Authors 2026](https://www.authorflows.com/blogs/top-ai-writing-tools-for-authors-2026)

### Academic/Research (HIGH confidence for pitfalls)
- [SCORE: Story Coherence Enhancement](https://arxiv.org/html/2503.23512v1) — RAG for fiction, thematic consistency
- [Reading Subtext: LLM Summarization Evaluation](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00702/124837/) — Faithfulness mistakes in summaries
- [Long Story Generation via Knowledge Graph](https://arxiv.org/html/2508.03137v1) — Theme drift and dual memory solution
- [Context Rot Research](https://research.trychroma.com/context-rot) — Context window degradation (>99% falloff)
- [Epoch AI: Context Windows](https://epoch.ai/data-insights/context-windows) — Advertised vs. effective context
- [NEXUSSUM: Hierarchical Long-Form Generation](https://aclanthology.org/2025.acl-long.500.pdf)

### Tertiary (MEDIUM confidence)
- [Best AI Tools for Fiction Writers 2026](https://blog.mylifenote.ai/the-11-best-ai-tools-for-writing-fiction-in-2026/)
- [Local LLM Hosting 2025 Guide](https://medium.com/@rosgluk/local-llm-hosting-complete-2025-guide-ollama-vllm-localai-jan-lm-studio-more-f98136ce7e4a)
- [Docker Multi-Stage Builds 2025](https://arnab-k.medium.com/creating-multi-stage-builds-in-docker-for-optimized-images-202e58df2e09)
- [Best React UI Component Libraries 2025](https://www.sencha.com/blog/10-best-react-ui-component-libraries-in-2025/)

---
*Research completed: 2026-02-13*
*Ready for roadmap: yes*
