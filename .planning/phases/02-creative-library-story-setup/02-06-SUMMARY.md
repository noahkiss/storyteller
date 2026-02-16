---
phase: 02-creative-library-story-setup
plan: 06
subsystem: creative-library
tags: [ai-conversation, premise-development, asset-extraction, story-setup]
dependency-graph:
  requires:
    - 02-02-SUMMARY.md # Library item CRUD and markdown parsing
    - 02-03-SUMMARY.md # Story forking and merging
    - 02-04-SUMMARY.md # Outline editor with reference detection
  provides:
    - AI-assisted premise refinement with adaptive conversation
    - Asset extraction from developed premises
    - Character/setting/outline creation from conversation
  affects:
    - Story setup workflow (primary creation entry point)
    - Library population from AI suggestions
tech-stack:
  added:
    - OpenAI SDK streaming for conversation responses
  patterns:
    - State machine for conversation mode transitions
    - Chunked streaming for responsive AI responses
    - Markdown conversation document format
key-files:
  created:
    - src/services/ai-conversation.ts # Conversation state machine
    - src/hooks/use-ai-conversation.ts # React integration hook
    - src/components/story-setup/PremiseWorkspace.tsx # Premise UI component
    - src/components/story-setup/PremiseWorkspace.css # Premise UI styles
  modified: []
decisions:
  - "Conversation state machine with 3 modes: socratic (questioning), suggestive (inspiring), extracting (asset generation)"
  - "Require 2+ stuck signals in last 3 turns to transition socratic → suggestive (avoid premature mode switch)"
  - "Explicit help requests ('give me ideas') trigger immediate mode transition"
  - "Extraction enabled after 4+ turns with 2+ substantive AI responses (>50 chars)"
  - "Asset parsing uses lenient regex - extracts what's possible from AI's structured output"
  - "Conversation happens in textarea as markdown document, not separate chat UI"
  - "Free-form vs Guided mode selector in left pane for different user preferences"
metrics:
  duration: 12min
  tasks: 2
  commits: 2
  files-created: 4
  files-modified: 0
  completed: 2026-02-15
---

# Phase 2 Plan 6: AI Conversation & Premise Development Summary

**One-liner:** Adaptive AI conversation system with Socratic questioning, suggestive guidance, and structured asset extraction from premise discussions.

## What Was Built

### Conversation State Machine (`ai-conversation.ts`)

State machine managing premise development conversation flow:

- **Modes:**
  - **Socratic:** Asks clarifying questions about characters, motivations, relationships, settings
  - **Suggestive:** Offers 2-3 concrete ideas when user shows stuck signals
  - **Extracting:** Generates structured output (characters, settings, outline)

- **Stuck Signal Detection:**
  - Patterns: "I don't know", "not sure", "help", "stuck", "give me ideas"
  - Requires 2+ signals in last 3 turns to auto-switch modes (avoids premature transition)
  - Explicit help requests trigger immediate suggestive mode

- **Extraction Criteria:**
  - Turn count >= 4
  - At least 2 substantive AI responses (>50 chars each)
  - Shows "Extract Assets" button when criteria met

- **Asset Parsing:**
  - Lenient regex-based extraction from AI's structured output
  - Parses CHARACTERS, SETTINGS, OUTLINE sections
  - Returns null if nothing extracted (graceful failure)

### AI Conversation Hook (`use-ai-conversation.ts`)

React integration hook connecting state machine to LLM:

- **Streaming Integration:**
  - Uses OpenAI SDK with chunk buffering (~50 chars)
  - Streams responses directly to textarea via onChunk callback
  - Lower temperature (0.3) for extraction mode for structured output

- **Asset Acceptance:**
  - `acceptCharacter(index, storyId)` - creates library character with markdown frontmatter
  - `acceptSetting(index, storyId)` - creates library setting
  - `acceptOutline(storyId)` - creates or updates story outline from plot points

- **State Management:**
  - Conversation history tracked in state
  - Mode transitions based on user input patterns
  - Extracted assets stored until accepted or dismissed

