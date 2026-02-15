# Phase 2: Creative Library + Story Setup - Research

**Researched:** 2026-02-14
**Domain:** Markdown-driven creative asset management with AI-assisted story development
**Confidence:** HIGH

## Summary

Phase 2 builds on the foundation from Phase 1 to create a text-first creative library system and AI-assisted story setup workflow. The phase centers on the principle that **everything is a markdown document** loaded into the reusable textarea component. Character profiles, setting descriptions, story outlines, and AI configuration files are all editable markdown with YAML frontmatter for structured metadata. The existing textarea component with version tracking becomes the universal editing surface for all content types.

The technical implementation leverages the existing stack (React, TypeScript, CodeMirror, SQLite WASM) and extends it with markdown processing capabilities (gray-matter for YAML frontmatter parsing, custom CodeMirror decorations for AI markers), conversational AI patterns (adaptive Socratic-to-suggestive dialogue), and forking/versioning strategies for library reuse across stories. The research identifies proven patterns for custom markdown syntax (unified/remark plugin ecosystem), three-way merging (node-diff3 for smart library updates), and template-based content management (YAML frontmatter + freeform markdown sections).

**Primary recommendation:** Use gray-matter for frontmatter parsing, CodeMirror decorations for marker syntax highlighting, custom unified/remark plugins for AI marker processing, and a copy-on-write forking model with three-way merge support (node-diff3) for library item reuse across stories.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Core interaction model — text-first, markdown-driven:**
- Everything is a markdown document loaded into a reusable textarea for editing
- Characters, settings, outlines, AI config — all are markdown files that load into the textarea, get edited as text, and save back
- No drag-and-drop or specialized form UIs — text editing IS the interface
- Desktop-first web app for power users
- This principle applies to ALL phases, not just Phase 2

**Application layout:**
- Split-screen: left pane for navigation/lists, right pane is always the reusable textarea
- Tabs in the left pane change what's listed: **Stories | Characters | Settings | Templates | AI Config**
- Click an item in the left pane → loads its markdown into the textarea
- Single textarea component with enhanced features (syntax highlighting for markers, version navigation, etc.)
- "Settings" tab = story settings/locations (not app settings — those are separate)

**Character profiles — hybrid structured + freeform:**
- Key structured fields: name, role, traits, key relationships, character arc notes, physical appearance, speech patterns/voice, backstory summary
- Plus freeform markdown notes section for everything else
- Predefined categories: POV Character, Named Character, Background Character (narrative-based)
- Free-form tags for flexible filtering
- Profiles are editable markdown templates — same textarea workflow
- Default character template is editable; users can create custom templates

**Setting/location profiles — mirrors character model:**
- Structured fields: name, type (city/building/landscape/etc.), atmosphere/mood, sensory details
- Relationship to characters: which characters frequent this location, emotional associations (e.g., "coffee shop — where Sam and Alex always meet, comfortable")
- Plus freeform markdown notes section
- Same categories + tags system as characters
- Same template-based editing

**Outline structure — flexible hierarchy:**
- Scenes are the core unit; chapters are optional grouping (some stories are a few hours, some span days)
- Each scene contains: summary, characters present, setting, mood/emotional tone
- Outlines are just text documents in the textarea — user cuts, pastes, reorders as plain text
- No specialized drag-and-drop or insert-between UI — text editing handles reordering
- Scenes link to library items: auto-detected from text mentions + manual add/remove

**AI premise refinement:**
- Two modes: free-form premise input OR guided walkthrough — user chooses
- Adaptive AI behavior: starts Socratic (asking questions to draw out ideas), shifts to suggestive when user seems stuck or asks for help
- Everything happens in the textarea — no chat sidebar
- When premise reaches a good place, AI auto-extracts: proposes a scene outline AND drafts character/setting library entries from the conversation
- User reviews, edits, accepts/rejects the generated assets

**AI expansion markers (text-based AI interaction):**
- User inserts special markers/placeholders in text to request AI processing
- Different marker types for different operations (e.g., reference a character file, expand a section, provide instructions)
- "Process" button triggers AI to resolve all markers in the document using library context
- Specific marker syntax to be determined during research/planning
- After processing, changes are applied in-place with highlights showing what changed

**Versioning model:**
- All content version-tracked in SQLite
- Auto-save with chunked change tracking (not per-keystroke, not requiring explicit save — natural chunks)
- Ctrl+S / Cmd+S supported as explicit save
- Version navigation: buttons to go back/forward between versions (not undo/redo — version timeline)
- AI processing always creates an explicit version point (can always revert to pre-expansion state)
- Version history browsable for any document

**AI behavior configuration — markdown files:**
- AI behavior defined in editable markdown files (agent.md style)
- Global defaults + per-story overrides
- Each story snapshots the AI config files used during creation (even unmodified, for auditability)
- Config files refined at each stage of story development (premise → outline → generation) since context window is small
- Managed through the "AI Config" tab in the left pane

