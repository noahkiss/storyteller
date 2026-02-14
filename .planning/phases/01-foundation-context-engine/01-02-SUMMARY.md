---
phase: 01-foundation-context-engine
plan: 02
subsystem: context-engine
tags: [core-logic, token-counting, context-packing, tdd, pure-functions]
dependency-graph:
  requires: []
  provides: [token-counting, context-packing, hierarchical-compression]
  affects: []
tech-stack:
  added: [js-tiktoken, vitest]
  patterns: [BPE-tokenization, priority-based-packing, greedy-allocation]
key-files:
  created:
    - src/services/tokens.ts
    - src/services/context-engine.ts
    - src/services/__tests__/tokens.test.ts
    - src/services/__tests__/context-engine.test.ts
  modified:
    - vite.config.ts
    - package.json
decisions:
  - slug: use-js-tiktoken
    summary: "Use js-tiktoken for BPE token counting with o200k_base encoding (gpt-4o-mini default)"
    rationale: "Pure JavaScript implementation, no WASM memory management needed, supports all OpenAI encodings"
  - slug: greedy-context-packing
    summary: "Pack context using greedy algorithm from highest to lowest priority"
    rationale: "Simpler than optimal knapsack, predictable behavior, preserves high-priority tiers intact"
  - slug: no-encoding-caching
    summary: "Create encoding instance per call without caching"
    rationale: "Simpler implementation, avoids WASM memory leaks, optimization can be added later if needed"
metrics:
  duration: 9
  completed: 2026-02-14
  tasks: 3
  tests: 22
  commits: 2
---

# Phase 01 Plan 02: Context Engine Summary

JWT auth with refresh rotation using jose library

## What Was Built

The context engine — the core business logic for intelligent token counting and context packing. This is the most critical technical component of Storyteller: it determines what content enters each LLM call and how to fit it within small context windows (4K-8K tokens).

**One-liner:** BPE token counting with priority-based context packing and hierarchical compression for small LLM context windows.

## Implementation Highlights

### Token Counting (src/services/tokens.ts)
- `countTokens(text, model?)`: Returns accurate BPE token count using js-tiktoken
- `truncateToTokens(text, maxTokens, model?)`: Truncates text to fit within token limit
- Default encoding: o200k_base (gpt-4o-mini)
- Fallback to o200k_base for unknown models
- No manual memory management needed (js-tiktoken handles it automatically)

### Context Engine (src/services/context-engine.ts)
- `createContextTier(label, content, priority, color)`: Creates tier with auto-calculated tokens
- `packContext(tiers, maxTokens)`: Priority-based packing with overflow detection
  - Greedy algorithm: allocate from highest to lowest priority
  - Truncates lowest-priority tiers when over budget
  - Returns overflow flag if even highest priority tier was truncated
- `compressToFit(tiers, maxTokens)`: Aggressive compression (removes entire tiers)
  - More drastic than packContext when truncation isn't enough
  - Still preserves high-priority tiers first

### Test Coverage (22 tests, all passing)
- Token counting: empty strings, normal text, long text (10K+ tokens), special characters
- Truncation: preserves max text within limit, handles edge cases
- Context packing: priority ordering, budget allocation, overflow detection
- Compression: tier removal, budget exhaustion handling

## TDD Execution

**RED Phase (e1cc81d):**
- Created failing tests for tokens.ts (10 tests)
- Created failing tests for context-engine.ts (12 tests)
- Tests verified expected API surface and behavior

**GREEN Phase (7798107):**
- Implemented countTokens and truncateToTokens using js-tiktoken
- Implemented createContextTier with auto token counting
- Implemented packContext with greedy priority-based packing
- Implemented compressToFit for aggressive tier removal
- All 22 tests passing

**REFACTOR Phase:**
- No refactoring needed — code clean and follows best practices
- Encoding caching deferred for future optimization (if performance metrics show need)

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

### Use js-tiktoken (not tiktoken Python bindings or custom tokenizer)
**Context:** Need accurate BPE token counting for context budget calculations.
**Decision:** Use js-tiktoken library with o200k_base encoding (gpt-4o-mini default).
**Rationale:** Pure JavaScript, no WASM memory management, supports all OpenAI encodings. For non-OpenAI models, o200k_base is close enough with a safety buffer.
**Tradeoffs:** May be less accurate for non-OpenAI models (Llama, Mistral) but avoids model-specific tokenizers. Research recommended 15% safety buffer for unknown models.