### Premise Workspace Component (`PremiseWorkspace.tsx`)

Left-pane UI for premise development:

- **Mode Selector:**
  - Free-form: User types premise directly
  - Guided: AI starts with structured questions

- **Conversation Controls:**
  - Textarea input for user responses
  - Send button (Ctrl+Enter shortcut)
  - "Start Guided Conversation" button for first interaction
  - Loading states during AI generation

- **Asset Extraction:**
  - "Extract Assets" button visible when canExtract is true
  - Extraction results displayed in cards below
  - Accept buttons for each character/setting
  - Accept button for full outline

- **Workflow Transition:**
  - "Move to Outlining" button transitions story status from 'setup' to 'outlining'

- **Styling:**
  - Dark theme consistent with library cards
  - Compact layout for left pane
  - Color-coded sections (blue for headers, green for accept buttons, amber for transition)

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] `npm run build` succeeds
- [x] Conversation state machine transitions correctly: socratic → suggestive after stuck signals
- [x] Mode-specific prompts generated appropriately
- [x] Premise workspace renders with mode selector and send button
- [x] Extraction results show parsed characters/settings/outline
- [x] Asset extraction parsing handles structured AI output
- [x] SETUP-01 (premise refinement) requirement satisfied
- [x] SETUP-03 (collaborative building) requirement satisfied

## Integration Points

**Upstream Dependencies:**
- Library item hooks (`use-library-items.ts`) for creating characters/settings
- Outline hooks (`use-outlines.ts`) for creating/updating outlines
- Story hooks (`use-stories.ts`) for updating story status
- LLM client (`llm-client.ts`) for OpenAI SDK integration
- Settings store for LLM connection parameters

**Downstream Consumers:**
- App.tsx will integrate PremiseWorkspace into story setup flow (Plan 02-08)
- Generated library items feed into reference detection (Plan 02-04)
- Outline structure supports chapter/scene editing (Plan 02-04)

## Files Changed

### Created

- `src/services/ai-conversation.ts` (248 lines)
  - ConversationState interface and factory
  - Mode transition logic with stuck signal detection
  - Prompt generation for each mode
  - shouldExtract criteria check
  - parseExtractedAssets with lenient regex

- `src/hooks/use-ai-conversation.ts` (338 lines)
  - useAIConversation hook with full state management
  - sendMessage with streaming integration
  - extractAssets with lower temperature
  - acceptCharacter/acceptSetting/acceptOutline mutations
  - reset and setMode utilities

- `src/components/story-setup/PremiseWorkspace.tsx` (267 lines)
  - Mode selector (free-form vs guided)
  - Conversation input and send button
  - Start guided conversation flow
  - Asset extraction UI with accept buttons
  - Move to outlining transition

- `src/components/story-setup/PremiseWorkspace.css` (255 lines)
  - Dark theme styling
  - Mode selector button states
  - Conversation input and controls
  - Asset card layouts
  - Extraction results display

## Commits

1. **b583ec0** - `feat(02-06): add conversation state machine for premise development`
   - Adaptive mode transitions (socratic → suggestive → extracting)
   - Stuck signal detection with 2+ signals in 3 turns threshold
   - Mode-specific prompt generation
   - Asset extraction parsing (characters, settings, outline)

2. **4d82f79** - `feat(02-06): add AI conversation hook and premise workspace UI`
   - useAIConversation hook integrates state machine with LLM streaming
   - PremiseWorkspace component provides left-pane conversation controls
   - Free-form vs Guided mode selection
   - Asset extraction UI with accept buttons for characters/settings/outline
   - Move to Outlining transition button

## Self-Check: PASSED

All files created and commits verified:
- ✓ src/services/ai-conversation.ts
- ✓ src/hooks/use-ai-conversation.ts
- ✓ src/components/story-setup/PremiseWorkspace.tsx
- ✓ src/components/story-setup/PremiseWorkspace.css
- ✓ Commit b583ec0 (conversation state machine)
- ✓ Commit 4d82f79 (conversation hook and UI)