**Library reuse across stories:**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gray-matter | 4.x | YAML frontmatter parsing | Battle-tested, used by Gatsby/Astro/etc., parses YAML/JSON/TOML frontmatter with stringify support |
| node-diff3 | 3.x | Three-way text merging | Active maintenance, implements proper 3-way merge for library updates, similar to git merge |
| @codemirror/view | 6.x | Custom decorations | Official CodeMirror package for syntax highlighting custom markers |
| @codemirror/state | 6.x | State management for decorations | Official CodeMirror state handling for marker extensions |
| unified | 11.x | Markdown processing pipeline | Industry standard for markdown transformation, extensible plugin ecosystem |
| remark-parse | 11.x | Markdown → AST parsing | Official remark parser for converting markdown to mdast (syntax tree) |
| remark-frontmatter | 5.x | Frontmatter support in remark | Extracts frontmatter blocks from markdown for processing |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-markdown | 9.x | Markdown preview rendering | Display formatted markdown in context visualization or preview modes |
| remark-gfm | 4.x | GitHub Flavored Markdown | Tables, task lists, strikethrough for richer markdown support |
| unist-util-visit | 5.x | AST traversal | Walking syntax trees to find/transform nodes in custom remark plugins |
| mdast-util-to-string | 4.x | Extract plain text from AST | Converting markdown nodes to searchable text for auto-detection |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| gray-matter | front-matter | gray-matter has broader format support (YAML/JSON/TOML) and stringify capability |
| node-diff3 | three-way-merge | node-diff3 has more active maintenance and better TypeScript support |
| unified/remark | marked with custom renderer | unified ecosystem is more extensible for custom syntax, remark has larger plugin ecosystem |
| CodeMirror decorations | Custom CSS classes | Decorations are first-class CodeMirror API, more performant than DOM manipulation |

**Installation:**
```bash
# Already installed from Phase 1:
# @codemirror/view, @codemirror/state, react-markdown

# New for Phase 2:
npm install gray-matter node-diff3
npm install unified remark-parse remark-frontmatter remark-gfm
npm install unist-util-visit mdast-util-to-string
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── textarea/           # Existing: EnhancedTextarea, VersionNav
│   ├── tabs/               # Existing: TabSystem
│   ├── library/            # NEW: Library item lists
│   │   ├── CharacterList.tsx
│   │   ├── SettingList.tsx
│   │   ├── LibraryItemCard.tsx
│   │   └── TemplateSelector.tsx
│   ├── story-setup/        # NEW: AI-assisted story setup
│   │   ├── PremiseWorkspace.tsx
│   │   ├── OutlineEditor.tsx
│   │   └── AIConversation.tsx
│   └── markers/            # NEW: AI marker processing UI
│       ├── MarkerProcessor.tsx
│       └── MarkerHighlight.tsx
├── stores/
│   ├── library-store.ts    # NEW: Library items (characters, settings)
│   ├── story-store.ts      # NEW: Stories and their forked items
│   └── template-store.ts   # NEW: User-defined templates
├── services/
│   ├── markdown.ts         # NEW: Frontmatter parsing, markdown processing
│   ├── markers.ts          # NEW: Marker detection and processing
│   ├── merge.ts            # NEW: Three-way merge for library updates
│   └── ai-conversation.ts  # NEW: Adaptive conversation state machine
├── hooks/
│   ├── use-library-items.ts    # NEW: CRUD for library items
│   ├── use-forked-content.ts   # NEW: Fork tracking and merging
│   └── use-ai-conversation.ts  # NEW: Socratic → suggestive flow
└── extensions/
    └── codemirror/         # NEW: CodeMirror extensions
        └── marker-highlighting.ts  # Custom decorations for markers
```

### Pattern 1: YAML Frontmatter + Markdown Template

**What:** Structured metadata (YAML) + freeform content (markdown) in single file
**When to use:** Character profiles, setting descriptions, any template-based content
**Example:**

```typescript
// Source: gray-matter npm package
import matter from 'gray-matter';

interface CharacterFrontmatter {
  name: string;
  role: string;
  category: 'POV' | 'Named' | 'Background';
  tags: string[];
  traits: string[];
  relationships: string[];
  appearance: string;
  voice: string;
  backstory: string;
  arc_notes: string;
}

// Character template markdown with frontmatter
const characterTemplate = `---
name: ""
role: ""
category: Named
tags: []
traits: []
relationships: []
appearance: ""
voice: ""
backstory: ""
arc_notes: ""
---

# Character Notes

(Additional freeform notes here)
`;

// Parse template
const parsed = matter(characterTemplate);
const frontmatter = parsed.data as CharacterFrontmatter;
const content = parsed.content; // Markdown content after frontmatter

// Modify and stringify back
const updated = matter.stringify(content, {
  ...frontmatter,
  name: 'Alex Chen',
  role: 'Protagonist',
  traits: ['curious', 'determined']
});

// Result: markdown string with updated frontmatter ready to save
```

### Pattern 2: CodeMirror Custom Marker Decorations

**What:** Syntax highlighting for AI expansion markers in markdown
**When to use:** Enhance textarea to visually distinguish special syntax
**Example:**

```typescript
// Source: CodeMirror documentation (https://codemirror.net/docs/ref)
import { EditorView, Decoration, DecorationSet } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

// Define marker syntax patterns (Claude's discretion on exact syntax)
// Examples: {{character:name}}, {{expand:summary}}, {{ref:setting}}
const MARKER_REGEX = /\{\{([\w-]+):([\w\s-]+)\}\}/g;

// Create decoration for markers
const markerDecoration = Decoration.mark({
  class: 'cm-marker',
  attributes: { 'data-marker-type': 'ai-expansion' }
});

// StateField to manage marker decorations
const markerField = StateField.define<DecorationSet>({
  create(state) {
    return findMarkers(state.doc);
  },
  update(decorations, tr) {
    if (tr.docChanged) {
      return findMarkers(tr.state.doc);
    }
    return decorations.map(tr.changes);
  },
  provide: f => EditorView.decorations.from(f)
});

function findMarkers(doc: any): DecorationSet {
  const decorations = [];
  const text = doc.toString();
  let match;

  while ((match = MARKER_REGEX.exec(text)) !== null) {
    const from = match.index;
    const to = from + match[0].length;
    decorations.push(markerDecoration.range(from, to));
  }

  return Decoration.set(decorations);
}

// Add to CodeMirror extensions
const markerExtension = [markerField];
```

