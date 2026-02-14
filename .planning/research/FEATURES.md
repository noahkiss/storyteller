# Feature Research

**Domain:** AI-assisted story writing tools
**Researched:** 2026-02-13
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Story Bible / Codex** | Industry standard for tracking characters, settings, lore. Users expect centralized reference database. | MEDIUM | Database with search, tagging, AI context injection. NovelCrafter's Codex and Sudowrite's Story Bible are benchmarks. |
| **Character Profiles** | Users need consistent character traits, backstories, arcs across story. | LOW-MEDIUM | Name, physical traits, personality, relationships, goals. Must feed into AI context. |
| **Setting/Location Tracking** | World consistency crucial for readers. Users expect location database. | LOW-MEDIUM | Physical descriptions, rules/constraints, history. Linked to scenes/chapters. |
| **Outline → Prose Workflow** | Users expect guided path from premise to outline to draft. | MEDIUM | Multi-step generation: premise refinement → chapter beats → scene generation. |
| **AI Prose Generation** | Core value prop. Users expect "continue writing" functionality. | MEDIUM | Context-aware generation maintaining voice, style, plot. Quality depends on model selection. |
| **Chapter/Scene Organization** | Users expect hierarchical document structure like Scrivener. | LOW-MEDIUM | Tree structure, drag-drop reordering, folding/expanding sections. |
| **Revision/Editing Tools** | Users expect iterative refinement, not one-shot generation. | MEDIUM | Regenerate, rewrite paragraph, expand/contract, tone adjustment. |
| **Export to Standard Formats** | Users need final output in publishable formats. | LOW | DOCX, PDF, EPUB minimum. Markdown for version control. |
| **Style/Voice Consistency** | Users expect AI to match their writing voice across sessions. | HIGH | Style guide from user samples, fine-tuning prompts, voice embedding. Critical for quality. |
| **Context Window Management** | Technical requirement - users expect AI to "remember" story. | HIGH | RAG, hierarchical summarization, selective context injection. Make or break for long stories. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Self-Hosted / Privacy-First** | Full data ownership, no cloud dependencies, uncensored generation, cost control. | LOW-MEDIUM | HUGE differentiator vs Sudowrite/NovelCrafter. Matches user's project requirements perfectly. |
| **Local LLM Integration** | Connect to LM Studio, Ollama, any OpenAI-compatible API. Users own compute. | LOW | API client only. Let users choose models. Flexibility > opinionated model selection. |
| **Bring Your Own API Key** | Cost transparency, model choice, no subscription lock-in. | LOW | NovelCrafter offers this as premium feature. Make it default. |
| **Reusable Creative Library** | Cross-project character/setting templates. Build once, reuse across stories. | MEDIUM | Character archetypes, setting templates, theme patterns. Saves setup time for series. |
| **Series Continuity Management** | Multi-book tracking with shared world state, character development across books. | HIGH | Dedicated series database, cross-book references, timeline tracking. Major value for series authors. |
| **Intelligent Context Pruning** | Automatic relevance scoring - only inject pertinent story elements. | HIGH | Semantic search over story bible, scene relevance scoring. Maximizes limited context windows. |
| **Progressive Story Generation** | Handle 20K+ word stories with small models (7B-14B params, 4K-8K context). | HIGH | Chunked generation with context carry-forward, summarization layers. Technical achievement. |
| **Collaborative Story Setup** | AI-assisted premise refinement before generation. Structured dialogue to clarify vision. | MEDIUM | Multi-turn conversation to build premise, characters, outline. Better input = better output. |
| **Version History for Variants** | Track generation variants, compare prose versions, branch story paths. | MEDIUM | Git-like versioning for scenes/chapters. Users experiment without losing work. |
| **Model Flexibility** | Support 7B-14B param models, optimize for consumer hardware (no GPU requirements). | MEDIUM | Prompt engineering for smaller models, quality maintenance at scale. Accessibility win. |
| **Offline-First Architecture** | Work without internet connection, local-only operation. | LOW-MEDIUM | Docker deployment + local APIs. Privacy + reliability. |
| **Theme/Motif Tracking** | Track recurring symbols, themes, foreshadowing across narrative. | MEDIUM | Thematic analysis, pattern detection, suggestion engine. Helps literary depth. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-Time Collaboration** | "Google Docs for stories" - multiple users editing simultaneously. | Complex server infrastructure, conflicts with self-hosted model, single-user use case. Adds months of dev time. | Version export/import. This is a personal tool, not a team platform. User requirement explicitly says "single user." |
| **Cloud Sync** | "Access from anywhere" convenience. | Defeats privacy-first value prop. Security liability. Complex infrastructure. | Local-only with standard backup tools (rsync, git). Docker volumes are portable. |
| **Built-in Publishing** | "One-click publish to Amazon/platforms." | Narrow use case, maintenance burden, API dependencies. | Export to standard formats. Users handle publishing separately. |
| **Grammar/Spell Check** | "Grammarly integration." | Reinventing solved problems. Cloud dependencies. | Users can paste exports into dedicated tools. Focus on story generation, not polish. |
| **Mobile App** | "Write on phone/tablet." | Story writing is desktop activity. AI generation requires compute. UI complexity on small screens. | Responsive web UI is sufficient. Docker deployment accessible via browser. |
| **Social Features** | "Share stories, community feedback." | Privacy conflict. Moderation overhead. Platform liability. | This is a writing tool, not a social network. Users share output elsewhere. |
| **Marketplace for Prompts/Templates** | "Monetization opportunity." | Distracts from core product. Community management burden. | Include curated defaults. Users customize locally. |
| **Automatic SEO Optimization** | "Optimize for discoverability." | Wrong domain. Creative fiction ≠ content marketing. | Not applicable to story writing. |
| **Multi-Model Ensemble Generation** | "Combine outputs from multiple models for best results." | Complexity explosion. Slow generation. Cost multiplication. Diminishing returns. | Single model per generation pass. Users can regenerate with different model if unsatisfied. |
| **Voice/Dictation Input** | "Write by speaking." | Transcription is solved problem (Whisper, OS built-ins). | Users can dictate to any tool, paste into app. Don't rebuild transcription. |

