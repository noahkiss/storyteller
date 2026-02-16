---
phase: 02-creative-library-story-setup
plan: 07
subsystem: ai-markers
tags: [codemirror, llm-integration, marker-processing, ui]

dependency_graph:
  requires:
    - "02-01 (markdown utilities, library items)"
    - "02-02 (story items)"
  provides:
    - "Marker highlighting extension for CodeMirror"
    - "Marker processing service (library lookups + LLM generation)"
    - "MarkerControls UI component"
  affects:
    - "EnhancedTextarea (can integrate marker highlighting)"
    - "Story editing workflow (markers enable AI-assisted expansion)"

tech_stack:
  added:
    - "@codemirror/state (StateField for decorations)"
    - "@codemirror/view (Decoration API, EditorView.baseTheme)"
  patterns:
    - "Incremental decoration updates (change tracking)"
    - "Reverse-order marker processing (preserve positions)"
    - "Preview-before-apply pattern (version points around changes)"

key_files:
  created:
    - "src/extensions/codemirror/marker-highlighting.ts"
    - "src/services/marker-processor.ts"
    - "src/components/markers/MarkerControls.tsx"
    - "src/components/markers/MarkerControls.css"
  modified: []

decisions:
  - slug: "incremental-decorations"
    summary: "Use incremental decoration updates instead of full-document reparse on each keystroke"
    rationale: "Performance — full reparse on every change causes lag in large documents. Change tracking + range-limited updates keep highlighting responsive."
    alternatives: "Full reparse on every transaction (simpler but slow)"

  - slug: "reverse-order-processing"
    summary: "Process markers in reverse order (end to start)"
    rationale: "Preserve marker positions as content changes. If we process forward, replacements shift subsequent marker positions, requiring constant recalculation."
    alternatives: "Forward processing with position updates (complex, error-prone)"

  - slug: "preview-before-apply"
    summary: "Show preview of all marker changes before applying"
    rationale: "LLM-generated content is unpredictable. Users need to review before accepting. Prevents unwanted replacements."
    alternatives: "Immediate application with undo (harder to review bulk changes)"

  - slug: "version-points-around-processing"
    summary: "Create version points before and after marker processing, not per-marker"
    rationale: "Reduces version bloat (one processing operation = two versions, not N*2). User can still revert entire processing operation."
    alternatives: "Version per marker (excessive version count for bulk processing)"

metrics:
  duration_minutes: 12
  completed_date: "2026-02-16"
  task_count: 2
  file_count: 4
  commit_count: 2
---

# Phase 02 Plan 07: AI Expansion Marker System Summary

**One-liner:** CodeMirror syntax highlighting for {{type:value}} markers + LLM-powered processing that resolves references and generates content expansions

## What Was Built

### 1. Marker Highlighting Extension (`marker-highlighting.ts`)

CodeMirror StateField-based extension that highlights AI expansion markers in the editor:

- **Marker syntax:** `{{type:value}}` where type is `character | setting | expand | ref | instruct`
- **Type-specific colors:**
  - Character (blue) — reference a character profile
  - Setting (green) — reference a setting
  - Expand (amber) — expand/elaborate this section
  - Ref (purple) — generic reference
  - Instruct (red-orange) — instruction to the AI
- **Incremental updates:** Uses change tracking to only update decorations in changed ranges, not full-document reparse on every keystroke
- **Performance:** Line-boundary expansion ensures correct marker detection at edit boundaries

**Key implementation details:**
- `findAllMarkers(doc)` — initial scan on editor creation
- `findMarkersInRange(doc, from, to)` — incremental updates for changed ranges
- `iterChangedRanges` — detect which parts of the document changed
- Map existing decorations through changes → only recompute affected ranges

### 2. Marker Processor Service (`marker-processor.ts`)

Resolves markers to actual content using library lookups and LLM generation:

**Marker resolution logic:**
- `character:Name` → lookup in library_items (type=character), replace with full markdown profile
- `setting:Name` → lookup in library_items (type=setting)
- `ref:Name` → generic lookup (any type)
- `expand:description` → call LLM with prompt + surrounding context (100 chars before/after)
- `instruct:instruction` → call LLM with instruction + surrounding context (200 chars before/after)

**Processing order:** Reverse (end to start) to preserve positions as replacements change document length.

**Version handling:** Caller is responsible for creating version points (not the processor). This prevents per-marker version bloat — one processing operation = two versions (before/after), not N*2.

**Error handling:** Failed LLM calls or missing library items return placeholder text: `[Character not found: Name]` or `[Expand failed: error]`

### 3. MarkerControls Component

UI for marker detection, processing, and insertion:

**Features:**
- **Marker count display** — "3 markers detected" (live update as user types)
- **Process button** — triggers marker processing with preview modal
- **Preview mode** — shows marker → replacement pairs before applying
- **Insert marker dropdown** — quick-insert buttons for all marker types
- **Version points** — creates manual version before processing, generation version after

**UX flow:**
1. User clicks "Process"
2. Component calls `processAllMarkers` (shows "Processing..." state)
3. Preview modal displays all changes
4. User clicks "Accept" → creates pre-processing version point → applies changes → creates post-processing version point
5. Or "Cancel" → discards preview, no changes applied

**Styling:** Dark theme, compact bar, primary-styled process button, amber marker text, expandable insert menu

## Deviations from Plan

None — plan executed exactly as written.

## Integration Notes

**Not yet integrated into EnhancedTextarea:**
- The `markerHighlighting` extension is created but not added to EnhancedTextarea's CodeMirror extensions array
- MarkerControls is created but not rendered in any parent component
- Plan 02-08 (integration plan) will wire these together

**Library item queries:**
- MarkerControls fetches all library_items and story_items (5s poll interval)
- This is the same pattern used in OutlineEditor for reference detection
- Story items are fetched but not used yet (prepared for future enhancement where forked items can be referenced)

**LLM generation:**
- Uses non-streaming `client.chat.completions.create` with `stream: false`
- This is simpler than the streaming approach used in GenerationOutput
- For marker processing, streaming is unnecessary — user waits for preview anyway

## Self-Check

### File Verification
✓ src/extensions/codemirror/marker-highlighting.ts exists
✓ src/services/marker-processor.ts exists
✓ src/components/markers/MarkerControls.tsx exists
✓ src/components/markers/MarkerControls.css exists

### Commit Verification
✓ Commit 9154e18 (Task 1 — marker highlighting extension)
✓ Commit b1a6348 (Task 2 — marker processor and controls)

### Build Verification
✓ `npm run build` passes with no errors

**Self-Check: PASSED**

## Next Steps

Plan 02-08 will:
1. Integrate `markerHighlighting` into EnhancedTextarea's CodeMirror extensions
2. Render MarkerControls in the right-pane header (below VersionNav, above editor)
3. Update App.tsx tab routing to include all Phase 2 tabs
4. Wire EnhancedTextarea's value updates to MarkerControls' `onContentUpdate` callback
5. Complete Phase 2 with full end-to-end story setup workflow