### Pattern 3: Three-Way Merge for Library Updates

**What:** Merge library updates into story-forked content while preserving story changes
**When to use:** When user wants to pull library updates into a story's forked character/setting
**Example:**

```typescript
// Source: node-diff3 npm package
import { diff3Merge } from 'node-diff3';

interface LibraryItem {
  id: string;
  content: string; // Full markdown including frontmatter
  version: number;
}

interface ForkedItem {
  library_id: string;
  forked_from_version: number;
  content: string; // Modified markdown
  story_id: string;
}

async function mergeLibraryUpdate(
  forked: ForkedItem,
  libraryOriginal: LibraryItem, // Version forked from
  libraryUpdated: LibraryItem    // Latest library version
): Promise<{ merged: string; conflicts: boolean }> {
  const result = diff3Merge(
    forked.content.split('\n'),          // Current story version (ours)
    libraryOriginal.content.split('\n'), // Common ancestor (base)
    libraryUpdated.content.split('\n')   // Library update (theirs)
  );

  const hasConflicts = result.some(chunk => chunk.conflict);

  // Build merged text
  const merged = result.map(chunk => {
    if (chunk.conflict) {
      // Show conflict markers (like git)
      return [
        '<<<<<<< Story Version',
        ...chunk.a,
        '=======',
        ...chunk.b,
        '>>>>>>> Library Version'
      ].join('\n');
    }
    return chunk.ok?.join('\n') || '';
  }).join('\n');

  return { merged, conflicts: hasConflicts };
}
```

### Pattern 4: Adaptive AI Conversation State Machine

**What:** Transition between Socratic questioning and suggestive generation based on user signals
**When to use:** AI premise refinement and outline development
**Example:**

```typescript
// Source: Conversational AI design patterns research
type ConversationMode = 'socratic' | 'suggestive' | 'extracting';

interface ConversationState {
  mode: ConversationMode;
  questionCount: number;
  userStuckSignals: number; // "I don't know", empty responses, etc.
  clarityScore: number; // 0-1, how clear the premise is
  extractedData: {
    characters: string[];
    settings: string[];
    plotPoints: string[];
  };
}

function selectConversationMode(state: ConversationState): ConversationMode {
  // User explicitly asks for help or is stuck
  if (state.userStuckSignals >= 2) {
    return 'suggestive';
  }

  // Premise is clear enough, extract data
  if (state.clarityScore > 0.75 && state.extractedData.characters.length > 0) {
    return 'extracting';
  }

  // Default: keep asking questions to draw out ideas
  return 'socratic';
}

function generatePrompt(state: ConversationState, userInput: string): string {
  switch (state.mode) {
    case 'socratic':
      return `Based on the user's premise: "${userInput}"
Ask a clarifying question to help them develop their story idea.
Focus on character motivations, conflict, or setting details.
Be concise and encouraging.`;

    case 'suggestive':
      return `The user seems stuck. Based on their premise: "${userInput}"
Suggest 2-3 specific ideas they could explore.
Frame suggestions as possibilities, not prescriptions.`;

    case 'extracting':
      return `Based on the full conversation, extract:
1. Character names and roles
2. Setting/location descriptions
3. Key plot points or scenes
Format as a structured outline with brief summaries.`;
  }
}
```

### Pattern 5: Auto-Detection of Library Item References

**What:** Parse outline text to detect mentions of library items (characters, settings)
**When to use:** Link scenes to library items automatically, suggest missing entries
**Example:**