## Feature Dependencies

```
Story Bible
    └──required by──> AI Prose Generation (needs context)
    └──required by──> Character Profiles
    └──required by──> Setting/Location Tracking
    └──required by──> Series Continuity Management

Outline → Prose Workflow
    └──requires──> Story Bible (premise, characters, settings)
    └──produces──> Chapter/Scene Organization
    └──triggers──> AI Prose Generation

Context Window Management
    └──required by──> AI Prose Generation (technical dependency)
    └──enhanced by──> Intelligent Context Pruning
    └──required by──> Progressive Story Generation

Series Continuity Management
    └──requires──> Story Bible (shared across books)
    └──requires──> Character Profiles (development over time)
    └──requires──> Setting/Location Tracking (world state)

Reusable Creative Library
    └──enhances──> Story Bible (template pre-population)
    └──enhances──> Collaborative Story Setup (starting points)

Version History for Variants
    └──integrates with──> Revision/Editing Tools
    └──applies to──> AI Prose Generation outputs

Local LLM Integration
    └──enables──> Self-Hosted / Privacy-First
    └──enables──> Offline-First Architecture
    └──required by──> Model Flexibility
```

### Dependency Notes

- **Story Bible is foundational:** Nearly all features depend on centralized knowledge base. Build first.
- **Context management is technical prerequisite:** Without solving context window constraints, long-form generation fails. Critical path.
- **Outline workflow feeds generation:** Structured setup enables better AI output. Phase dependencies clear.
- **Series features build on single-story features:** Don't attempt series management until single-story workflow is solid.
- **Reusable library enhances but doesn't block:** Nice-to-have accelerator, not core functionality.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **Story Bible (characters, settings, basic metadata)** — Foundation for all AI context. Without this, generation is context-blind.
- [ ] **Outline → Prose Workflow (premise → beats → generation)** — Core value delivery. Guided path from idea to draft.
- [ ] **AI Prose Generation (via OpenAI-compatible API)** — The actual writing assistance. Must connect to local LLMs.
- [ ] **Chapter/Scene Organization** — Users need to navigate generated content. Basic hierarchy sufficient.
- [ ] **Context Window Management (basic RAG)** — Technical requirement for stories > 4K tokens. Solves feasibility constraint.
- [ ] **Export to Markdown/DOCX** — Users need to get content out. Markdown minimum for portability.
- [ ] **Self-Hosted Docker Deployment** — Matches project requirements. Single-user, local-only, privacy-first.
- [ ] **Basic Revision Tools (regenerate, edit)** — Users must iterate. One-shot generation never sufficient.

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Intelligent Context Pruning** — Add when users hit context limits. Improves generation quality at scale.
- [ ] **Reusable Creative Library** — Add when users request faster setup. Accelerator, not blocker.
- [ ] **Version History for Variants** — Add when users experiment frequently. Quality-of-life improvement.
- [ ] **Theme/Motif Tracking** — Add when users want literary depth. Advanced feature.
- [ ] **Enhanced Character/Setting Templates** — Add when basic profiles feel limited. Incremental improvement.
- [ ] **EPUB Export** — Add when users request publishing formats. Low-hanging fruit.

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Series Continuity Management** — Complex feature. Wait for users with multi-book needs. Requires solid single-story workflow first.
- [ ] **Advanced Context Strategies (hierarchical summarization, semantic search)** — Optimize after basic RAG proves sufficient. Performance enhancement.
- [ ] **Style/Voice Fine-Tuning** — High complexity. Requires ML expertise. Prompt engineering may suffice for v1.
- [ ] **Model Flexibility (7B-14B optimization)** — Validate with single model tier first. Expand based on user hardware constraints.
- [ ] **Collaborative Story Setup Wizard** — Polish on top of basic outline workflow. UX enhancement.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Story Bible | HIGH | MEDIUM | P1 |
| AI Prose Generation | HIGH | MEDIUM | P1 |
| Outline → Prose Workflow | HIGH | MEDIUM | P1 |
| Context Window Management | HIGH | HIGH | P1 |
| Self-Hosted Deployment | HIGH | LOW | P1 |
| Chapter/Scene Organization | HIGH | LOW-MEDIUM | P1 |
| Export (Markdown/DOCX) | MEDIUM | LOW | P1 |
| Revision Tools | HIGH | MEDIUM | P1 |
| Intelligent Context Pruning | MEDIUM | HIGH | P2 |
| Reusable Creative Library | MEDIUM | MEDIUM | P2 |
| Version History | MEDIUM | MEDIUM | P2 |
| Series Continuity | MEDIUM | HIGH | P3 |
| Theme/Motif Tracking | LOW-MEDIUM | MEDIUM | P3 |
| Style/Voice Fine-Tuning | MEDIUM | HIGH | P3 |
| EPUB Export | LOW | LOW | P2 |
| Model Flexibility (multi-tier) | MEDIUM | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch (MVP)
- P2: Should have, add when possible (v1.x)
- P3: Nice to have, future consideration (v2+)

