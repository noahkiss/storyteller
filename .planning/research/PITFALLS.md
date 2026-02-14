# Pitfalls Research

**Domain:** AI-Assisted Story Writing with Local LLMs
**Researched:** 2026-02-13
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: Context Window Illusion (Advertised vs. Effective)

**What goes wrong:**
Tools claim support for "128K tokens" or similar large context windows, but models experience severe accuracy degradation well before reaching the advertised limit. Research shows models fall short of their Maximum Context Window by >99% in practice, with most experiencing severe degradation by 1000 tokens in context.

**Why it happens:**
Model specifications cite architectural or implementation limits, not practical capacity. Small local LLMs (4K-8K windows) degrade even faster. Developers design around advertised specs rather than tested reality.

**How to avoid:**
- Test actual usable context empirically with target models
- Design for 50-70% of advertised context as "safe zone"
- Implement context usage monitoring/warnings in UI
- Plan summarization/chunking assuming smaller effective windows

**Warning signs:**
- Story quality degrades mid-chapter
- Character details become inconsistent
- Plot elements forgotten or contradicted
- Model "loses track" of outline

**Phase to address:**
Phase 1 (Core Architecture) — context management strategy must be foundational, not bolted on later.

---

### Pitfall 2: Theme Drift (Outline Adherence Collapse)

**What goes wrong:**
As generation progresses, the model loses memory of the initial outline, causing the story to veer off-track with plot elements inconsistent with the premise. This is the most prominent problem in long-form AI story generation.

**Why it happens:**
Rolling summaries degrade outline information over successive compression cycles. Small models lack capacity to maintain both narrative momentum AND structural constraints simultaneously. Each summarization pass loses fidelity to original plan.

**How to avoid:**
- Implement dual memory storage: long-term (core outline, character goals) + short-term (recent events)
- Use paragraph-level and chapter-level summaries (hierarchical, not just sequential)
- Inject outline reminders periodically, not just at story start
- Create "anchor points" every N paragraphs to re-ground narrative
- Consider knowledge graph approach for character goals and obstacles

**Warning signs:**
- Generated text ignores outline bullet points
- Story pacing becomes unnatural (glossing over key events, over-elaborating minor details)
- Character goals shift or become forgotten
- Subplots emerge that contradict original plan

**Phase to address:**
Phase 1-2 (Context Management + Outline System) — outline adherence needs explicit architectural support, not just better prompting.

---

### Pitfall 3: Character Amnesia (Consistency Collapse)

**What goes wrong:**
Character traits, appearance, relationships, and backstory become inconsistent as the story grows beyond model's effective context. A character's eye color changes, personality shifts, or relationships are forgotten.

**Why it happens:**
Character details scatter across the narrative. Summarization processes lose specifics ("brown eyes" becomes "attractive appearance" becomes just "the detective"). Small context windows force choosing between recent plot events OR character context — rarely both.

**How to avoid:**
- Maintain structured character sheets separate from narrative context
- Inject character context at chapter/scene boundaries
- Create "non-negotiables" per character (2-3 core traits that always appear in summaries)
- Use retrieval system for character details, not just rolling summary
- Implement "character consistency checker" that flags contradictions

**Warning signs:**
- Physical descriptions contradict earlier text
- Character reactions inconsistent with established personality
- Relationships described differently in different chapters
- Character backstory details change

**Phase to address:**
Phase 2 (World/Character Management) — needs dedicated character sheet system with retrieval, not just better prompts.

---

### Pitfall 4: Summarization Quality Degradation (Lossy Compression Spiral)

**What goes wrong:**
Small models (4K-8K context) produce poor summaries of their own outputs. Quality degrades significantly beyond 8–16K tokens. Each compression pass loses critical details, and errors compound. Research shows pruning techniques "significantly degrade performance on summarization tasks."

**Why it happens:**
Small models lack capacity for high-quality abstractive summarization. Rolling summaries compress summaries, cascading information loss. Models lose nuance → lose subtext → lose coherence. Quantization (often used with local models) degrades summarization quality specifically.

**How to avoid:**
- Use hierarchical summarization (multiple granularity levels, not single rolling summary)
- Preserve raw text chunks longer before summarizing
- Consider using a larger model just for summarization (even if using small model for generation)
- Test summarization quality explicitly, not just generation quality
- Maintain multiple summary versions: detailed (short-term) and abstract (long-term)

**Warning signs:**
- Summaries lack specific details
- Summaries contradict source material
- Summaries omit key plot points
- Generated text repeats information already "summarized away"