```typescript
// Source: mdast-util-to-string + custom matching logic
import { toString } from 'mdast-util-to-string';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

interface LibraryReference {
  type: 'character' | 'setting';
  id: string;
  name: string;
  position: { start: number; end: number };
}

async function detectLibraryReferences(
  outlineText: string,
  characters: Array<{ id: string; name: string }>,
  settings: Array<{ id: string; name: string }>
): Promise<LibraryReference[]> {
  const references: LibraryReference[] = [];

  // Build regex from library item names (case-insensitive, whole word)
  const characterNames = characters.map(c => c.name);
  const settingNames = settings.map(s => s.name);

  // Parse markdown to AST
  const tree = unified()
    .use(remarkParse)
    .parse(outlineText);

  // Visit all text nodes
  visit(tree, 'text', (node: any) => {
    const text = node.value;

    // Check for character mentions
    characterNames.forEach(name => {
      const regex = new RegExp(`\\b${name}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        const char = characters.find(c => c.name === name);
        if (char) {
          references.push({
            type: 'character',
            id: char.id,
            name: char.name,
            position: { start: match.index, end: match.index + name.length }
          });
        }
      }
    });

    // Check for setting mentions
    settingNames.forEach(name => {
      const regex = new RegExp(`\\b${name}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        const setting = settings.find(s => s.name === name);
        if (setting) {
          references.push({
            type: 'setting',
            id: setting.id,
            name: setting.name,
            position: { start: match.index, end: match.index + name.length }
          });
        }
      }
    });
  });

  return references;
}
```

### Pattern 6: Copy-on-Write Forking for Library Items

**What:** Create story-local copy of library item with reference to original
**When to use:** When adding a library character/setting to a story
**Example:**

```typescript
// Source: Copy-on-write pattern + SQLite schema design
interface LibraryItem {
  id: string;
  type: 'character' | 'setting';
  content: string;
  version: number;
  created_at: number;
  updated_at: number;
}

interface ForkedItem {
  id: string;
  story_id: string;
  library_id: string;
  forked_from_version: number;
  content: string; // Story-specific copy
  has_local_changes: boolean;
  created_at: number;
  updated_at: number;
}

async function forkLibraryItem(
  libraryItem: LibraryItem,
  storyId: string,
  db: any
): Promise<ForkedItem> {
  // Create copy with reference
  const forked: ForkedItem = {
    id: crypto.randomUUID(),
    story_id: storyId,
    library_id: libraryItem.id,
    forked_from_version: libraryItem.version,
    content: libraryItem.content, // Copy content
    has_local_changes: false,
    created_at: Date.now(),
    updated_at: Date.now()
  };

  await db.exec(`
    INSERT INTO forked_items (
      id, story_id, library_id, forked_from_version,
      content, has_local_changes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    forked.id, forked.story_id, forked.library_id,
    forked.forked_from_version, forked.content,
    forked.has_local_changes ? 1 : 0,
    forked.created_at, forked.updated_at
  ]);

  return forked;
}

async function checkForUpdates(
  forked: ForkedItem,
  db: any
): Promise<{ hasUpdate: boolean; latestVersion?: LibraryItem }> {
  const latest = await db.exec(`
    SELECT * FROM library_items
    WHERE id = ?
    ORDER BY version DESC
    LIMIT 1
  `, [forked.library_id]);

  if (latest && latest.version > forked.forked_from_version) {
    return { hasUpdate: true, latestVersion: latest };
  }

  return { hasUpdate: false };
}
```

### Pattern 7: Custom Remark Plugin for Marker Processing

**What:** Unified/remark plugin to find and transform AI markers in markdown AST
**When to use:** "Process" button to resolve markers using LLM
**Example:**

```typescript
// Source: unified plugin creation patterns (https://github.com/unifiedjs/unified)
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

interface MarkerNode {
  type: 'marker';
  markerType: string; // 'character', 'expand', 'ref'
  value: string;
  position: any;
}

// Plugin to detect markers in text nodes
export const remarkDetectMarkers: Plugin<[], Root> = function () {
  return (tree) => {
    visit(tree, 'text', (node: any, index, parent) => {
      const text = node.value;
      const MARKER_REGEX = /\{\{([\w-]+):([\w\s-]+)\}\}/g;

      const markers: Array<{ type: string; value: string; index: number; length: number }> = [];
      let match;

      while ((match = MARKER_REGEX.exec(text)) !== null) {
        markers.push({
          type: match[1],
          value: match[2],
          index: match.index,
          length: match[0].length
        });
      }

      // If markers found, split text node into text + marker + text segments
      if (markers.length > 0 && parent && index !== null) {
        const newNodes = [];
        let lastIndex = 0;

        markers.forEach(marker => {
          // Text before marker
          if (marker.index > lastIndex) {
            newNodes.push({
              type: 'text',
              value: text.slice(lastIndex, marker.index)
            });
          }

          // Marker node (custom type)
          newNodes.push({
            type: 'marker',
            markerType: marker.type,
            value: marker.value,
            data: {
              hName: 'span',
              hProperties: {
                className: 'ai-marker',
                'data-marker-type': marker.type
              }
            }
          });

          lastIndex = marker.index + marker.length;
        });

        // Remaining text
        if (lastIndex < text.length) {
          newNodes.push({
            type: 'text',
            value: text.slice(lastIndex)
          });
        }

        parent.children.splice(index, 1, ...newNodes);
      }
    });
  };
};

// Process markers by replacing with LLM-generated content
export async function processMarkers(
  markdown: string,
  libraryContext: { characters: any[]; settings: any[] },
  llmClient: any
): Promise<string> {
  const tree = unified()
    .use(remarkParse)
    .use(remarkDetectMarkers)
    .parse(markdown);

  // Find all marker nodes
  const markers: MarkerNode[] = [];
  visit(tree, 'marker', (node: any) => {
    markers.push(node);
  });

  // Process each marker with LLM
  for (const marker of markers) {
    let replacement = '';

    switch (marker.markerType) {
      case 'character':
        // Look up character from library
        const char = libraryContext.characters.find(c =>
          c.name.toLowerCase() === marker.value.toLowerCase()
        );
        replacement = char ? char.content : `[Character not found: ${marker.value}]`;
        break;

      case 'expand':
        // Ask LLM to expand section
        replacement = await llmClient.generate(`Expand this section: ${marker.value}`);
        break;

      case 'ref':
        // Reference a setting
        const setting = libraryContext.settings.find(s =>
          s.name.toLowerCase() === marker.value.toLowerCase()
        );
        replacement = setting ? setting.content : `[Setting not found: ${marker.value}]`;
        break;
    }

    // Replace marker in tree with generated text
    // (Implementation would modify tree nodes)
  }

  // Stringify tree back to markdown
  return unified()
    .use(remarkStringify)
    .stringify(tree);
}
```

### Anti-Patterns to Avoid

- **Storing frontmatter and content separately:** Keep markdown as single string, parse on read/write — don't split into separate DB columns
- **Global state for all library items:** Use TanStack Query for lazy loading and caching individual items
- **Processing entire outline on every edit:** Debounce auto-detection, only re-process changed sections
- **Synchronous three-way merge in UI thread:** Run merge operations in web worker or async to avoid blocking
- **Hard-coded marker syntax in multiple places:** Define marker patterns in single source of truth, use constants

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML parsing | Custom regex for frontmatter | gray-matter | Handles edge cases (escaped characters, nested objects, multiple formats), battle-tested |
| Three-way merge | Custom diff algorithm | node-diff3 | Proven algorithm, handles conflict markers correctly, same approach as git |
| Markdown AST traversal | String manipulation, regex | unified + unist-util-visit | Proper syntax tree handling, extensible, supports complex transformations |
| Text similarity matching | Substring search | mdast-util-to-string + fuzzy matching library | Handles markdown syntax correctly, more accurate matching |
| Conversation state management | Ad-hoc conditionals | State machine pattern | Clear transitions, testable, easier to debug adaptive behavior |
| Frontmatter validation | Manual checks | Schema validation library (e.g., zod) | Type-safe, comprehensive error messages, reusable schemas |

**Key insight:** Markdown processing has subtle edge cases (nested structures, escaping, frontmatter formats). Use proven libraries rather than regex-based parsing. Three-way merging is deceptively complex — conflict resolution, whitespace handling, and performance matter.

## Common Pitfalls

### Pitfall 1: Frontmatter Delimiter Confusion

**What goes wrong:** gray-matter fails to parse frontmatter, content appears in metadata section
**Why it happens:** YAML frontmatter requires exactly three dashes (`---`) as delimiters, no spaces, on their own lines
**How to avoid:** Validate template format, use gray-matter's `stringify` for all writes
**Warning signs:** Parsed frontmatter is empty object, content includes `---` lines

**Solution:**
```typescript
// WRONG: Spaces in delimiter, inline content
const bad = `--- title: "Story"
Content here`;

// CORRECT: Clean delimiters, newlines
const good = `---
title: "Story"
---

Content here`;

// Always use gray-matter to write
import matter from 'gray-matter';
const output = matter.stringify(content, frontmatter); // Ensures correct format
```

**Sources:**
- [gray-matter npm](https://www.npmjs.com/package/gray-matter)
- [YAML Front Matter - Assemble](https://assemble.io/docs/YAML-front-matter.html)

### Pitfall 2: CodeMirror Decoration Performance with Many Markers

**What goes wrong:** Editor becomes sluggish when document has dozens of markers
**Why it happens:** Recreating all decorations on every keystroke is expensive
**How to avoid:** Use incremental updates, only recompute changed ranges
**Warning signs:** Typing lag, high CPU usage when editing marker-heavy documents

**Solution:**
```typescript
// WRONG: Recreate all decorations on every change
update(decorations, tr) {
  if (tr.docChanged) {
    return findAllMarkers(tr.state.doc); // Expensive!
  }
  return decorations.map(tr.changes);
}

// CORRECT: Only update changed ranges
update(decorations, tr) {
  if (tr.docChanged) {
    let deco = decorations.map(tr.changes);
    // Only recompute for changed ranges
    tr.changes.iterChangedRanges((fromA, toA, fromB, toB) => {
      deco = deco.update({
        filterFrom: fromB,
        filterTo: toB,
        filter: () => false // Remove old decorations in range
      });
      deco = deco.update({
        add: findMarkersInRange(tr.state.doc, fromB, toB)
      });
    });
    return deco;
  }
  return decorations.map(tr.changes);
}
```

**Sources:**
- [CodeMirror Documentation - Decorations](https://codemirror.net/docs/ref/#view.Decoration)

### Pitfall 3: Three-Way Merge Conflict Explosion

**What goes wrong:** Merge produces conflict markers on nearly every line, unusable result
**Why it happens:** Base version is too old (many changes in both library and story), or line ending differences
**How to avoid:** Track smaller version increments, normalize line endings before merge
**Warning signs:** Merge result is 80%+ conflict markers

**Solution:**
```typescript
// Normalize line endings before merge
function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

async function safeThreeWayMerge(
  ours: string,
  base: string,
  theirs: string
): Promise<{ merged: string; conflicts: boolean; conflictCount: number }> {
  // Normalize inputs
  const oursNorm = normalizeLineEndings(ours).split('\n');
  const baseNorm = normalizeLineEndings(base).split('\n');
  const theirsNorm = normalizeLineEndings(theirs).split('\n');

  const result = diff3Merge(oursNorm, baseNorm, theirsNorm);

  const conflictChunks = result.filter(c => c.conflict);
  const conflictCount = conflictChunks.length;

  // If too many conflicts, offer alternative strategies
  if (conflictCount > result.length * 0.5) {
    console.warn('High conflict rate - consider manual merge or version reset');
    // Could offer: "Too many conflicts. Reset to library version?" option
  }

  const merged = result.map(chunk => {
    if (chunk.conflict) {
      return [
        '<<<<<<< Story Version',
        ...chunk.a,
        '=======',
        ...chunk.b,
        '>>>>>>> Library Version'
      ].join('\n');
    }
    return chunk.ok?.join('\n') || '';
  }).join('\n');

  return { merged, conflicts: conflictChunks.length > 0, conflictCount };
}
```

**Sources:**
- [node-diff3 npm](https://www.npmjs.com/package/node-diff3)
- [Three-Way Merge - Revision Control](https://tonyg.github.io/revctrl.org/ThreeWayMerge.html)

### Pitfall 4: Auto-Detection False Positives

**What goes wrong:** Common words trigger library item detection (e.g., character named "Sam" matches "same")
**Why it happens:** Simple substring or regex matching without word boundaries
**How to avoid:** Use word boundary regex (`\b`), case-sensitive exact matching, minimum length threshold
**Warning signs:** Dozens of spurious references, every occurrence of "the" matches character "Theo"

**Solution:**
```typescript
// WRONG: Substring match
if (text.includes(characterName)) { /* ... */ }

// CORRECT: Word boundary, case-sensitive
const regex = new RegExp(`\\b${escapeRegex(characterName)}\\b`, 'g'); // Exact case
const matches = Array.from(text.matchAll(regex));

// Better: Require minimum name length (avoid single-letter names)
const MIN_NAME_LENGTH = 3;
const validNames = characters.filter(c => c.name.length >= MIN_NAME_LENGTH);

// Best: Weighted scoring with position, frequency, capitalization
function scoreReference(text: string, name: string): number {
  const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'g');
  const matches = Array.from(text.matchAll(regex));

  if (matches.length === 0) return 0;

  let score = matches.length; // Base frequency score

  // Bonus for capitalized usage (likely proper noun)
  const capitalizedMatches = matches.filter(m =>
    m[0][0] === m[0][0].toUpperCase()
  );
  score += capitalizedMatches.length * 2;

  return score;
}
```

**Sources:**
- [Markdown Link Detection Research](https://www.markdownguide.org/basic-syntax/)

### Pitfall 5: Socratic → Suggestive Transition Too Aggressive

**What goes wrong:** AI switches to suggestive mode after first "I don't know", user loses agency
**Why it happens:** Overly sensitive detection of "stuck" signals
**How to avoid:** Require multiple signals over multiple turns, offer explicit "help me" option
**Warning signs:** Users complain AI is "pushy", takes over conversation too quickly

**Solution:**
```typescript
// WRONG: Switch on first signal
if (userInput.includes("I don't know")) {
  mode = 'suggestive';
}