## Competitor Feature Analysis

| Feature | Sudowrite | NovelCrafter | Squibler | Our Approach |
|---------|-----------|--------------|----------|--------------|
| **Story Bible** | Story Bible with auto-tracking | Codex (database-style, searchable) | Story Bible with AI auto-reference | Story Bible + series support + reusable templates |
| **Prose Generation** | High-quality (Muse model, fine-tuned) | Multi-model support (BYOK) | Integrated generation | Connect to user's local LLM (LM Studio, Ollama) |
| **Outline Workflow** | Canvas (visual, freeform) | StoryBoard, Grid, Matrix, Outline | Outline expansion to prose | Structured premise → beats → scenes |
| **Privacy** | Cloud-based, subscription | Cloud-based, BYOK reduces cost | Cloud-based | **Self-hosted, local-only, zero cloud** |
| **Pricing** | $19-59/month subscription | $4-20/month + API costs if BYOK | Subscription model | **Free (self-hosted) + user's API costs** |
| **Context Management** | Proprietary (not detailed) | AI context injection from Codex | Automatic Story Bible referencing | RAG + intelligent pruning for small models |
| **Export** | Standard formats | Standard formats | Standard formats | Markdown, DOCX, EPUB (future) |
| **Series Support** | Limited (single project focus) | Project-based (can link books) | Multi-book support | **Native series continuity tracking** |
| **Revision Tools** | Expand, Describe, Brainstorm, Rewrite | Generate, review, refine phases | Scene generation, expansion | Regenerate, rewrite, variant tracking |
| **Hosting** | Cloud SaaS | Cloud SaaS | Cloud SaaS | **Docker, self-hosted** |