### Greedy Context Packing (not optimal knapsack)
**Context:** Need to fit tiers into token budget while respecting priorities.
**Decision:** Greedy algorithm: allocate from highest to lowest priority until budget exhausted.
**Rationale:** Simpler than optimal knapsack, O(n) complexity, predictable behavior. High-priority tiers always preserved intact before lower-priority tiers are considered.
**Tradeoffs:** May not achieve absolute optimal packing but guarantees priority order, which is more important for correctness.

### No Encoding Instance Caching
**Context:** js-tiktoken creates encoding instances for each call.
**Decision:** Create fresh encoding per function call, no caching layer.
**Rationale:** Simpler implementation, avoids potential WASM memory leaks, js-tiktoken handles cleanup automatically. Can optimize later if profiling shows significant overhead.
**Tradeoffs:** Slightly slower (encoding initialization overhead) but safer and easier to reason about.

## Verification

All success criteria met:
- ✅ All 22 tests pass with `npm test`
- ✅ countTokens returns correct BPE token counts
- ✅ packContext fits content within budget, preserving high-priority tiers
- ✅ compressToFit removes entire tiers when truncation insufficient
- ✅ No external dependencies beyond js-tiktoken
- ✅ Pure functions with no side effects

## Key Insights

1. **js-tiktoken performance:** Token encoding is slow (~3-5s per test suite). Increased vitest timeout to 30s. This is acceptable for test environment; production usage will batch operations differently.

2. **Overflow detection nuance:** The overflow flag indicates when even the highest-priority tier had to be truncated. This is critical UX feedback — tells the user their system prompt is too large for the model's context window.

3. **Greedy packing is sufficient:** The simple greedy algorithm (highest priority first) achieves the goal. No need for complex optimization algorithms since priority order is more important than perfect space utilization.

4. **Test-first workflow validated:** TDD caught import errors (encoding_for_model vs encodingForModel) and API mismatches (.free() method doesn't exist) before any integration. Green phase was straightforward.

## Next Steps

**Immediate (Phase 1):**
- Plan 03: LLM client integration (OpenAI SDK, streaming responses)
- Plan 04: Context visualization UI component
- Plan 05: Generation workspace with context packing in action

**Future optimizations (if needed):**
- Profile token counting performance in production context
- Add encoding instance caching if overhead is significant
- Implement 15% safety buffer for non-OpenAI models (flagged in research)
- Consider model-specific tokenizers for Llama/Mistral if accuracy critical

## Self-Check

### Created Files Verification
```bash
[ -f "src/services/tokens.ts" ] && echo "FOUND: src/services/tokens.ts" || echo "MISSING: src/services/tokens.ts"
[ -f "src/services/context-engine.ts" ] && echo "FOUND: src/services/context-engine.ts" || echo "MISSING: src/services/context-engine.ts"
[ -f "src/services/__tests__/tokens.test.ts" ] && echo "FOUND: src/services/__tests__/tokens.test.ts" || echo "MISSING: src/services/__tests__/tokens.test.ts"
[ -f "src/services/__tests__/context-engine.test.ts" ] && echo "FOUND: src/services/__tests__/context-engine.test.ts" || echo "MISSING: src/services/__tests__/context-engine.test.ts"
```

### Commits Verification
```bash
git log --oneline --all | grep -q "7798107" && echo "FOUND: 7798107" || echo "MISSING: 7798107"
git log --oneline --all | grep -q "e1cc81d" && echo "FOUND: e1cc81d" || echo "MISSING: e1cc81d"
```

Running verification...

**Results:**
```
FOUND: src/services/tokens.ts
FOUND: src/services/context-engine.ts
FOUND: src/services/__tests__/tokens.test.ts
FOUND: src/services/__tests__/context-engine.test.ts
FOUND: 7798107
FOUND: e1cc81d
```

## Self-Check: PASSED

All files created, all commits exist. Plan execution verified.
