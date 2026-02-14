# Requirements: Storyteller

**Defined:** 2026-02-13
**Core Value:** Produce coherent, outline-faithful stories from small local LLMs by being smart about context management

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### LLM Integration

- [ ] **LLM-01**: User can configure an OpenAI-compatible API endpoint (base URL + optional API key)
- [ ] **LLM-02**: User sees streaming token output during story generation
- [ ] **LLM-03**: User can select and swap models per story or mid-story

### Story Setup & Outline

- [ ] **SETUP-01**: User can input a story premise and refine it through back-and-forth with the AI
- [ ] **SETUP-02**: User can create and edit a chapter/scene outline with beat structure
- [ ] **SETUP-03**: User can collaboratively build out characters, settings, and plot during setup phase

### Context Management

- [ ] **CTX-01**: System maintains rolling summaries of generated text (recent text verbatim + compressed history)
- [ ] **CTX-02**: System re-injects the story outline into each generation call to prevent theme drift
- [ ] **CTX-03**: System uses hierarchical memory with short/medium/long-term tiers at different compression levels
- [ ] **CTX-04**: User can see what context is being packed into each generation call (context budget visualization)

### Creative Library

- [ ] **LIB-01**: User can create character profiles with name, traits, personality, relationships, and arc notes
- [ ] **LIB-02**: User can create setting/location entries with descriptions, atmosphere, and rules
- [ ] **LIB-03**: User can reuse library items across stories with per-story modifications
- [ ] **LIB-04**: User can define themes and tonal elements that guide the AI's writing style

### Story Generation

- [ ] **GEN-01**: System progressively generates story content scene-by-scene from the outline
- [ ] **GEN-02**: System can continue writing where it left off with full context awareness (summary + outline + recent text)
- [ ] **GEN-03**: System automatically summarizes each generated chunk for use in subsequent generation calls

### Revision & Editing

- [ ] **REV-01**: User can regenerate any section of the story with a different output
- [ ] **REV-02**: User can edit generated text inline
- [ ] **REV-03**: User can expand or contract passages (make them longer or shorter)
- [ ] **REV-04**: System tracks version history of generated variants and supports branching story paths

### Series & Continuity

- [ ] **SER-01**: User can group stories into multi-story projects with shared characters, settings, and world-building
- [ ] **SER-02**: System provides cross-story continuity — AI knows what happened in prior stories when writing new ones

### Export & Output

- [ ] **OUT-01**: User can view the full story as a single continuous document
- [ ] **OUT-02**: User can export story as a Markdown file

### Dashboard & Project Management

- [ ] **DASH-01**: User sees a dashboard with all stories, their status, and progress
- [ ] **DASH-02**: User can configure per-story settings (model, endpoint, generation parameters)
- [ ] **DASH-03**: User can see context window usage visualization during generation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Export

- **OUT-03**: User can export story as DOCX or PDF
- **OUT-04**: User can export story as EPUB

### Advanced Features

- **ADV-01**: System uses semantic relevance scoring for intelligent context pruning
- **ADV-02**: System detects quality drift (repetition, off-topic) during generation
- **ADV-03**: User can adjust tone/style of passages via controls
- **ADV-04**: System tracks recurring themes/motifs across the narrative

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-user / authentication | Single user personal tool — no auth needed |
| Mobile app | Story writing is a desktop activity; responsive web is sufficient |
| Cloud sync | Conflicts with self-hosted, privacy-first value proposition |
| Real-time collaboration | Adds months of complexity, defeats self-hosted model |
| Built-in publishing | Narrow use case, maintenance burden — export formats sufficient |
| Grammar/spell check | Solved problem — users can paste into dedicated tools |
| Cloud LLM APIs as primary target | Designed for local models; cloud works via OpenAI-compat but not optimized for |
| Multi-model ensemble generation | Complexity explosion with diminishing returns |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LLM-01 | Phase 1 | Pending |
| LLM-02 | Phase 1 | Pending |
| LLM-03 | Phase 5 | Pending |
| SETUP-01 | Phase 2 | Pending |
| SETUP-02 | Phase 2 | Pending |
| SETUP-03 | Phase 2 | Pending |
| CTX-01 | Phase 1 | Pending |
| CTX-02 | Phase 1 | Pending |
| CTX-03 | Phase 1 | Pending |
| CTX-04 | Phase 1 | Pending |
| LIB-01 | Phase 2 | Pending |
| LIB-02 | Phase 2 | Pending |
| LIB-03 | Phase 2 | Pending |
| LIB-04 | Phase 2 | Pending |
| GEN-01 | Phase 3 | Pending |
| GEN-02 | Phase 3 | Pending |
| GEN-03 | Phase 3 | Pending |
| REV-01 | Phase 4 | Pending |
| REV-02 | Phase 4 | Pending |
| REV-03 | Phase 4 | Pending |
| REV-04 | Phase 4 | Pending |
| SER-01 | Phase 5 | Pending |
| SER-02 | Phase 5 | Pending |
| OUT-01 | Phase 4 | Pending |
| OUT-02 | Phase 4 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 1 | Pending |
| DASH-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-13*
*Last updated: 2026-02-13 after roadmap creation*
