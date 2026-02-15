# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-13)

**Core value:** Produce coherent, outline-faithful stories from small local LLMs by being smart about context management
**Current focus:** Phase 1 - Foundation + Context Engine

## Current Position

Phase: 1 of 5 (Foundation + Context Engine)
Plan: 8 of 8 in current phase
Status: Executing
Last activity: 2026-02-15 — Completed plan 01-08 (Gap Closure - Success Criterion Wording)

Progress: [██████████] 100% (8/8 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 6 min
- Total execution time: 0.75 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation-context-engine | 8 | 45min | 6min |

**Recent Trend:**
- Last 5 plans: 7min, 5min, 9min, 1min, 1min
- Trend: Gap closure plans significantly faster (1 min vs 6-9 min avg)

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

Last session: 2026-02-15 (plan execution)
Stopped at: Completed 01-08-PLAN.md - Gap Closure (Success Criterion Wording)
Resume file: None

**Next step:** Phase 1 complete (8/8 plans done). All gap closure plans complete. Ready for phase verification and completion.