**Phase to address:**
Phase 1 (Core Architecture) — summarization strategy is foundational. Bad summarization breaks everything downstream.

---

### Pitfall 5: Prompt Complexity Creep (The Mega-Prompt Trap)

**What goes wrong:**
Developers pack more instructions into prompts as they encounter issues: "Remember the outline AND character sheets AND tone AND pacing AND..." Context window fills with instructions, leaving little room for actual story content. Small models struggle with complex multi-requirement prompts.

**Why it happens:**
Each problem seems solvable with "just one more instruction." No systematic approach to context allocation. Unclear which requirements matter most. Treating prompts like configurations instead of UX design.

**How to avoid:**
- Treat complex prompts like UX design: structure, headers, whitespace, grouping
- Prioritize ruthlessly: what MUST be in every prompt vs. what's optional
- Move static context (character sheets, world details) to retrieval, not base prompt
- Use CO-STAR framework (Context, Objective, Style, Tone) for structured prompts
- Budget context tokens explicitly: X% instructions, Y% outline, Z% recent narrative

**Warning signs:**
- Prompts exceed 1000 tokens
- Instructions contradict each other
- Model ignores most instructions
- Generation quality doesn't improve despite adding more rules

**Phase to address:**
Phase 1 (Core Architecture) — prompt engineering strategy needed upfront to avoid building on unstable foundation.

---

### Pitfall 6: Model-Specific Assumptions (OpenAI API Compatibility Myth)

**What goes wrong:**
"OpenAI-compatible API" doesn't guarantee behavioral compatibility. Models have different chat templates, system message support, special tokens, stopping behavior, and tokenization. Code that works with GPT-4 breaks with Mistral or Llama.

**Why it happens:**
Developers assume API compatibility = behavioral compatibility. Each model family has quirks: some don't support system messages, some have different role requirements, some have special formatting needs. Local models often lack guardrails present in hosted APIs.

**How to avoid:**
- Design abstraction layer from day one
- Test with multiple model families early (Llama, Mistral, Qwen minimum)
- Use supports_system_message flag and gracefully map system → user when needed
- Document tested models explicitly
- Expose model-specific config (temperature, top-p, repetition penalty) to users
- Handle errors gracefully (different models fail differently)

**Warning signs:**
- Error messages about "conversation roles must alternate"
- System messages appear in output verbatim
- Chat formatting breaks with different models
- Special tokens render as text
- Users report "works in LM Studio but not Ollama"

**Phase to address:**
Phase 1 (Core Architecture) + Phase 6 (Polish) — abstraction needed early, but full multi-model testing can wait until polish phase.

---

### Pitfall 7: No User Control Over Generation (The Black Box Problem)

**What goes wrong:**
User starts a chapter generation, the model runs for minutes generating thousands of tokens, and the result is unusable. No way to guide, stop early, or intervene. Wasted time, wasted tokens, user frustration.

**Why it happens:**
Batch generation mentality ("submit → wait → receive") instead of streaming/interactive. Developers focus on getting output working, defer UI concerns. Long-running processes without progress feedback feel broken even when working.

**How to avoid:**
- Implement streaming from day one (not a feature, a requirement)
- Show token-by-token generation in UI
- Allow mid-generation stopping (user can end at natural paragraph break)
- Provide progress indicators (estimated tokens, elapsed time)
- Enable regeneration of last paragraph/section without losing previous content
- Consider SWAG approach (action guidance during generation, not just before)

**Warning signs:**
- Users complain about waiting without feedback
- "Loading spinner for 5 minutes" UX
- No way to salvage partial results from bad generation
- Users abandon generations mid-process
- High rate of "regenerate entire chapter" vs. "keep and continue"

