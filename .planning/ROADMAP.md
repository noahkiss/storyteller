# Roadmap: Storyteller

## Overview

This roadmap delivers a self-hosted story writing tool that produces coherent long-form fiction from small local LLMs through intelligent context management. The journey begins with foundation and the critical context engine (Phase 1), adds the creative library and story setup workflow (Phase 2), completes the core generation loop with dashboard UI (Phase 3), enables revision and export capabilities (Phase 4), and finishes with series support and advanced features (Phase 5).

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation + Context Engine** - Database, LLM integration, and core context management
- [ ] **Phase 2: Creative Library + Story Setup** - Character/setting management and outline workflow
- [ ] **Phase 3: Generation + Dashboard** - Progressive story generation and project management UI
- [ ] **Phase 4: Revision + Export** - Editing tools, version control, and output formats
- [ ] **Phase 5: Series + Polish** - Multi-story continuity and advanced features

## Phase Details

### Phase 1: Foundation + Context Engine
**Goal**: Establish technical foundation with working LLM integration and intelligent context management for small models
**Depends on**: Nothing (first phase)
**Requirements**: LLM-01, LLM-02, LLM-03, CTX-01, CTX-02, CTX-03, CTX-04, DASH-02
**Success Criteria** (what must be TRUE):
  1. User can configure OpenAI-compatible API endpoint and see connection status
  2. User can generate text from a prompt and see streaming token output
  3. System maintains rolling summaries (recent verbatim + compressed history) across generation calls
  4. User can visualize what context is packed into each generation call with token budget breakdown
  5. System prevents context overflow by prioritized tier truncation (multi-level compression in Phase 3)
**Plans**: 8 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffold + database layer (Vite, SQLite WASM, Zustand stores)
- [ ] 01-02-PLAN.md — Context engine TDD (token counting, context packing, hierarchical compression)
- [ ] 01-03-PLAN.md — Core UI layout + textarea (Allotment split-screen, tab system, CodeMirror textarea with version nav)
- [ ] 01-04-PLAN.md — LLM client + settings UI (OpenAI SDK wrapper, connection testing, generation parameters, presets)
- [ ] 01-05-PLAN.md — Context visualization (stacked bar, itemized list, text inspection, compression log)
- [ ] 01-06-PLAN.md — Generation workspace + integration (streaming output, prompt history, full wiring, human verification)
- [ ] 01-07-PLAN.md — Gap closure: EnhancedTextarea for generation output (replace pre element, enable inline editing + version tracking)
- [ ] 01-08-PLAN.md — Gap closure: Update success criterion #5 wording (prioritized tier truncation, not multi-level compression)

### Phase 2: Creative Library + Story Setup
**Goal**: Enable structured story planning with reusable creative assets and AI-assisted outline development
**Depends on**: Phase 1
**Requirements**: SETUP-01, SETUP-02, SETUP-03, LIB-01, LIB-02, LIB-03, LIB-04
**Success Criteria** (what must be TRUE):
  1. User can create and edit character profiles with traits, personality, relationships, and arc notes
  2. User can create and edit setting/location entries with descriptions and atmosphere details
  3. User can reuse library items across multiple stories with per-story modifications
  4. User can input a premise and refine it through back-and-forth conversation with the AI
  5. User can create and edit a chapter/scene outline with beat-level structure
  6. Relevant library items (characters, settings, themes) automatically inject into generation context
**Plans**: 8 plans

Plans:
- [ ] 02-01-PLAN.md — Schema extension, TypeScript types, dependencies, markdown service
- [ ] 02-02-PLAN.md — Character and setting library (stores, CRUD hooks, tab UI)
- [ ] 02-03-PLAN.md — Story management with copy-on-write forking and three-way merge
- [ ] 02-04-PLAN.md — Outline editor with automatic library reference detection
- [ ] 02-05-PLAN.md — AI config management and template system
- [ ] 02-06-PLAN.md — AI conversation service and premise refinement workspace
- [ ] 02-07-PLAN.md — AI expansion markers (CodeMirror highlighting + marker processing)
- [ ] 02-08-PLAN.md — Integration wiring and end-to-end verification

### Phase 3: Generation + Dashboard
**Goal**: Complete core story generation workflow with scene-by-scene progression and project management interface
**Depends on**: Phase 2
**Requirements**: GEN-01, GEN-02, GEN-03, DASH-01, DASH-03
**Success Criteria** (what must be TRUE):
  1. System progressively generates story content scene-by-scene following the outline structure
  2. User can stop generation and resume later with full context awareness (outline + summary + recent text)
  3. System automatically summarizes each generated chunk and uses it in subsequent calls
  4. User sees a dashboard listing all stories with status and progress indicators
  5. User can view context window usage visualization during active generation
**Plans**: TBD

Plans:
- [ ] TBD (set during `/gsd:plan-phase 3`)

### Phase 4: Revision + Export
**Goal**: Provide iteration tools and standard output formats so users can refine and publish their work
**Depends on**: Phase 3
**Requirements**: REV-01, REV-02, REV-03, REV-04, OUT-01, OUT-02
**Success Criteria** (what must be TRUE):
  1. User can regenerate any section of the story and see alternative outputs
  2. User can edit generated text inline with changes persisting to database
  3. User can expand or contract passages (make longer or shorter) via AI
  4. System tracks version history with branching paths for different generation variants
  5. User can view the full story as a single continuous document
  6. User can export story as Markdown file for external editing or publishing
**Plans**: TBD

Plans:
- [ ] TBD (set during `/gsd:plan-phase 4`)

### Phase 5: Series + Polish
**Goal**: Support multi-story projects with shared continuity and add advanced context/export features
**Depends on**: Phase 4
**Requirements**: SER-01, SER-02
**Success Criteria** (what must be TRUE):
  1. User can group multiple stories into a series project with shared world-building
  2. System provides cross-story continuity so AI knows what happened in prior stories when writing new ones
  3. System uses semantic relevance scoring for intelligent context pruning (better than keyword matching)
  4. User can swap models mid-story and system adapts context packing to model's capabilities
**Plans**: TBD

Plans:
- [ ] TBD (set during `/gsd:plan-phase 5`)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Context Engine | 0/8 | Planned | - |
| 2. Creative Library + Story Setup | 0/8 | Planned | - |
| 3. Generation + Dashboard | 0/TBD | Not started | - |
| 4. Revision + Export | 0/TBD | Not started | - |
| 5. Series + Polish | 0/TBD | Not started | - |