// CORRECT: Track signals over conversation, require threshold
interface ConversationState {
  mode: 'socratic' | 'suggestive';
  turnCount: number;
  stuckSignals: Array<{ turn: number; signal: string }>;
}

function updateConversationMode(
  state: ConversationState,
  userInput: string,
  turnNumber: number
): ConversationState {
  // Detect stuck signals
  const stuckPhrases = [
    /i don't know/i,
    /not sure/i,
    /stuck/i,
    /help/i
  ];

  const hasStuckSignal = stuckPhrases.some(regex => regex.test(userInput));

  if (hasStuckSignal) {
    state.stuckSignals.push({ turn: turnNumber, signal: userInput });
  }

  // Only switch if: 2+ signals in last 3 turns
  const recentSignals = state.stuckSignals.filter(s =>
    turnNumber - s.turn <= 3
  );

  if (recentSignals.length >= 2 && state.mode === 'socratic') {
    state.mode = 'suggestive';
  }

  // Allow user to explicitly request help at any time
  if (/give me (some )?ideas/i.test(userInput)) {
    state.mode = 'suggestive';
  }

  return state;
}
```

**Sources:**
- [Conversational AI Design in 2026](https://botpress.com/blog/conversation-design)
- [Adaptive AI Conversation UX Trends](https://bitskingdom.com/blog/ux-trends-2026-ai-zero-ui-adaptive-design/)

### Pitfall 6: Version Bloat from AI Processing

**What goes wrong:** Every marker resolution creates a version, version history explodes to hundreds of entries
**Why it happens:** Each "Process" button click saves a version, even for tiny changes
**How to avoid:** Batch marker processing into single version, offer "Preview" mode before committing
**Warning signs:** Version list has 50+ entries for single outline, most are nearly identical

**Solution:**
```typescript
// Add preview mode before committing AI changes
interface MarkerProcessingResult {
  original: string;
  processed: string;
  markersResolved: number;
  changesPreview: Array<{ marker: string; replacement: string }>;
}

