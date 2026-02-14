# Stack Research

**Domain:** AI-assisted story writing web application
**Researched:** 2026-02-13
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 15.x (latest: 15.4) | Full-stack React framework | Industry standard for React apps in 2025 with [135K GitHub stars and 11.4M weekly downloads](https://florinelchis.medium.com/top-20-javascript-typescript-frameworks-on-github-ranked-by-stars-2025-analysis-7c0aa75a4040). Provides [server-side rendering, API routes, and optimized builds](https://nextjs.org/docs/app/guides/upgrading/version-16). v15 is production-ready (v16 is beta as of Feb 2025). |
| **NestJS** | 11.x (latest: 11.1.13) | Backend API framework | [TypeScript-first framework with modular architecture](https://encore.dev/articles/best-typescript-backend-frameworks) that encourages clean separation of concerns. NestJS 11 [improves startup performance and includes JSON logging](https://trilon.io/blog/announcing-nestjs-11-whats-new). Perfect for structured, enterprise-grade backends. |
| **TypeScript** | 5.x | Type-safe development | [48.8% of professional developers use TypeScript](https://florinelchis.medium.com/top-20-javascript-typescript-frameworks-on-github-ranked-by-stars-2025-analysis-7c0aa75a4040) with 84.1% satisfaction. Essential for large codebases and AI integrations. |
| **React** | 19.x (latest: 19.2) | UI library | [Production-ready as of Dec 2024](https://react.dev/blog/2024/12/05/react-19) with stable Server Components and React Compiler for automatic optimization. [90%+ backward compatibility](https://vocal.media/01/react-19-release-features-2025-complete-developer-guide) with React 18. |
| **better-sqlite3** | 12.x (latest: 12.6.2) | SQLite database driver | [Fastest and simplest library for SQLite in Node.js](https://generalistprogrammer.com/tutorials/better-sqlite3-npm-package-guide) with synchronous API. Latest version [12.6.2 released Jan 2026](https://github.com/WiseLibs/better-sqlite3/releases). Perfect for single-user, self-hosted apps. No async complexity needed. |
| **OpenAI SDK** | 6.x (latest: 6.2.0) | LLM API client | Official [TypeScript/JavaScript library for OpenAI-compatible APIs](https://github.com/openai/openai-node/blob/master/README.md). Works with local LLM servers (LM Studio, LocalAI, Ollama) via custom `baseURL`. [v6.2.0 includes 2025 feature launches](https://github.com/openai/openai-node/blob/master/CHANGELOG.md). |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Zod** | 4.x (latest: 4.3.6) | Runtime schema validation | [14x faster string parsing in v4](https://www.infoq.com/news/2025/08/zod-v4-available/) with tree-shakable @zod/mini bundle. Essential for validating LLM responses, API inputs, and user data. TypeScript-first with automatic type inference. |
| **MUI (Material-UI)** | 6.x | React UI components | [3.3 million weekly downloads](https://www.sencha.com/blog/10-best-react-ui-component-libraries-in-2025/), decade of production hardening. Perfect for [dashboard UIs and enterprise apps](https://www.luzmo.com/blog/react-dashboard). Comprehensive components including forms, tables, dialogs. |
| **TanStack Query** | 5.x | Data fetching/caching | Industry standard for server state management in React. Handles caching, background updates, and request deduplication. Perfect for managing story/character data and LLM request states. |
| **class-validator** + **class-transformer** | Latest | DTO validation (NestJS) | NestJS ecosystem standard for request/response validation. Works seamlessly with TypeScript decorators and Zod for API layer. |
| **@nestjs/swagger** | Latest | API documentation | Auto-generates OpenAPI specs from NestJS decorators. Essential for documenting the API layer consumed by Next.js frontend. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Docker** | Containerization | [Multi-stage builds reduce image size](https://arnab-k.medium.com/optimizing-docker-images-for-production-dc73dccb7a20) by separating build/runtime. Use `npm ci` for reproducible builds. See Docker section below. |
| **ESLint** + **Prettier** | Code quality | TypeScript-aware linting. Next.js and NestJS both include default configs. |
| **Vitest** | Testing framework | Modern, fast alternative to Jest with native ESM support. Better TypeScript integration. |
| **tsx** | TypeScript execution | Run TypeScript directly in development. Faster than ts-node, works with ESM. |

## Installation

### Backend (NestJS)

```bash
# Create new NestJS project
npm i -g @nestjs/cli
nest new storyteller-api

# Core dependencies
cd storyteller-api
npm install better-sqlite3 openai zod
npm install @nestjs/swagger class-validator class-transformer

# Types
npm install -D @types/better-sqlite3
```

### Frontend (Next.js)

```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest storyteller --typescript --tailwind --app --eslint

# UI and data fetching
cd storyteller
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @tanstack/react-query zod
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Next.js 15** | Next.js 16 | v16 is [currently beta](https://nextjs.org/docs/app/guides/upgrading/version-16) - use for testing Turbopack (2-5x faster builds) but stick with v15 for production until stable. |
| **NestJS** | Fastify + Hono | Use for maximum speed in greenfield projects, but NestJS wins for [structured, enterprise-grade architecture](https://encore.dev/articles/best-typescript-backend-frameworks). |
| **better-sqlite3** | Prisma ORM | Prisma adds 10-30% overhead for ORM features. For simple SQLite with full control, better-sqlite3's synchronous API is [faster and simpler](https://generalistprogrammer.com/tutorials/better-sqlite3-npm-package-guide). |
| **MUI** | Shadcn UI + Tailwind | [Shadcn offers copy-paste components](https://www.untitledui.com/blog/react-component-libraries) with full code ownership. MUI provides [battle-tested, accessible components](https://www.sencha.com/blog/10-best-react-ui-component-libraries-in-2025/) out of the box. |
| **OpenAI SDK** | LiteLLM | [LiteLLM provides unified interface](https://medium.com/@rosgluk/local-llm-hosting-complete-2025-guide-ollama-vllm-localai-jan-lm-studio-more-f98136ce7e4a) for 100+ LLM providers. Use if switching between cloud/local frequently. OpenAI SDK simpler for OpenAI-compatible APIs only. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **sqlite3 (async)** | [Slower than better-sqlite3](https://generalistprogrammer.com/tutorials/better-sqlite3-npm-package-guide) with unnecessary async complexity for single-user app. | **better-sqlite3** - synchronous, faster, simpler API. |
| **Express.js directly** | Express v5 [just reached stable in 2025](https://trilon.io/blog/announcing-nestjs-11-whats-new) after years. NestJS provides structure that raw Express lacks. | **NestJS** - built on Express with TypeScript-first architecture. |
| **Ant Design** | Heavier than MUI, [better for Chinese enterprise apps](https://www.sencha.com/blog/10-best-react-ui-component-libraries-in-2025/). | **MUI** - more flexible, better docs, larger ecosystem. |
| **LocalAI/Ollama directly** | Requires managing model servers separately. | **LM Studio** - [polished GUI with OpenAI-compatible API](https://medium.com/@rosgluk/local-llm-hosting-complete-2025-guide-ollama-vllm-localai-jan-lm-studio-more-f98136ce7e4a) built-in. Best for non-technical users. |

## Stack Patterns by Variant

**If deploying to Vercel/Netlify (cloud):**
- Use Next.js API routes instead of separate NestJS backend
- Store SQLite file in persistent volume (Vercel Postgres for multi-user later)
- Combine frontend + backend in monorepo

**If self-hosting (Docker on homelab - RECOMMENDED for this project):**
- Separate NestJS backend + Next.js frontend containers
- SQLite file in Docker volume mounted to host
- Use docker-compose for orchestration
- Reverse proxy (Traefik/Caddy) for SSL

**If building MVP first:**
- Start with Next.js + API routes only (no NestJS)
- Add NestJS later when backend logic grows
- Use better-sqlite3 directly in Next.js API routes

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.x | React 19.x | [Next.js 15 supports React 19](https://nextjs.org/docs/app/guides/upgrading/version-15). Upgrade together. |
| NestJS 11.x | Node.js 20+ | [Node.js 16/18 no longer supported](https://trilon.io/blog/announcing-nestjs-11-whats-new). Use Node 20 LTS or 22. |
| better-sqlite3 12.x | Node.js 14.21+ | Requires Node v14.21.1 or later. Works with all modern Node versions. |
| OpenAI SDK 6.x | Node.js 18+ | TypeScript 4.5+ required. Works with Deno, Bun, Cloudflare Workers. |

## Docker Stack Details

### Multi-Stage Build Pattern

**Backend (NestJS) Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
# better-sqlite3 needs rebuild for production
RUN npm rebuild better-sqlite3
CMD ["node", "dist/main.js"]
```

**Frontend (Next.js) Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
CMD ["npm", "start"]
```

**Key Docker Practices (2025):**
- [Multi-stage builds](https://arnab-k.medium.com/creating-multi-stage-builds-in-docker-for-optimized-images-202e58df2e09) separate build/runtime dependencies (reduces image size 50-80%)
- Use `npm ci` instead of `npm install` for [reproducible builds](https://themobilereality.com/blog/javascript/best-practices-nodejs)
- Alpine images for smaller footprint
- Rebuild native modules (better-sqlite3) in production stage
- [Chain commands with &&](https://arnab-k.medium.com/optimizing-docker-images-for-production-dc73dccb7a20) to minimize layers

## LLM Integration Strategy

### OpenAI-Compatible Local Servers

The OpenAI SDK's `baseURL` parameter works with any OpenAI-compatible server:

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:1234/v1', // LM Studio default
  apiKey: 'not-needed-for-local', // Required param but ignored by local servers
});
```

**Recommended local LLM host:** [LM Studio](https://medium.com/@rosgluk/local-llm-hosting-complete-2025-guide-ollama-vllm-localai-jan-lm-studio-more-f98136ce7e4a)
- Polished GUI for non-technical users
- Built-in model browser and downloader
- OpenAI-compatible API server (highly mature and stable)
- Automatic hardware detection (CPU/GPU)
- Performance comparison between models

**Alternative:** Ollama (if preferring CLI-first workflow)

### Context Management Pattern

For 4K-8K context windows with 20K+ word stories:

```typescript
// Rolling summary approach
interface StoryContext {
  currentChapter: string;        // Full text of current chapter
  previousSummary: string;       // Compressed summary of all prior chapters
  outline: ChapterOutline[];     // Structured outline (low token cost)
  characters: Character[];       // Active characters in current scene
  settings: Setting[];           // Current location details
}

// Context budget: 4K tokens = ~3K words
// Breakdown:
// - System prompt + instructions: 500 tokens
// - Outline (all chapters): 800 tokens
// - Previous summary: 600 tokens
// - Current chapter: 800 tokens
// - Characters/settings: 300 tokens
// = 3000 tokens, leaves 1000 for generation
```

**Key insight:** Storyteller's core differentiator is smart context management, not the LLM itself. Most AI writing tools fail at long-form because they don't intelligently compress prior context.

## Sources

### Context7 (HIGH confidence)
- `/websites/nextjs` - Next.js documentation and version info
- `/websites/nestjs` - NestJS documentation and v11 features
- `/openai/openai-node` - OpenAI SDK official docs
- `/wiselibs/better-sqlite3` - better-sqlite3 documentation

### Official Documentation (MEDIUM-HIGH confidence)
- [Next.js v15 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-15)
- [Next.js v16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [NestJS v11 Migration Guide](https://docs.nestjs.com/migration-guide)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [better-sqlite3 GitHub Releases](https://github.com/WiseLibs/better-sqlite3/releases)
- [OpenAI Node Changelog](https://github.com/openai/openai-node/blob/master/CHANGELOG.md)

### WebSearch Verified (MEDIUM confidence)
- [TypeScript Frameworks 2025 Analysis](https://florinelchis.medium.com/top-20-javascript-typescript-frameworks-on-github-ranked-by-stars-2025-analysis-7c0aa75a4040)
- [Best TypeScript Backend Frameworks 2026](https://encore.dev/articles/best-typescript-backend-frameworks)
- [NestJS 11 Release Announcement](https://trilon.io/blog/announcing-nestjs-11-whats-new)
- [Local LLM Hosting 2025 Guide](https://medium.com/@rosgluk/local-llm-hosting-complete-2025-guide-ollama-vllm-localai-jan-lm-studio-more-f98136ce7e4a)
- [React Dashboard Libraries 2025](https://www.luzmo.com/blog/react-dashboard)
- [Best React UI Component Libraries 2025](https://www.sencha.com/blog/10-best-react-ui-component-libraries-in-2025/)
- [Zod v4 Release](https://www.infoq.com/news/2025/08/zod-v4-available/)
- [Docker Multi-Stage Builds 2025](https://arnab-k.medium.com/creating-multi-stage-builds-in-docker-for-optimized-images-202e58df2e09)
- [Docker Image Optimization](https://arnab-k.medium.com/optimizing-docker-images-for-production-dc73dccb7a20)
- [Node.js Best Practices 2025](https://themobilereality.com/blog/javascript/best-practices-nodejs)

---
*Stack research for: AI-assisted story writing web application*
*Researched: 2026-02-13*