**Phase to address:**
Phase 1 (Core Architecture) — streaming is architectural. Phase 3 (UI/UX) — controls and feedback are UX.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Single rolling summary instead of hierarchical | Simple to implement | Cascading information loss, impossible to debug what was lost | Never for stories >5K words |
| Hardcoded prompts instead of templates | Faster initial dev | Every model needs different prompts, no A/B testing, difficult to iterate | MVP only, refactor before beta |
| Storing full context in memory/session | No database needed | Can't resume work, can't analyze failures, no versioning | Early prototyping only |
| Concatenating context without token counting | Simpler code | Silent failures when context overflows, unpredictable truncation | Never — token counting is critical |
| Using OpenAI client library directly without abstraction | Less code to write | Locked to OpenAI-specific behaviors, harder to support other providers | Never — local LLM support is core requirement |
| Synchronous generation API (no streaming) | Simpler backend architecture | Poor UX for long generations, can't add streaming later without rewrite | Never for creative writing (always long-running) |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| LM Studio / Ollama | Assuming identical API behavior | Test both; use adapter pattern to normalize responses |
| Local LLM APIs | Not handling connection failures gracefully | Implement retry logic, show clear error when LLM server unreachable |
| Model loading | Assuming model is loaded and ready | Check /v1/models endpoint first, guide user if no models loaded |
| Tokenization | Using generic tokenizer for all models | Use model-specific tokenizer or count conservatively (+20% buffer) |
| Chat templates | Sending raw JSON assuming API will format correctly | Apply model-specific chat templates or verify API does it correctly |
| System messages | Including system message for all models | Check model capabilities; some models don't support system role |
| Streaming endpoints | Assuming /v1/chat/completions always supports streaming | Check for SSE support; have fallback to non-streaming |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading entire story into context every generation | Works for short stories | Use chunking + summaries from start | >10K word stories |
| Regenerating summaries from scratch each time | Immediate accuracy | Cache summaries hierarchically, update incrementally | >5 chapters |
| No token counting before API calls | Generation "just works" | Count tokens, truncate/summarize before sending | Varies by model context size |
| Keeping all generated variations in memory | Easy to implement undo/variations | Store in database, load on demand | >50 generations |
| Synchronous API calls blocking UI | Simple request/response model | Always use async/streaming for generation | First 30-second generation |
| Storing full prompt in every database record | Easy debugging | Store prompt template + parameters, reconstruct when needed | >1000 generations stored |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Accepting arbitrary LLM endpoint URLs without validation | SSRF attacks, internal network scanning | Whitelist common providers, validate URLs, consider allow-list only |
| Storing API keys in browser/client-side | Key exposure | Keep all LLM communication server-side, even for local models |
| No rate limiting on generation endpoints | Resource exhaustion, runaway costs if using paid APIs | Implement per-user generation limits, max tokens per request |
| Trusting model output as safe HTML | XSS if displaying generated content | Always sanitize LLM output before rendering |
| No validation of model-generated JSON | Crashes if malformed | Validate schema, have fallback for parse errors |
| Allowing unlimited context window size | OOM crashes on server | Cap maximum context size, enforce limits at application layer |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No indication of why generation failed | Users retry same failing action | Show specific errors: "Context too long (15K tokens, max 8K)", "Model not loaded", etc. |
| "Saving..." with no feedback on generation time | User doesn't know if it's working | Show estimated time, token progress, or "streaming now" indicator |
| All-or-nothing generation | Bad generation means starting over | Allow paragraph-level regeneration, branching, editing mid-generation |
| No preview of what will be in context | Surprises when details are forgotten | Show context window visualization: "Outline (500 tokens) + Character sheets (300 tokens) + Recent narrative (2000 tokens) = 2800/4096" |
| Hiding prompt engineering from power users | Users can't understand or fix issues | Provide "advanced" view showing actual prompt sent to model |
| No model selection guidance | Users pick wrong model for task | Show model capabilities: "Mistral 7B (4K context, fast, good for short scenes)" vs "Mixtral 8x7B (32K context, slower, better for chapters)" |
| Inconsistent tone between tools and generated content | Jarring transitions | Match UI copy tone to writing domain (professional for technical writing, creative for fiction) |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Character consistency:** Demo shows working characters — verify summaries preserve traits across >10 regenerations
- [ ] **Outline adherence:** Demo follows outline — verify outline injection still works after 20K words generated
- [ ] **Context management:** Generation works — verify behavior when approaching context limits (soft limits, hard limits, overflow handling)
- [ ] **Multi-model support:** Works with LM Studio — verify with Ollama, OpenAI, and at least one Hugging Face model
- [ ] **Error handling:** Happy path works — verify errors show user-friendly messages (not stack traces)
- [ ] **Streaming:** Tokens appear in UI — verify user can stop mid-generation and keep partial results
- [ ] **Resume capability:** User can close browser — verify can resume story later (session persistence, not just memory)
- [ ] **Summarization quality:** Summaries generated — verify summaries tested against original text (accuracy metrics, not just "looks ok")
- [ ] **Token counting:** Context fits in window — verify token counting accurate for all supported models (tested, not assumed)
- [ ] **Performance at scale:** Works for 1-chapter story — verify performance with 20-chapter, 50K word project

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Context Window Illusion | LOW | Add dynamic context reduction: trim oldest summarized content until generation succeeds |
| Theme Drift | MEDIUM | Implement "outline re-injection" feature: let user manually re-ground story; add outline to context mid-generation |
| Character Amnesia | MEDIUM | Build character "correction" tool: find/replace character details; regenerate affected sections |
| Summarization Degradation | HIGH | Store raw text longer; implement "re-summarize with better model" migration tool |
| Prompt Complexity Creep | MEDIUM | Refactor prompts into modular components; A/B test to find minimal effective prompt |
| Model-Specific Assumptions | HIGH | Build adapter pattern retroactively; may require database schema changes if assumptions baked into data model |
| No User Control | MEDIUM | Add streaming + stop controls; may require changing generation architecture from batch to streaming |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Context Window Illusion | Phase 1 | Test with 3 models at advertised limits; measure actual usable context |
| Theme Drift | Phase 2 | Generate 20K word story from outline; verify outline adherence at 5K, 10K, 15K, 20K |
| Character Amnesia | Phase 2 | Generate multi-chapter story with 5 characters; verify consistency across all chapters |
| Summarization Degradation | Phase 1 | Compare summaries to source text; measure information retention across 5 compression cycles |
| Prompt Complexity Creep | Phase 1 | Audit final prompt token count; verify <30% of context window used for instructions |
| Model-Specific Assumptions | Phase 1 + Phase 6 | Test with Llama, Mistral, Qwen models; verify all core features work |
| No User Control | Phase 1 + Phase 3 | User testing: verify users can stop/resume/branch during generation |

