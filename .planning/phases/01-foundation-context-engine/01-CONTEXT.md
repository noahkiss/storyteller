# Phase 1: Foundation + Context Engine - Context

**Gathered:** 2026-02-13
**Updated:** 2026-02-14 (aligned with Phase 2 text-first architecture decisions)
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish technical foundation with working LLM integration and intelligent context management for small models. User can configure an OpenAI-compatible endpoint, generate text with streaming output, see context budget visualization, and configure per-story generation settings. No story workflow (outlines, scenes, creative library) — those are Phase 2+.

Requirements: LLM-01, LLM-02, CTX-01, CTX-02, CTX-03, CTX-04, DASH-02

</domain>

<decisions>
## Implementation Decisions

### Design philosophy
- Power-user, text-first interface — everything is markdown files loaded into a textarea
- Desktop-first web app — no mobile considerations
- Advanced controls hidden behind collapsible sections, dropdowns, tabs, and panels
- Surface is clean and approachable; depth is one click away

### Application layout (foundation for all phases)
- Split-screen: left pane for navigation/lists, right pane is always the reusable textarea component
- Left pane has tabs — Phase 1 activates initial tabs (generation workspace, app settings); Phase 2+ adds more (Stories, Characters, Settings, Templates, AI Config)
- Tab infrastructure must be extensible for future phases
- Single reusable textarea component with enhanced features — this is the core UI element of the entire app

### Reusable textarea component (Phase 1 builds this)
- Multi-line markdown-aware text editing surface
- Version navigation: back/forward buttons to browse version history (not undo/redo — version timeline)
- Auto-save with chunked change tracking (not per-keystroke, natural chunks)
- Ctrl+S / Cmd+S supported as explicit save point
- Syntax highlighting for special markers (Phase 2 adds AI expansion markers)
- All content version-tracked in SQLite
- This single component is used everywhere: generation output, prompt editing, system prompt editing, and in Phase 2+ for characters, settings, outlines, AI config files

### LLM connection setup
- Dedicated settings area (accessible from left pane tabs or a settings icon)
- Form fields: base URL, API key, model name
- Connection test has two levels: quick status badge (green/red) + auto-fetch available models, and a "test generate" button for full pipeline validation
- Model selection: auto-discover from `/v1/models` endpoint with manual text input fallback when endpoint doesn't support model listing
- Connection failure mid-use: inline error where generation was happening + retry button (no context lost)

### Generation interface
- Generation workspace loads into the split-screen: left pane shows prompt history and controls, right pane is the textarea with generated output
- Prompt input uses the textarea component (same as everywhere else)
- Prompt history list shown in the left pane — click to re-use previous prompts
- Streaming text renders chunk-by-chunk (smooth append), not token-by-token
- During generation: stop button, live token count, and tokens/second readout visible
- After generation: user can copy output, regenerate (new result from same prompt), or edit text inline in the textarea
- Inline edits tracked as versions — original generation preserved (groundwork for Phase 4 version history)
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

</decisions>

<specifics>
## Specific Ideas

- Split view has a dev-tool feel — functional, information-dense when expanded
- Context visualization should feel like a debugger/inspector for the LLM call — full transparency into what the model sees
- Compression events as a log gives users confidence the system is working (not a black box)
- Presets named for writing intent (Creative/Balanced/Precise) not technical jargon
- The textarea component is the most important UI element — it needs to be solid because everything flows through it in every phase
- System prompt as an editable markdown file (not a locked textarea) sets the pattern for Phase 2's AI config files

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-context-engine*
*Context gathered: 2026-02-13*
*Updated: 2026-02-14*
