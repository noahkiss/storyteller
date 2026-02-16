---
phase: 02-creative-library-story-setup
plan: 02
subsystem: library-ui
tags: [ui, library, characters, settings, crud]
completed_date: 2026-02-15

dependency_graph:
  requires: [02-01]
  provides: [library_ui, character_management, setting_management]
  affects: [02-03, 02-04, 02-05]

tech_stack:
  added: []
  patterns:
    - Zustand ephemeral state for active library item tracking
    - TanStack Query hooks for CRUD operations with SQLite
    - Shared LibraryItemCard component for list rendering
    - Search/filter pattern for library item lists
    - Auto-save on edit via mutation hooks
    - Tab-based navigation with textarea integration

key_files:
  created:
    - src/stores/library-store.ts
    - src/hooks/use-library-items.ts
    - src/components/library/LibraryItemCard.tsx
    - src/components/library/LibraryItemCard.css
    - src/components/library/CharacterList.tsx
    - src/components/library/CharacterList.css
    - src/components/library/SettingList.tsx
    - src/components/library/SettingList.css
  modified:
    - src/App.tsx

decisions:
  - Library store uses plain Zustand (no persist) for ephemeral active item state
  - TanStack Query polling interval: 5 seconds for list sync
  - Search filter is local (client-side) - no debouncing needed for small lists
  - Delete requires confirmation via native confirm() dialog
  - Active item state shared between list and textarea via library-store
  - Tab labels: "Characters", "Settings" (library), "App Settings" (app config)
  - Empty state messaging encourages user to create first item

metrics:
  duration_minutes: 8
  tasks_completed: 2
  files_modified: 9
  files_created: 8
  commits: 2
---

# Phase 02 Plan 02: Character and Setting Library UI

**One-liner:** Full library management UI with Characters and Settings tabs, CRUD operations, search/filter, and seamless textarea integration for editing markdown content.

## Objective

Build the character and setting library: Zustand store, CRUD hooks, and tab UI for creating, listing, and editing library items. Users click "New Character" or "New Setting" to create from template, items appear in left pane lists, clicking loads markdown into the textarea for editing.

## Tasks Completed

### Task 1: Library store and CRUD hooks
**Commit:** d0136a3
**Files:** src/stores/library-store.ts, src/hooks/use-library-items.ts

Created library-store.ts with Zustand:
- `activeItemId` and `activeItemType` track currently selected library item
- `setActiveItem(id, type)` updates selection
- No persistence - ephemeral UI state like ui-store

Created use-library-items.ts with TanStack Query hooks:
- **useLibraryItems(type)**: Query hook fetching all items of given type, polls every 5s
- **useLibraryItem(id)**: Query hook for single item, disabled when id is null
- **useCreateLibraryItem()**: Mutation that fetches template, creates item with UUID, extracts name/category/tags from frontmatter
- **useUpdateLibraryItem()**: Mutation that updates content, re-extracts metadata, increments version
- **useDeleteLibraryItem()**: Mutation that removes item and invalidates queries

All hooks use SQLite via `getDatabase()` from db service. Frontmatter parsing via `extractName()` and `parseMarkdown()` from markdown service.

### Task 2: Characters and Settings tab UI with list components
**Commit:** 345f94f
**Files:** src/components/library/*, src/App.tsx

Created **LibraryItemCard.tsx** - reusable card component:
- Displays item name, category badge, and tag chips
- Click handler selects item and loads into textarea
- Active state styling when selected (blue border highlight)
- Delete button with confirmation dialog
- Dark theme matching existing components

Created **CharacterList.tsx**:
- "New Character" button creates from template and auto-selects
- Search filter for name-based filtering (local, no debounce)
- Shows loading state while fetching
- Empty state message when no characters exist
- Maps items to LibraryItemCard components

Created **SettingList.tsx**:
- Same structure as CharacterList but for type='setting'
- "New Setting" button
- Identical patterns and styling

Modified **App.tsx**:
- Added "Characters" and "Settings" tabs to tab array
- Modified RightPaneContent to show active library item in textarea when selected
- When activeTab is 'characters' or 'settings-library' and item is selected: shows EnhancedTextarea with item content
- When no item selected: shows placeholder message
- Connected textarea onEdit callback to useUpdateLibraryItem mutation
- contentId format: `library-{item.id}` for version tracking

## Verification Results

All success criteria met:
- ✅ `npm run build` succeeds with zero TypeScript errors
- ✅ Characters tab shows "New Character" button and lists existing characters
- ✅ Settings tab shows "New Setting" button and lists existing settings
- ✅ Creating a character populates template content with YAML frontmatter
- ✅ Clicking a character/setting loads its markdown into the right pane textarea
- ✅ Editing in textarea triggers auto-save via useUpdateLibraryItem
- ✅ Changes persist to SQLite (verified via query hooks)
- ✅ Delete removes items from list with confirmation
- ✅ Active item highlighting works correctly
- ✅ Search filter works for both character and setting lists

## Deviations from Plan

None - plan executed exactly as written.

## Impact

**Immediate:**
- Users can create, edit, and delete character profiles and setting entries
- Full CRUD operations working with SQLite persistence
- Text-first markdown editing model established (everything in the textarea)
- Tab navigation pattern extended for library management

**Next Steps:**
- Plan 02-03: Story creation UI with library item forking
- Plan 02-04: Outline editor with library item references
- All subsequent plans can now reference and use library items

## Self-Check

Verifying all claimed files exist and commits are in git history:

- ✅ FOUND: src/stores/library-store.ts
- ✅ FOUND: src/hooks/use-library-items.ts
- ✅ FOUND: src/components/library/LibraryItemCard.tsx
- ✅ FOUND: src/components/library/LibraryItemCard.css
- ✅ FOUND: src/components/library/CharacterList.tsx
- ✅ FOUND: src/components/library/CharacterList.css
- ✅ FOUND: src/components/library/SettingList.tsx
- ✅ FOUND: src/components/library/SettingList.css
- ✅ FOUND: src/App.tsx (modified)
- ✅ FOUND: commit d0136a3
- ✅ FOUND: commit 345f94f

## Self-Check: PASSED
