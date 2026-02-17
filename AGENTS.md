# Storyteller — Agent Instructions

## Project Overview

Self-hosted story writing tool with intelligent context management for small local LLMs. Vite + React + TypeScript SPA with SQLite WASM (OPFS) for client-side persistence.

- **Repo:** https://github.com/noahkiss/storyteller
- **Docker image:** `ghcr.io/noahkiss/storyteller`
- **Planning:** `.planning/` directory (GSD workflow)

## Architecture

- **Frontend:** Vite + React 18 + TypeScript
- **State:** Zustand (settings persisted to localStorage, UI ephemeral)
- **Database:** SQLite WASM with OPFS backend (browser-side)
- **LLM:** OpenAI SDK with `dangerouslyAllowBrowser: true` (connects to local LLM servers)
- **Context Engine:** BPE token counting (js-tiktoken), priority-based context packing, hierarchical compression
- **Build:** Multi-stage Docker (node build + nginx serve) with COOP/COEP headers

## Docker & Release Workflow

**After completing each phase:**

1. Bump version in `package.json` (semver: `0.{phase}.0` for phase completion)
2. Commit the version bump
3. Tag: `git tag -a v{version} -m "v{version} — Phase {N}: {Name}"`
4. Push with tags: `git push origin main --tags`
5. GitHub Actions builds and publishes to `ghcr.io/noahkiss/storyteller:{version}`
6. Verify the workflow completes: `gh run list --repo noahkiss/storyteller`

**For post-release fixes:** Increment patch version (`v0.2.1`, `v0.2.2`, etc.) — never re-tag an existing version. Docker layer caching can serve stale images if the tag is reused.

**Runtime config (env vars):**
- `STORYTELLER_LLM_BASE_URL` — LLM API endpoint
- `STORYTELLER_LLM_API_KEY` — Optional API key
- `STORYTELLER_LLM_MODEL` — Default model name

These inject into `window.__STORYTELLER_CONFIG__` at container startup via `docker-entrypoint.sh`. The settings store reads them as defaults (localStorage overrides).

## Development

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build
npm test         # Run vitest
```

## Conventions

- CSS: Plain CSS files per component, CSS custom properties for theming, dark mode default
- Components: One directory per component group (`components/{group}/{Component}.tsx`)
- Hooks: `src/hooks/use-{name}.ts`
- Services: `src/services/{name}.ts` (no UI dependencies)
- Tests: `src/services/__tests__/{name}.test.ts`