async function processMarkersWithPreview(
  content: string,
  libraryContext: any
): Promise<MarkerProcessingResult> {
  // Process but don't save yet
  const result = await processMarkers(content, libraryContext);

  return {
    original: content,
    processed: result.text,
    markersResolved: result.resolvedCount,
    changesPreview: result.changes
  };
}

// UI shows diff view, user confirms before creating version
function MarkerProcessingUI() {
  const [preview, setPreview] = useState<MarkerProcessingResult | null>(null);

  const handleProcess = async () => {
    const result = await processMarkersWithPreview(content, libraryContext);
    setPreview(result); // Show preview, don't save yet
  };

  const handleAccept = async () => {
    if (preview) {
      // Single version point for all marker resolutions
      await saveManualVersion(preview.processed, 'AI marker processing');
      setContent(preview.processed);
      setPreview(null);
    }
  };

  const handleReject = () => {
    setPreview(null); // Discard, no version created
  };

  // UI renders preview diff + Accept/Reject buttons
}
```

## Code Examples

Verified patterns from official sources:

### Parse and Modify Character Template

```typescript
// Source: gray-matter npm package
import matter from 'gray-matter';

const characterTemplate = `---
name: "Alex Chen"
role: "Protagonist"
category: POV
tags: ["student", "curious"]
traits: ["determined", "empathetic"]
relationships: ["best friend: Jordan", "mentor: Dr. Kim"]
appearance: "Short dark hair, round glasses, often wearing hoodies"
voice: "Quick speaker, uses technical jargon, nervous laugh"
backstory: "Grew up in suburban Seattle, lost mother at age 12"
arc_notes: "Learn to trust others, overcome fear of abandonment"
---

# Alex's Character Notes

## Key Motivation
Wants to prove themselves worthy of their scholarship despite imposter syndrome.

## Habits
- Always carries a notebook
- Drinks too much coffee
- Taps pen when thinking
`;

