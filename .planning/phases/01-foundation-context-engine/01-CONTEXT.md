# Phase 1: Foundation + Context Engine - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish technical foundation with working LLM integration and intelligent context management for small models. User can configure an OpenAI-compatible endpoint, generate text with streaming output, see context budget visualization, and configure per-story generation settings. No story workflow (outlines, scenes, creative library) — those are Phase 2+.

Requirements: LLM-01, LLM-02, CTX-01, CTX-02, CTX-03, CTX-04, DASH-02

</domain>

<decisions>
## Implementation Decisions

### Design philosophy
- Power-user interface with complexity tucked away
- Advanced controls hidden behind collapsible sections, dropdowns, tabs, and panels
- Surface is clean and approachable; depth is one click away

### LLM connection setup
- Dedicated settings page with form fields (base URL, API key, model name)
- Connection test has two levels: quick status badge (green/red) + auto-fetch available models, and a "test generate" button for full pipeline validation
- Model selection: auto-discover from `/v1/models` endpoint with manual text input fallback when endpoint doesn't support model listing
- Connection failure mid-use: inline error where generation was happening + retry button (no context lost)

### Generation interface
- Split view layout: prompt/controls on one side, generated text output on the other
- Multi-line textarea for prompt input
- Prompt history list shown above the input area — click to re-use previous prompts
- Streaming text renders chunk-by-chunk (smooth append), not token-by-token
- During generation: stop button, live token count, and tokens/second readout visible
- After generation: user can copy output, regenerate (new result from same prompt), or edit text inline
- Inline edits tracked as user edits — original generation preserved (groundwork for Phase 4 version history)
- All generations (prompt + output) persisted to database across sessions

### Context visualization
- Always-visible panel (not on-demand or generation-only)
- Summary stacked bar at top: single horizontal bar with color-coded segments (system prompt, recent text, compressed history, outline, etc.) for quick glance
- Expandable itemized list below the bar: each context category as a row with label, token count, and progress bar
- Full text inspection: click any category to view the exact text/tokens being packed into the LLM call
- Compression event log: show when content moves between tiers ("Chapter 3 summary compressed from 450→120 tokens")

### Generation parameters
- Standard parameter set: temperature, max tokens, top_p, frequency penalty, presence penalty
- Presets: ship with built-in presets (Creative, Balanced, Precise) + user can create/save custom presets
- Parameters live in a collapsible section in the prompt panel — accessible but tucked away
- System prompt is fully user-editable (not managed or locked by Storyteller)

### Claude's Discretion
- Exact color palette and styling for context visualization segments
- Loading/skeleton states
- Toast vs inline for non-critical notifications
- Database schema design
- Context compression algorithm internals
- Specific streaming implementation details

</decisions>

<specifics>
## Specific Ideas

- Split view has a dev-tool feel — functional, information-dense when expanded
- Context visualization should feel like a debugger/inspector for the LLM call — full transparency into what the model sees
- Compression events as a log gives users confidence the system is working (not a black box)
- Presets named for writing intent (Creative/Balanced/Precise) not technical jargon

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-context-engine*
*Context gathered: 2026-02-13*
