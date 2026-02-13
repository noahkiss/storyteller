# Storyteller

## What This Is

A self-hosted story writing tool that connects to local LLMs (via OpenAI-compatible APIs like LM Studio) and intelligently manages context to produce coherent long-form fiction. It provides a collaborative setup phase where the user builds out characters, settings, themes, and plot structure with the AI, then a hands-off writing phase where the system progressively generates the story while keeping the model on-track despite small context windows.

## Core Value

Produce coherent, outline-faithful stories from small local LLMs by being smart about context management — packing the right combination of outline, summary, and recent text into each generation call so 7B-14B models write like they remember the whole story.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Connect to any OpenAI-compatible API endpoint (LM Studio, LiteLLM, Ollama, etc.)
- [ ] Collaborative story setup: premise → AI-assisted refinement → structured outline
- [ ] Intelligent context management for models with 4K–8K effective context windows
- [ ] Progressive story generation from outline with rolling summaries
- [ ] Reusable creative library: characters, settings, themes, world-building elements
- [ ] Story series support with shared continuity across stories
- [ ] Dashboard-style web UI with story project management
- [ ] Single continuous document output per story
- [ ] Swappable models mid-story
- [ ] Design for 20K+ word stories (works well for shorter ones too)

### Out of Scope

- Multi-user / authentication — single user, personal tool
- Mobile app — web-first, responsive is fine
- Cloud LLM APIs (OpenAI, Anthropic) — designed for local models, though any OpenAI-compatible endpoint works
- Real-time collaboration — solo writing tool
- Export to ePub/PDF — plain document output for v1

## Context

### Target Models

The system targets models that run on a 16GB MacBook Pro:

| Parameters | Quant | Size | Effective Context |
|-----------|-------|------|-------------------|
| 7B–8B | Q4_K_M–Q6_K | 4.5–6.5 GB | 4K–8K tokens |
| 13B–14B | Q4_K_M–Q5_K_M | 7.5–10 GB | 4K–8K tokens |

Many models advertise 32K–128K context, but practical coherence on small models degrades significantly past 4K–8K tokens. The context management system must assume worst-case ~4K usable context.

### Context Management Strategy

The central technical challenge. With ~4K–8K usable tokens per generation call, the system must fit:
- Story outline / structure (compressed)
- Rolling summary of everything written so far
- Recent text (last few paragraphs for voice continuity)
- Writing instructions / style guidance
- Character and setting reference (relevant subset)

This is a retrieval + summarization problem. The system needs to be smart about what to include in each call — probably a combination of the outline as the backbone, a progressively updated summary, and RAG-style retrieval of relevant character/setting/plot details for the current scene.

### Creative Library

Users can define reusable assets:
- **Characters**: Name, description, personality, relationships, arc notes. Can be forked/modified per-story.
- **Settings**: Locations, atmosphere, sensory details. Reusable across stories.
- **Themes**: Tonal and thematic elements that guide the AI's writing.
- **World-building**: Lore, rules, history — especially for story series sharing a universe.

These feed into both the setup phase (refining the outline) and the writing phase (context for generation).

### Story Series

Multiple stories can share a universe — same characters, settings, world-building. The system tracks continuity across stories in a series, so the AI knows what happened in prior entries when writing new ones.

### User's LLM Setup

Primary: LM Studio running on a MacBook Pro (16GB). The backend connects to LM Studio's built-in OpenAI-compatible server. Connection config is base URL + optional API key.

## Constraints

- **Target hardware**: 16GB MacBook Pro running the LLM — the storyteller backend should be lightweight (Docker container)
- **Context window**: Must work well with 4K effective context; optimize for 8K; gracefully handle larger windows when available
- **Model agnostic**: No model-specific prompting — use standard OpenAI chat completions API
- **Deployment**: Single Docker container (or compose stack) — easy to self-host
- **Single user**: No auth, no multi-tenancy, no user management

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| OpenAI-compatible API only | Broadest compatibility with local LLM servers (LM Studio, Ollama, LiteLLM, vLLM) | — Pending |
| Design for 4K–8K context | Worst-case for target models; larger windows are a bonus, not a requirement | — Pending |
| SQLite for persistence | Single-user, single-file DB, easy backup, no external dependencies | — Pending |
| Dashboard UI | Story project management with overview, not just a chat interface | — Pending |
| Rolling summary + outline context strategy | Best fit for small context windows — keeps model aware of full story arc | — Pending |

---
*Last updated: 2026-02-13 after initialization*
