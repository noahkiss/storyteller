---
phase: 02-creative-library-story-setup
plan: 04
subsystem: ui
tags: [react, tanstack-query, markdown, regex, outline]

# Dependency graph
requires:
  - phase: 02-02
    provides: Library items (characters, settings) in database
  - phase: 02-03
    provides: Story management and story_items table
provides:
  - Story outline CRUD operations with default template
  - Auto-detection of library item mentions in outline text
  - Reference summary UI with occurrence counts
  - Standalone OutlineEditor component ready for integration
affects: [02-08-integration, 03-context-injection]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Word-boundary regex matching for reference detection
    - 10s stale time on reference queries to debounce recomputation
    - Default outline template with chapter/scene structure

key-files:
  created:
    - src/hooks/use-outlines.ts
    - src/services/references.ts
    - src/components/library/OutlineEditor.tsx
    - src/components/library/OutlineEditor.css
  modified: []

key-decisions:
  - "Filter library items < 3 chars to avoid false positive matches"
  - "Use word-boundary regex (\\b) for name detection, not substring search"
  - "10s stale time on reference detection to prevent excessive recomputation"
  - "Fetch both library_items and story_items for reference detection"

patterns-established:
  - "Reference detection via detectLibraryReferences() utility"
  - "Colored chips for references: blue for characters, green for settings"
  - "Outline editing via textarea with contentId pattern"

# Metrics
duration: 6min
completed: 2026-02-16
---

# Phase 02 Plan 04: Outline Editor with Reference Detection Summary

**Story outline editor with automatic library item detection using word-boundary regex matching**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-16T02:49:44Z
- **Completed:** 2026-02-16T03:00:18Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Outline CRUD operations with SQLite persistence
- Auto-detection of character and setting mentions in outline text
- Reference summary UI showing occurrence counts per library item
- Word-boundary regex matching prevents false positives
- Ready for integration into StoryList (Plan 02-08)

## Task Commits

Each task was committed atomically:

1. **Task 1: Outline CRUD hooks and reference detection service** - `5d58095` (feat)
2. **Task 2: Outline editor UI component** - `afcc25d` (feat)

## Files Created/Modified

- `src/hooks/use-outlines.ts` - TanStack Query hooks for outline CRUD (useOutline, useCreateOutline, useUpdateOutline, useOutlineReferences)
- `src/services/references.ts` - detectLibraryReferences() function with word-boundary regex matching
- `src/components/library/OutlineEditor.tsx` - Outline editor component with reference summary display
- `src/components/library/OutlineEditor.css` - Dark theme styling with colored reference chips

## Decisions Made

1. **Filter short names:** Library items with names < 3 characters excluded from detection to avoid false positives (e.g., "To" matching "Tokyo")
2. **Word boundaries required:** Use `\b{name}\b` regex pattern instead of substring search to prevent "Sam" matching "same"
3. **Stale time debouncing:** useOutlineReferences() has 10s stale time to avoid recomputing on every keystroke
4. **Include forked items:** Reference detection searches both library_items and story_items tables so story-specific forks are detected

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed unused imports in use-ai-configs.ts**
- **Found during:** Task 1 (initial build verification)
- **Issue:** TypeScript build failed due to unused AIConfigFrontmatter and parseMarkdown imports
- **Fix:** Removed unused imports from file
- **Files modified:** src/hooks/use-ai-configs.ts
- **Verification:** Build passes with no errors
- **Committed in:** Part of pre-task cleanup (not in plan scope)

**2. [Rule 3 - Blocking] Fixed type inference in TemplateList.tsx**
- **Found during:** Task 2 (build verification)
- **Issue:** TypeScript error on groupedTemplates[value] - duplicate type annotation confusing inference
- **Fix:** Removed redundant type annotation, kept only the 'as' cast
- **Files modified:** src/components/library/TemplateList.tsx
- **Verification:** Build passes with no errors
- **Committed in:** Part of pre-task cleanup (not in plan scope)

---

**Total deviations:** 2 auto-fixed (blocking build issues)
**Impact on plan:** Both were pre-existing build blockers in unrelated files. Core outline editor implementation followed plan exactly.

## Issues Encountered

None - implementation proceeded as planned. Reference detection regex approach worked well with word boundaries.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Outline CRUD complete and tested
- Reference detection functional with word-boundary accuracy
- OutlineEditor component ready for StoryList integration in Plan 02-08
- SETUP-02 requirement (chapter/scene outline) satisfied

Ready to proceed with Plan 02-05 (AI Config) and Plan 02-06 (Templates), then integrate all library components in Plan 02-08.

## Self-Check: PASSED

All files created and commits verified:
- ✓ src/hooks/use-outlines.ts
- ✓ src/services/references.ts
- ✓ src/components/library/OutlineEditor.tsx
- ✓ src/components/library/OutlineEditor.css
- ✓ Commit 5d58095 (Task 1)
- ✓ Commit afcc25d (Task 2)

---
*Phase: 02-creative-library-story-setup*
*Completed: 2026-02-16*
