---
phase: 02-creative-library-story-setup
plan: 03
subsystem: story-management
tags: [stories, forking, three-way-merge, copy-on-write]
dependency_graph:
  requires:
    - 02-01 (database schema for stories and story_items)
  provides:
    - Story CRUD operations via TanStack Query
    - Fork-on-use system for library items
    - Three-way merge service for library updates
    - Story list UI component
  affects:
    - Will be integrated into App.tsx tabs in Plan 02-08
tech_stack:
  added:
    - node-diff3 (three-way merge algorithm)
    - uuid (story ID generation)
  patterns:
    - Copy-on-write forking with base_content tracking
    - Three-way merge with git-style conflict markers
    - TanStack Query mutations for data operations
key_files:
  created:
    - src/services/merge.ts (three-way merge using node-diff3)
    - src/stores/story-store.ts (Zustand store for active story)
    - src/hooks/use-stories.ts (story CRUD hooks)
    - src/hooks/use-forked-content.ts (fork and merge hooks)
    - src/components/library/StoryList.tsx (story list UI)
    - src/components/library/StoryList.css (story list styles)
  modified:
    - src/types/index.ts (added base_content to StoryItem)
    - package.json (added uuid and node-diff3)
decisions:
  - Use node-diff3 for three-way merge over custom implementation
  - Store base_content in story_items for merge (already in schema from 02-01)
  - Log warning when conflict rate exceeds 50%
  - Always fetch characters and settings for fork menu (simpler than conditional)
  - Use useLibraryItem for individual item lookups in ForkedItemCard
  - Defer App.tsx tab integration to Plan 02-08 to avoid conflicts with 02-02
metrics:
  duration_minutes: 9
  tasks_completed: 2
  files_created: 6
  files_modified: 2
  commits: 2
  completed_at: 2026-02-16T02:47:01Z
---

# Phase 02 Plan 03: Story Management with Fork-on-Use Summary

**One-liner:** Story CRUD with copy-on-write forking and three-way merge for library item reuse across stories

## Objective

Built story management with the copy-on-write forking system for library reuse. Users can create stories, add library items (which creates story-local forks), and merge library updates using three-way merge. Satisfies LIB-03 requirement for reusing library items across stories with per-story modifications.

## Implementation

### Task 1: Story Store, CRUD Hooks, and Merge Service

Created the data layer for story management:

**Merge Service** (`src/services/merge.ts`):
- Three-way merge using node-diff3's `diff3Merge` function
- Normalizes line endings before merge (\r\n → \n)
- Counts conflict chunks and builds merged content with git-style markers
- Returns `{ success, content, conflictCount }`
- Logs warning when conflict rate > 50%

**Story Store** (`src/stores/story-store.ts`):
- Plain Zustand store (no persistence)
- Tracks `activeStoryId` for current story selection

**Story CRUD Hooks** (`src/hooks/use-stories.ts`):
1. `useStories()` — queries all stories ordered by updated_at DESC, polls every 5s
2. `useStory(id)` — queries single story by ID, disabled when null
3. `useCreateStory()` — creates story with UUID, title, status='setup', timestamps
4. `useUpdateStory()` — updates title/premise/status/ai_config_id with dynamic query building
5. `useDeleteStory()` — deletes story and cascades to story_items, outlines, ai_configs

**Fork Management Hooks** (`src/hooks/use-forked-content.ts`):
1. `useStoryItems(storyId)` — queries story_items for a story, polls every 5s
2. `useForkLibraryItem()` — copies library item to story_items with base_content for merge
3. `useCheckForUpdates(storyId)` — detects when library version > forked_from_version, polls every 30s
4. `useMergeLibraryUpdate()` — three-way merge using storyItem.content (ours), base_content (ancestor), libraryItem.content (theirs)

**Type Updates**:
- Added `base_content?: string` to `StoryItem` interface for three-way merge support

**Dependencies**:
- Installed `uuid` and `@types/uuid` for story ID generation
- Installed `node-diff3` for three-way merge

**Commit:** `0321598`

### Task 2: Stories Tab UI with List and Fork Management

Created StoryList component with story management and fork UI:

**Features**:
- Story creation with inline text input (not modal)
- Story list showing title, status badge, created date
- Expandable story cards revealing forked items
- Fork menu with two-step selection: type (character/setting) → specific item
- Update badges when library items have newer versions
- Modified badges on forked items with local changes
- Delete story with confirmation

**Styling**:
- Dark theme matching existing CharacterList/SettingList components
- Status badges with color coding (setup=yellow, outlining=blue, writing=purple, complete=green)
- Nested UI for forked items within expanded stories
- Hover states and active selection highlighting

**Integration**:
- Component exported as standalone, ready for App.tsx tab wiring in Plan 02-08
- Uses all story hooks and fork hooks from Task 1
- Queries library items for fork menu population

**Commit:** `a2e4740`

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- Build passes (`npm run build`)
- Three-way merge service handles clean merges and conflicts correctly
- Story CRUD operations persist to SQLite
- Forking creates story_items with base_content for merge
- Update detection identifies stale forks
- StoryList component renders with dark theme styling

## Success Criteria Met

- Story management with fork-on-use system operational ✓
- Three-way merge handles library updates with conflict detection ✓
- LIB-03 requirement satisfied at data layer ✓
- UI ready for integration in Plan 02-08 ✓

## Next Steps

Plan 02-08 will integrate StoryList into App.tsx tabs alongside CharacterList and SettingList from Plan 02-02.

## Self-Check: PASSED

**Files created:**
- src/services/merge.ts: FOUND
- src/stores/story-store.ts: FOUND
- src/hooks/use-stories.ts: FOUND
- src/hooks/use-forked-content.ts: FOUND
- src/components/library/StoryList.tsx: FOUND
- src/components/library/StoryList.css: FOUND

**Commits:**
- 0321598: FOUND (Task 1 - story store, CRUD hooks, merge service)
- a2e4740: FOUND (Task 2 - StoryList component)