**Competitive positioning:** Storyteller differentiates on privacy (self-hosted), cost (no subscriptions), and flexibility (BYOL - Bring Your Own LLM). Competes on features where open-source + local models match cloud SaaS (story bible, outline workflow, context management). Concedes on prose quality (users limited by their local models) but gains on privacy, cost, and control.

## Sources

### AI Writing Tools Features & Ecosystem
- [Top 20 AI Writing Tools for Authors to Start 2026 Strong](https://www.authorflows.com/blogs/top-ai-writing-tools-for-authors-2026)
- [15+ Best AI Writing Tools for Authors in 2026](https://kindlepreneur.com/best-ai-writing-tools/)
- [Best AI Tools for Fiction Writers in 2026](https://sudowrite.com/blog/best-ai-tools-for-fiction-writers-in-2026/)
- [Best AI for Writing Fiction 2026: 11 Tools Tested](https://blog.mylifenote.ai/the-11-best-ai-tools-for-writing-fiction-in-2026/)

### Sudowrite vs NovelCrafter
- [Sudowrite vs. Novelcrafter: The Ultimate AI Showdown for Novelists](https://sudowrite.com/blog/sudowrite-vs-novelcrafter-the-ultimate-ai-showdown-for-novelists/)
- [Sudowrite vs. NovelCrafter: Choosing the Right AI Tool for Creative Writing](https://www.oreateai.com/blog/sudowrite-vs-novelcrafter-choosing-the-right-ai-tool-for-creative-writing/e1f3acc46c4ac3a4665aff53093f2a4b)

### Story Bible & Character Tracking
- [Penpoint - Character & Story Bible for Writers](https://www.penpoint.app/)
- [Using AI for Series Bibles: How I Finally Keep My Books Straight](https://futurefictionacademy.com/using-ai-for-series-bibles/)
- [Unleash Your Creativity: Create a Story Bible with AI](https://www.toolify.ai/ai-news/unleash-your-creativity-create-a-story-bible-with-ai-1627107)

### Context Window Management
- [Context Window Management: Strategies for Long-Context AI Agents and Chatbots](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)
- [Long Context Windows in Generative AI: An AI Atlas Report](https://www.emerge.haus/blog/long-context-windows-in-generative-ai)
- [Mastering Hierarchical Context for Powerful Prompt Engineering](https://promptengineering.pdxdev.com/day-5/hierarchical-context-structuring)

### Outline to Prose Workflow
- [Squibler: AI Book and Novel Writer](https://www.squibler.io/)
- [Plotting a Story with AI - Novelcrafter](https://www.novelcrafter.com/blog/plotting-a-story-with-ai)
- [Best AI Tools for Novel Writing in 2026: Planning, Drafting, Editing, Continuity](https://cognitivefuture.ai/best-ai-tools-for-novel-writing/)

### Self-Hosted & Local LLM
- [Best Self-Hosted AI Model for Creative Writing](https://thinkpeak.ai/best-self-hosted-ai-model-creative-writing/)
- [Self-hosting LLMs at Home: The Why, How, and What It'll Cost You](https://medium.com/kingfisher-technology/self-hosting-llms-at-home-the-why-how-and-what-itll-cost-you-41b191014bcc)
- [AIStoryWriter - LLM story writer with local model support](https://github.com/datacrystals/AIStoryWriter)

### Series Continuity
- [Keeping track of past books in a series - NovelCrafter](https://www.novelcrafter.com/courses/codex-cookbook/tracking-previous-books)
- [How to Write a Novel Series with Claude AI & Fact Files](https://www.arsturn.com/blog/how-to-write-a-novel-series-using-claude-ai-and-fact-files)

### Limitations & Problems
- [Writing with AI (2026) — How to Use It Without Losing Your Voice](https://blog.mylifenote.ai/the-ultimate-guide-to-writing-with-ai-in-2026/)
- [Weaknesses of AI-Generated Writing—and Why You Must Edit](https://www.wordrake.com/resources/weaknesses-of-ai-generated-writing)
- [Common AI Writing Mistakes and How to Avoid Them](https://www.yomu.ai/resources/common-ai-writing-mistakes-and-how-to-avoid-them)

---
*Feature research for: AI-assisted story writing tools*
*Researched: 2026-02-13*