## Sources

### Research Papers & Technical Documentation

- [SCORE: Story Coherence and Retrieval Enhancement for AI Narratives](https://arxiv.org/html/2503.23512v1) — RAG for fiction writing, thematic consistency issues
- [Reading Subtext: Evaluating LLMs on Short Story Summarization](https://direct.mit.edu/tacl/article/doi/10.1162/tacl_a_00702/124837/) — Faithfulness mistakes in >50% of summaries
- [Long Story Generation via Knowledge Graph and Literary Theory](https://arxiv.org/html/2508.03137v1) — Theme drift problem and dual memory solution
- [RaPID: Efficient Retrieval-Augmented Long Text Generation](https://arxiv.org/html/2503.00751v1) — RAG outline quality issues
- [Context Rot: How Increasing Input Tokens Impacts LLM Performance](https://research.trychroma.com/context-rot) — Models fall short of max context by >99%
- [Epoch AI: Context Windows](https://epoch.ai/data-insights/context-windows) — Advertised vs effective context windows
- [LM Studio OpenAI Compatibility Docs](https://lmstudio.ai/docs/developer/openai-compat) — API compatibility issues
- [Min-p Sampling for Creative and Coherent LLM Outputs](https://openreview.net/forum?id=FBkpCyujtS) — Repetition vs creativity tradeoff

### Industry Articles & Best Practices

- [Common AI Writing Mistakes and How to Avoid Them](https://www.yomu.ai/resources/common-ai-writing-mistakes-and-how-to-avoid-them) — Accuracy and emotional depth issues
- [What Happens When Authors Use Generative AI to Write a Novel](https://fictionary.co/journal/what-happens-when-authors-use-generative-ai-to-write-a-novel/) — Scene repetition, consistency problems
- [Best Character.AI Alternatives for Long-Running Stories](https://blog.storychat.app/best-character-ai-alternatives-for-long-running-stories-memory-consistency-2026-guide/) — Character consistency best practices
- [How RAG Can Supercharge Storytelling for Writers](https://medium.com/@shadmehrv/how-retrieval-augmented-generation-rag-can-supercharge-storytelling-for-writers-3f07619b7ea4) — RAG benefits and limitations
- [Best Practices for LLM Prompt Engineering](https://www.palantir.com/docs/foundry/aip/best-practices-prompt-engineering) — Prompt complexity management
- [LLM Temperature Guide](https://www.promptingguide.ai/introduction/settings) — Temperature vs repetition issues
- [Streaming LLM Responses in Real Time](https://medium.com/@ansilproabl/streaming-llm-responses-in-real-time-705b8784fae5) — Streaming implementation approaches
- [Small Language Models 2026 Guide](https://asappstudio.com/small-language-models-2026/) — Context limitations with small models
- [Handling Long-Running LLM Processes](https://developer.atlassian.com/platform/forge/llm-long-running-process-with-forge-realtime/) — Queue + streaming architecture

---
*Pitfalls research for: AI-Assisted Story Writing with Local LLMs*
*Researched: 2026-02-13*