// Parse template
const { data: frontmatter, content } = matter(characterTemplate);

// Modify data
frontmatter.tags.push('ambitious');
frontmatter.traits.push('overthinking');

// Stringify back to markdown
const updated = matter.stringify(content, frontmatter);

// Result ready to save to database
console.log(updated);
```

**Source:** [gray-matter npm](https://www.npmjs.com/package/gray-matter)

### Detect Library Item Mentions in Outline

```typescript
// Source: mdast-util-to-string + custom logic
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

interface LibraryItem {
  id: string;
  name: string;
  type: 'character' | 'setting';
}

function detectReferences(
  outlineMarkdown: string,
  libraryItems: LibraryItem[]
): Array<{ item: LibraryItem; occurrences: number }> {
  const tree = unified().use(remarkParse).parse(outlineMarkdown);

  const mentions = new Map<string, number>();

  visit(tree, 'text', (node: any) => {
    const text = node.value;

    libraryItems.forEach(item => {
      // Word boundary match, case-insensitive
      const regex = new RegExp(`\\b${escapeRegex(item.name)}\\b`, 'gi');
      const matches = text.match(regex);

      if (matches) {
        const current = mentions.get(item.id) || 0;
        mentions.set(item.id, current + matches.length);
      }
    });
  });

  // Return items with occurrences
  return Array.from(mentions.entries())
    .map(([id, count]) => ({
      item: libraryItems.find(i => i.id === id)!,
      occurrences: count
    }))
    .filter(r => r.item !== undefined);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

**Source:** [unist-util-visit npm](https://www.npmjs.com/package/unist-util-visit)

### Three-Way Merge with Conflict Handling

```typescript
// Source: node-diff3 npm package
import { diff3Merge } from 'node-diff3';

interface MergeResult {
  success: boolean;
  content: string;
  conflictCount: number;
  conflictSections: Array<{ ours: string; theirs: string }>;
}

function mergeLibraryUpdate(
  storyVersion: string,
  libraryBase: string,
  libraryUpdate: string
): MergeResult {
  const result = diff3Merge(
    storyVersion.split('\n'),
    libraryBase.split('\n'),
    libraryUpdate.split('\n')
  );

  const conflicts: Array<{ ours: string; theirs: string }> = [];
  const lines: string[] = [];

  result.forEach(chunk => {
    if (chunk.conflict) {
      conflicts.push({
        ours: chunk.a.join('\n'),
        theirs: chunk.b.join('\n')
      });

      // Add conflict markers
      lines.push('<<<<<<< Story Version');
      lines.push(...chunk.a);
      lines.push('=======');
      lines.push(...chunk.b);
      lines.push('>>>>>>> Library Update');
    } else if (chunk.ok) {
      lines.push(...chunk.ok);
    }
  });

  return {
    success: conflicts.length === 0,
    content: lines.join('\n'),
    conflictCount: conflicts.length,
    conflictSections: conflicts
  };
}

// Usage in UI
async function handleMergeLibraryUpdate(forkedItem: ForkedItem) {
  const libraryBase = await fetchLibraryVersion(forkedItem.library_id, forkedItem.forked_from_version);
  const libraryLatest = await fetchLatestLibraryVersion(forkedItem.library_id);

  const result = mergeLibraryUpdate(
    forkedItem.content,
    libraryBase.content,
    libraryLatest.content
  );

  if (result.success) {
    // Auto-merge succeeded
    await updateForkedItem(forkedItem.id, result.content);
    toast.success('Library update merged successfully');
  } else {
    // Show conflict resolution UI
    showConflictEditor({
      content: result.content,
      conflicts: result.conflictSections,
      onResolve: (resolved) => updateForkedItem(forkedItem.id, resolved)
    });
  }
}
```

**Source:** [node-diff3 npm](https://www.npmjs.com/package/node-diff3)

### Custom Remark Plugin for AI Markers

```typescript
// Source: unified plugin patterns
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text } from 'mdast';

// Define marker syntax: {{type:value}}
// Examples: {{character:Alex}}, {{expand:this scene}}, {{setting:coffee shop}}

export const remarkAIMarkers: Plugin<[], Root> = function () {
  return (tree) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === null) return;

      const text = node.value;
      const MARKER_REGEX = /\{\{(\w+):([^}]+)\}\}/g;

      const segments: Array<{ type: 'text' | 'marker'; value: string; markerType?: string }> = [];
      let lastIndex = 0;
      let match;

      while ((match = MARKER_REGEX.exec(text)) !== null) {
        // Text before marker
        if (match.index > lastIndex) {
          segments.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }

        // Marker
        segments.push({
          type: 'marker',
          value: match[2].trim(),
          markerType: match[1]
        });

        lastIndex = match.index + match[0].length;
      }

      // Remaining text
      if (lastIndex < text.length) {
        segments.push({
          type: 'text',
          value: text.slice(lastIndex)
        });
      }

      // Replace text node with segments
      if (segments.length > 1) {
        const newNodes = segments.map(seg => {
          if (seg.type === 'text') {
            return { type: 'text', value: seg.value };
          } else {
            // Custom marker node (preserved in AST for processing)
            return {
              type: 'aiMarker',
              markerType: seg.markerType,
              value: seg.value,
              data: {
                hName: 'span',
                hProperties: {
                  className: `ai-marker ai-marker--${seg.markerType}`,
                  'data-marker-type': seg.markerType,
                  'data-marker-value': seg.value
                }
              }
            };
          }
        });

        parent.children.splice(index, 1, ...newNodes as any);
      }
    });
  };
};
```

**Source:** [unified GitHub](https://github.com/unifiedjs/unified/blob/main/readme.md)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate form fields for character data | YAML frontmatter + markdown | 2020-2024 (Obsidian, Notion popularized) | Unified editing experience, version control friendly |
| Chat sidebar for AI | In-textarea conversation | 2025+ (context-aware AI) | Reduces context switching, keeps writing flow |
| Manual link management | Auto-detection + suggestions | 2023+ (graph-based notes) | Faster linking, discovers connections |
| Hard-coded templates | User-editable templates | 2022+ (no-code movement) | Flexibility without code changes |
| Two-way diff only | Three-way merge with base | Git (2005), now standard | Proper merge conflict detection |
| Regex-based markdown parsing | AST-based (unified/remark) | 2016+ (unified ecosystem) | Correct handling of nested structures |
| Fixed conversation flow | Adaptive based on user signals | 2025+ (conversational AI maturity) | Natural interaction, less frustration |

**Deprecated/outdated:**
- **marked library for markdown processing:** Use unified/remark for extensibility (marked has limited plugin ecosystem)
- **Manual conflict resolution only:** Offer three-way merge with automatic resolution where possible
- **Static templates:** Support user-editable templates (gray-matter makes this trivial)
- **String-based diff:** Use line-based or word-based diff for better merge quality

## Open Questions

1. **Exact marker syntax**
   - What we know: Double braces common (`{{type:value}}`), extensible pattern
   - What's unclear: Should support nested markers? Multi-line markers? Escaped braces?
   - Recommendation: Start simple (`{{type:value}}` single-line only), extend based on user needs

2. **Character relationship structure**
   - What we know: Need to track relationships between characters
   - What's unclear: Simple list of strings vs. structured data with relationship type/strength?
   - Recommendation: Start with freeform list (`["best friend: Jordan", "rival: Sam"]`), can parse later if needed

3. **Conflict resolution UI patterns**
   - What we know: Need to show conflicts from three-way merge
   - What's unclear: Side-by-side diff? Inline markers? Line-by-line review?
   - Recommendation: Inline conflict markers (like git) with syntax highlighting, side-by-side view for complex conflicts

4. **Library item promotion workflow**
   - What we know: Story-only items can become library entries
   - What's unclear: One-click promote vs. review-and-edit step? Keep story version after promotion?
   - Recommendation: Review-and-edit (may want to generalize before adding to library), keep story version as fork

5. **Outline format flexibility**
   - What we know: Plain text editing, scenes as core unit
   - What's unclear: Enforce any structure (headings, bullets)? Or totally freeform?
   - Recommendation: Suggest markdown heading structure (## Chapter, ### Scene) but don't enforce

## Sources

### Primary (HIGH confidence)

- Context7: /remarkjs/react-markdown - Custom component mapping and markdown rendering
- Context7: /unifiedjs/unified - Plugin creation patterns and AST transformation
- Context7: /websites/codemirror_net - Custom decorations and marker highlighting
- [gray-matter npm](https://www.npmjs.com/package/gray-matter) - YAML frontmatter parsing and stringification
- [node-diff3 npm](https://www.npmjs.com/package/node-diff3) - Three-way merge algorithm
- [unist-util-visit npm](https://www.npmjs.com/package/unist-util-visit) - AST traversal utilities

### Secondary (MEDIUM confidence)

- [Conversational AI Design in 2026](https://botpress.com/blog/conversation-design) - Adaptive conversation patterns
- [UX Trends 2026: Adaptive Design](https://bitskingdom.com/blog/ux-trends-2026-ai-zero-ui-adaptive-design/) - Anticipatory UX and adaptive interfaces
- [Remark/Rehype Plugin Ecosystem](https://github.com/remarkjs/remark) - Markdown processing architecture
- [Extended Markdown Syntax](https://www.markdownguide.org/extended-syntax/) - Custom syntax patterns
- [YAML Frontmatter Guide](https://assemble.io/docs/YAML-front-matter.html) - Frontmatter conventions
- [three-way-merge npm](https://www.npmjs.com/package/three-way-merge) - Alternative merge library comparison

### Tertiary (LOW confidence)

- Web search results for character relationship graphs (general patterns, needs validation for specific implementation)
- Web search results for template-based content management (broad ecosystem overview)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries have official docs, active maintenance, proven in production (Gatsby, Astro, etc.)
- Markdown processing: HIGH - unified/remark is industry standard, Context7 docs verified
- Three-way merge: HIGH - node-diff3 implements standard algorithm, same approach as git
- AI conversation patterns: MEDIUM - Research-based but implementation needs testing with users
- Marker syntax: MEDIUM - No single standard, custom implementation needed
- Library forking UX: MEDIUM - Pattern proven (git, Notion) but needs adaptation to this use case

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - standard stack is stable, AI patterns evolving faster)

---

*Phase: 02-creative-library-story-setup*
*Research completed: 2026-02-14*
