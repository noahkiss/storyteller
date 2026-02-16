# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Produce coherent, outline-faithful stories from small local LLMs by being smart about context management
**Current focus:** Phase 2 - Creative Library + Story Setup

## Current Position

Phase: 2 of 5 (Creative Library + Story Setup)
Plan: 3 of 7 in current phase
Status: In Progress
Last activity: 2026-02-16 — Completed plan 02-03 (Story Management with Fork-on-Use)

Progress: [████░░░░░░] 43% (3/7 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 11
- Average duration: 6 min
- Total execution time: 1.06 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-context-engine | 8 | 47min | 6min |
| 02-creative-library-story-setup | 3 | 20min | 7min |

**Recent Trend:**
- Last 5 plans: 1min, 2min, 3min, 8min, 9min
- Trend: Phase 2 complexity increasing (CRUD + UI), averaging 7min/plan

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Initial planning: OpenAI-compatible API only for broadest local LLM compatibility
- Initial planning: Design for 4K-8K effective context (worst-case for target models)
- Initial planning: SQLite for single-user persistence with no external dependencies
- Initial planning: Dashboard UI for project management, not just chat interface
- Initial planning: Rolling summary + outline context strategy for small windows
- Phase 2 discussion: Text-first, markdown-driven interaction model — everything is a markdown file loaded into a reusable textarea
- Phase 2 discussion: Split-screen layout — left pane (tabs/navigation), right pane (always the textarea)
- Phase 2 discussion: AI behavior defined in editable markdown files (agent.md style), global + per-story
- Phase 2 discussion: Version tracking via SQLite with auto-save, explicit save (Ctrl+S), and AI-triggered version points
- Phase 2 discussion: Slice-of-life focus — small character casts, relationship-focused settings, no complex world-building
- Phase 2 discussion: Desktop-first power-user web app
- Plan 01-01: Use official SQLite WASM distribution (3.48.0) with OPFS backend for client-side persistence
- Plan 01-01: COOP/COEP headers in Vite dev server required for SharedArrayBuffer (OPFS dependency)
- Plan 01-01: Zustand persist middleware for LLM settings, plain Zustand for ephemeral UI state
- Plan 01-01: Seed three built-in presets (Creative, Balanced, Precise) on first database init
- Plan 01-02: Use js-tiktoken for BPE token counting with o200k_base encoding (gpt-4o-mini default)
- Plan 01-02: Greedy context packing algorithm (highest priority first) over optimal knapsack
- Plan 01-02: No encoding instance caching — simpler implementation, optimization deferred
- Plan 01-03: Allotment for split-pane layout with 30% left pane, resizable
- Plan 01-03: Tab system uses Zustand ui-store for activeTab state
- Plan 01-03: CodeMirror with markdown extension, no line numbers (not code)
- Plan 01-03: Auto-save debounces for 2s, serializes concurrent saves, skips duplicates
- Plan 01-03: TanStack Query polls version list every 3s for real-time updates
- Plan 01-04: Use OpenAI SDK with dangerouslyAllowBrowser: true (acceptable for localhost connections)
- Plan 01-04: Chunk buffering at ~50 chars for smooth append performance
- Plan 01-04: Two-level connection testing (quick test + full pipeline test)
- Plan 01-04: Model selector auto-discovers from /v1/models with manual fallback
- Plan 01-04: Generation parameters stored in settings-store with Zustand persist
- Plan 01-04: Collapsible generation parameters section (collapsed by default)
- Plan 01-05: Vertical split in right pane (textarea above, context viz below)
- Plan 01-05: Context bar with color-coded segments (blue system, green recent, amber compressed)
- Plan 01-05: Compression log polls every 5s, limited to last 50 events
- Plan 01-05: Text inspector uses react-markdown modal with Escape key support
- [Phase 01]: Use ref to track user edits vs external updates for seamless streaming to editing transition
- [Phase 01]: onEdit callback separate from onChange to distinguish user-initiated edits from external value syncs
- Plan 02-01: Use gray-matter for frontmatter parsing (CommonJS module with ESM interop)
- Plan 02-01: Seed default templates and AI config on first database init (like presets)
- Plan 02-01: Store markdown content with frontmatter as single TEXT column in database
- Plan 02-01: Use TEXT PRIMARY KEY for all new Phase 2 tables (UUID-style IDs)
- Plan 02-01: Add base_content column to story_items for 3-way merge support
- Plan 02-03: Use node-diff3 for three-way merge with git-style conflict markers
- Plan 02-03: Log warning when merge conflict rate exceeds 50%
- Plan 02-03: Store base_content in story_items for three-way merge ancestor
- Plan 02-03: Defer App.tsx tab integration to Plan 02-08 to avoid parallel plan conflicts

### Pending Todos

None yet.

### Infrastructure

- **GitHub repo:** https://github.com/noahkiss/storyteller (public)
- **Docker image:** `ghcr.io/noahkiss/storyteller` (built via GitHub Actions on version tags)
- **Versioning:** semver, tag after each phase completion (v0.1.0 = Phase 1)
- **Post-phase checklist:** bump version in package.json, tag, push — see AGENTS.md for full steps
- **Runtime config:** env vars `STORYTELLER_LLM_BASE_URL`, `STORYTELLER_LLM_API_KEY`, `STORYTELLER_LLM_MODEL` injected at container startup

### Blockers/Concerns

**Phase 1 complexity:** Context management is the critical path and most complex component. Research identified this needs deep investigation of context packing algorithms, multi-model tokenization, and summarization quality. Consider `/gsd:research-phase 1` before planning if additional architectural clarity needed.

**Context budget allocation:** Optimal split between recent text, summaries, and outline needs empirical tuning per model. Plan for A/B testing during Phase 1 execution.

**Summarization model choice:** Unclear if same model for summarization vs. generation is sufficient, or if larger model needed just for summaries. Experiment during Phase 1.

## Session Continuity

Last session: 2026-02-16 (plan execution)
Stopped at: Completed 02-03-PLAN.md - Story Management with Fork-on-Use
Resume file: None

**Next step:** Continue Phase 2 with remaining plans (02-04 through 02-07), then integration plan 02-08.
