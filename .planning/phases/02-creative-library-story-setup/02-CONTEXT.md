# Phase 2: Creative Library + Story Setup - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Enable structured story planning with reusable creative assets (characters, settings) and AI-assisted outline development. Users can create library items, set up stories through AI-assisted premise refinement, build outlines, and have library items auto-inject into generation context. This phase establishes the text-first, markdown-driven interaction model that defines the entire application.

Requirements: SETUP-01, SETUP-02, SETUP-03, LIB-01, LIB-02, LIB-03, LIB-04

</domain>

<decisions>
## Implementation Decisions

### Core interaction model — text-first, markdown-driven
- Everything is a markdown document loaded into a reusable textarea for editing
- Characters, settings, outlines, AI config — all are markdown files that load into the textarea, get edited as text, and save back
- No drag-and-drop or specialized form UIs — text editing IS the interface
- Desktop-first web app for power users
- This principle applies to ALL phases, not just Phase 2

### Application layout
- Split-screen: left pane for navigation/lists, right pane is always the reusable textarea
- Tabs in the left pane change what's listed: **Stories | Characters | Settings | Templates | AI Config**
- Click an item in the left pane → loads its markdown into the textarea
- Single textarea component with enhanced features (syntax highlighting for markers, version navigation, etc.)
- "Settings" tab = story settings/locations (not app settings — those are separate)

### Character profiles — hybrid structured + freeform
- Key structured fields: name, role, traits, key relationships, character arc notes, physical appearance, speech patterns/voice, backstory summary
- Plus freeform markdown notes section for everything else
- Predefined categories: POV Character, Named Character, Background Character (narrative-based)
- Free-form tags for flexible filtering
- Profiles are editable markdown templates — same textarea workflow
- Default character template is editable; users can create custom templates

### Setting/location profiles — mirrors character model
- Structured fields: name, type (city/building/landscape/etc.), atmosphere/mood, sensory details
- Relationship to characters: which characters frequent this location, emotional associations (e.g., "coffee shop — where Sam and Alex always meet, comfortable")
- Plus freeform markdown notes section
- Same categories + tags system as characters
- Same template-based editing

### Outline structure — flexible hierarchy
- Scenes are the core unit; chapters are optional grouping (some stories are a few hours, some span days)
- Each scene contains: summary, characters present, setting, mood/emotional tone
- Outlines are just text documents in the textarea — user cuts, pastes, reorders as plain text
- No specialized drag-and-drop or insert-between UI — text editing handles reordering
- Scenes link to library items: auto-detected from text mentions + manual add/remove

### AI premise refinement
- Two modes: free-form premise input OR guided walkthrough — user chooses
- Adaptive AI behavior: starts Socratic (asking questions to draw out ideas), shifts to suggestive when user seems stuck or asks for help
- Everything happens in the textarea — no chat sidebar
- When premise reaches a good place, AI auto-extracts: proposes a scene outline AND drafts character/setting library entries from the conversation
- User reviews, edits, accepts/rejects the generated assets

### AI expansion markers (text-based AI interaction)
- User inserts special markers/placeholders in text to request AI processing
- Different marker types for different operations (e.g., reference a character file, expand a section, provide instructions)
- "Process" button triggers AI to resolve all markers in the document using library context
- Specific marker syntax to be determined during research/planning
- After processing, changes are applied in-place with highlights showing what changed

### Versioning model
- All content version-tracked in SQLite
- Auto-save with chunked change tracking (not per-keystroke, not requiring explicit save — natural chunks)
- Ctrl+S / Cmd+S supported as explicit save
- Version navigation: buttons to go back/forward between versions (not undo/redo — version timeline)
- AI processing always creates an explicit version point (can always revert to pre-expansion state)
- Version history browsable for any document

### AI behavior configuration — markdown files
- AI behavior defined in editable markdown files (agent.md style)
- Global defaults + per-story overrides
- Each story snapshots the AI config files used during creation (even unmodified, for auditability)
- Config files refined at each stage of story development (premise → outline → generation) since context window is small
- Managed through the "AI Config" tab in the left pane

### Library reuse across stories
- Using a library item in a story creates a fork (story-local copy) with reference to original library version
- Story version tracks all changes since forking from library
- If library version updates: notification shown in story view ("newer version available")
- Smart merge: can pull library updates into story version while preserving story-specific changes
- Push back to library: manual (copy/paste) — no automatic sync back
- Quick navigation between story version and library version
- Story-only characters/settings can be promoted to library entries

### Claude's Discretion
- Character relationship implementation (simple list vs. linked pairs)
- Specific marker syntax for AI expansion
- Auto-save debounce timing and change chunking strategy
- Exact tab styling and left-pane list design
- How "promote to library" workflow works in detail
- Search/filter implementation within tabs
- Template file format specifics

</decisions>

<specifics>
## Specific Ideas

- "I generally don't write sci-fi/fantasy — more like slice of life stories, a few characters doing stuff together, maybe a general theme" — this shapes the library design: small collections, relationship-focused, no complex world-building systems needed
- Settings should capture interpersonal context: "coffee shop — where Sam and Alex always meet, comfortable" — emotional association with characters, not just physical description
- The textarea is the primary editing surface for everything — think of it as a power-user text editor that happens to be AI-aware
- Agent.md-style files give the user control over how the entire AI pipeline works — they can tweak prompts, adjust behavior, and see exactly what's driving generation
- The "process" button + marker system is like a preprocessing pass — write naturally, drop in markers, hit process, AI resolves them using library context

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-creative-library-story-setup*
*Context gathered: 2026-02-14*
