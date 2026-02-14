# Phase 3: Generation + Dashboard - Pre-Context

**Written:** 2026-02-14
**Status:** Seed notes from Phase 1+2 decisions — full discussion still needed

These notes capture what's already implied by earlier phase decisions. When `/gsd:discuss-phase 3` runs, skip these and focus on actual gray areas.

## Already Decided (by implication)

### "Dashboard" is the Stories tab
- Left pane Stories tab lists all stories with status and progress
- Not a separate dashboard page — fits the existing split-screen layout
- Click a story → loads it into the textarea

### Generation happens in the textarea
- Text-first: generated content appears in the right-pane textarea
- Scene-by-scene generation appends to the markdown document
- User can edit inline between generation steps (versioned)
- Same textarea component, same version tracking, same auto-save

### Outline drives generation
- Outline is a markdown document (Phase 2) — generation follows its structure
- AI config files (Phase 2) control generation behavior/style
- Relevant library items (characters, settings) auto-inject into context per scene

### Context visualization already spec'd
- Phase 1 builds the always-visible context panel (stacked bar, itemized list, compression log)
- Phase 3 just uses it during active generation — no new visualization needed

### Stop/resume via SQLite persistence
- All state persisted to SQLite (decided Phase 1)
- Resume = reload from summaries + outline position + recent generated text
- Version history preserves every generation step

### Auto-summarize fits version model
- Each generated chunk gets summarized for subsequent context
- Summaries are versioned content like everything else

## Gray Areas for Discussion

These are the things that actually need user input:

### Generation workflow
- How does the user start generation? Select a scene and press go? Or "generate next scene" button?
- Per-scene approval (generate one, review, continue) vs. batch mode (generate multiple scenes, review after)?
- Can the user skip ahead or jump to a specific scene?

### Progress tracking
- What does "progress" mean in the stories list? Percentage of outline completed? Scene count?
- Visual indicator style (progress bar, fraction, status label)?

### Mid-generation control
- How much can the user intervene during generation? Just stop, or also redirect?
- If the user edits generated text mid-story, how does that affect subsequent generation context?

### Story state model
- What states can a story be in? (Draft, In Progress, Paused, Complete?)
- Can a user have multiple stories generating simultaneously, or one at a time?

---

*Phase: 03-generation-dashboard*
*Pre-context from Phase 1+2 decisions: 2026-02-14*
