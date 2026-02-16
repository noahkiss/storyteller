---
phase: 02-creative-library-story-setup
plan: 01
subsystem: database-types-markdown
tags: [foundation, schema, types, dependencies]
completed_date: 2026-02-16

dependency_graph:
  requires: [01-foundation-context-engine]
  provides: [library_schema, story_schema, markdown_service]
  affects: [all Phase 2 plans]

tech_stack:
  added:
    - gray-matter (4.0.3)
    - node-diff3 (3.2.0)
    - unified (11.0.5)
    - remark-parse (11.0.0)
    - remark-frontmatter (5.0.0)
    - remark-gfm (4.0.1)
    - unist-util-visit (5.1.0)
    - mdast-util-to-string (4.0.0)
  patterns:
    - SQLite schema extension with Phase 2 tables
    - YAML frontmatter in markdown content model
    - Template seeding on database initialization

key_files:
  created:
    - src/services/markdown.ts
  modified:
    - src/services/db.ts
    - src/types/index.ts
    - package.json

decisions:
  - Use gray-matter for frontmatter parsing (CommonJS module with ESM interop)
  - Seed default templates and AI config on first database init (like presets)
  - Store markdown content with frontmatter as single TEXT column in database
  - Use TEXT PRIMARY KEY for all new Phase 2 tables (UUID-style IDs)
  - Add base_content column to story_items for 3-way merge support

metrics:
  duration_minutes: 3
  tasks_completed: 2
  files_modified: 3
  files_created: 1
  commits: 2
---

# Phase 02 Plan 01: Foundation for Phase 2 — Database, Types, and Markdown Service

**One-liner:** Extended database schema with library/story tables, comprehensive TypeScript types, and markdown frontmatter parsing service for text-first content model.

## Objective

Establish foundational infrastructure for Phase 2: database tables for library items, stories, outlines, and AI configs; complete TypeScript type definitions; and markdown service for YAML frontmatter parsing. All subsequent Phase 2 plans depend on these pieces.

## Tasks Completed

### Task 1: Install Phase 2 dependencies and extend database schema
**Commit:** b2caf49
**Files:** package.json, package-lock.json, src/services/db.ts

Installed markdown processing dependencies:
- gray-matter (frontmatter parsing)
- node-diff3 (3-way merge for conflict resolution)
- unified ecosystem (remark-parse, remark-frontmatter, remark-gfm)
- AST utilities (unist-util-visit, mdast-util-to-string)

Extended database schema with 6 new tables:
- **library_items** — characters, settings, themes with version tracking
- **stories** — story projects with premise, status, AI config reference
- **story_items** — forked library items per story with local changes tracking
- **outlines** — one outline per story (markdown document)
- **ai_configs** — global and per-story AI behavior definitions
- **templates** — default templates for library items and configs

Seeded default content:
- Character template with frontmatter (name, role, category, traits, relationships, etc.)
- Setting template with frontmatter (name, type, atmosphere, sensory details)
- Global AI config with default writing style guidance

Added indexes for all foreign key relationships for query performance.

### Task 2: Define TypeScript types and create markdown service
**Commit:** f9dc566
**Files:** src/types/index.ts, src/services/markdown.ts

Created comprehensive type definitions:
- **Library types**: LibraryItem, LibraryItemType, CharacterCategory
- **Story types**: Story, StoryItem, StoryStatus
- **Outline types**: Outline, Scene
- **Config types**: AIConfig, Template, TemplateType
- **Frontmatter types**: CharacterFrontmatter, SettingFrontmatter, AIConfigFrontmatter
- **Marker types**: AIMarker, MarkerType (for AI expansion markers)
- **Utility types**: MergeResult, LibraryReference

Created markdown service with utilities:
- `parseMarkdown<T>()` — extract frontmatter data and content body
- `stringifyMarkdown()` — serialize frontmatter and content back to markdown
- `extractName()` — convenience function to get name from frontmatter
- `updateFrontmatterField()` — update single field without touching content
- `detectMarkers()` — find AI expansion markers ({{type:value}})
- `replaceMarker()` — replace marker with expanded content
- `escapeRegex()` — utility for safe regex construction

## Verification Results

All success criteria met:
- ✅ `npm run build` completes with zero TypeScript errors
- ✅ All dependencies installed and resolvable
- ✅ Database schema includes all Phase 2 tables with proper foreign keys
- ✅ Default templates and AI config seeded on initialization
- ✅ TypeScript types importable from `@/types`
- ✅ Markdown service exports work (verified via successful build)

## Deviations from Plan

None — plan executed exactly as written.

## Impact

**Immediate:**
- Phase 2 plans can now import types, query new tables, and parse markdown content
- Database automatically seeds default templates and AI config on first run
- Full type safety for all Phase 2 entities

**Next Steps:**
- Plan 02-02: Build Library UI for creating/editing characters and settings
- Plan 02-03: Build Story UI for story setup and library item forking
- All subsequent plans have type definitions and database schema ready

## Self-Check

Verifying all claimed files exist and commits are in git history:

- ✅ FOUND: src/services/markdown.ts
- ✅ FOUND: src/services/db.ts (modified)
- ✅ FOUND: src/types/index.ts (modified)
- ✅ FOUND: package.json (modified)
- ✅ FOUND: commit b2caf49
- ✅ FOUND: commit f9dc566

## Self-Check: PASSED
