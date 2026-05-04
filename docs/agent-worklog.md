# Agent Worklog

This file is the shared coordination log for feature branches and focused implementation chats.

## Timeline (approx.)

Dates are approximate unless tied to a merge/PR; use this section for quick “what happened when” context.

| When | What |
|------|------|
| **Mar 2026** | Product shell and marketing: `feature/landing-page`, `feature/app-shell`, `feature/dev-timeline-ui` merged into `main` (see **Completed** below). |
| **Mar–Apr 2026** (estimate) | First GitHub integration slice: NextAuth (GitHub) + Prisma, API routes, settings/timeline wiring. Full production hardening deferred — `docs/todo-github-integration.md`. |
| **May 2026** | **Phase 1 — GitHub integration rework (audits):** Prisma/env (1.1), NextAuth config (1.2), `src/lib/github` helpers (1.3), API route handlers (1.4). |
| **May 2026** | **Phase 2 — GitHub data pipeline:** PR helper (2.1), releases helper (2.2), event normalizer (2.3), `GET /api/timeline` (3.1), timeline page wiring (3.2), `POST /api/posts/generate` (4.1), generator UI (4.2). |
| **May 4, 2026** | **Phase A — Post generator enrichment layer:** event enricher A.1 (`enrichEvent.ts`), privacy sanitizer A.2 (`sanitizeEvent.ts`). |

## Rule

Every `feature/*` branch must update this file in its first meaningful commit so future chats and agents can see:

- what branch is active,
- what area is being changed,
- which files or folders are expected to be touched,
- and any API or integration assumptions.

## Active Work — Post Generator: Enrichment Layer (Phase A)

**Period:** May 4, 2026

| Task | Done (approx.) | Scope | Files Touched | Status | Notes |
|------|----------------|-------|----------------|--------|-------|
| **A.1** — Build event enricher | May 4, 2026 | Pre-pass that expands a raw `TimelineEntry` into richer content (whatChanged, whyItMatters, technicalDetail, outcome, difficulty) via Anthropic | `src/lib/postGenerator/enrichEvent.ts` (new) | ✅ done | Exports `EnrichedEvent` type + `enrichEvent(entry)` async fn. Uses `claude-haiku-4-5-20251001` (fast pre-pass). Prompt mandates plain JSON response. Safe JSON extraction tolerates markdown fences. Fallback to entry fields on any parse/network failure. `ANTHROPIC_API_KEY` guard with console error. |
| **A.2** — Build privacy sanitizer | May 4, 2026 | Pure sync function that strips or replaces technical detail based on privacy level before any enriched event enters a generation prompt | `src/lib/postGenerator/sanitizeEvent.ts` (new) | ✅ done | `sanitizeEvent(event, privacyLevel)` — no AI, no async. `"high"`: blanks `technicalDetail`, redacts file paths / function calls / variable tokens / error messages in `whatChanged` + `outcome` via regex. `"medium"`: replaces `technicalDetail` with `"Implementation details hidden."`, strips code snippets + stack traces from all text fields. `"low"`: returns event unchanged. |

---

## Active Work — GitHub Integration Rework (Phase 1)

**Period:** ~May 2026 · Full checklist: `docs/todo-github-integration.md`

| Task | Done (approx.) | Scope | Files Touched | Status | Notes |
|------|----------------|-------|----------------|--------|-------|
| **1.1** — Verify Prisma schema + env setup | May 2026 | Confirm schema correctness, migration state, Prisma client generation | `prisma/schema.prisma`, `prisma/migrations/`, `.env` (created), `.env.local` (check only) | ✅ done | Schema correct. 1 migration applied, DB up to date. Created `.env` so Prisma CLI auto-loads `DATABASE_URL`. |
| **1.2** — Verify NextAuth wiring | May 2026 | Confirm `authOptions`, provider, adapter, session callback, route handler | `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/types/next-auth.d.ts` | ✅ done | All correct. Restored `.trim()` on `clientId`, `clientSecret`, `secret` to guard against whitespace-caused `OAuthSignin` errors. |
| **1.3** — Audit GitHub API helpers | May 2026 | Confirm `fetchUserRepos` + `fetchRepoCommits` call correct endpoints, headers, and throw on bad input | `src/lib/github/api.ts`, `src/lib/github/index.ts`, `src/lib/github/types.ts` | ✅ done | Fixed: `perPage` default raised 30→50 in `fetchUserRepos`; added early token-missing guard to both functions. Exports confirmed via `index.ts`. |
| **1.4** — Audit GitHub API route handlers | May 2026 | Confirm all 5 routes use `getServerSession`, correct Prisma models, and proper error handling | `src/app/api/github/status/`, `repos/`, `repos/[owner]/[repo]/commits/`, `select-repo/`, `disconnect/` | ✅ done | All routes correct. No changes needed. Next.js 14 confirmed — `params` is sync. `disconnect` correctly clears `selectedGithubRepo` only, does not delete Account. |
| **2.1** — Add `fetchRepoPullRequests` helper | May 2026 | Implement helper to fetch closed, recently-updated pull requests | `src/lib/github/api.ts`, `src/lib/github/types.ts`, `src/lib/github/index.ts` | ✅ done | Added `GitHubPullRequest` type (id, number, title, state, html_url, created_at, updated_at, merged_at, user, body). Function queries `GET /repos/{owner}/{repo}/pulls?state=closed&sort=updated&per_page=20` with auth headers. Token-missing guard. Exported. |
| **2.2** — Add `fetchRepoReleases` helper | May 2026 | Implement helper to fetch releases (high-signal events for posts) | `src/lib/github/api.ts`, `src/lib/github/types.ts`, `src/lib/github/index.ts` | ✅ done | Added `GitHubRelease` type (id, tag_name, name, draft, prerelease, created_at, published_at, html_url, body, author). Function queries `GET /repos/{owner}/{repo}/releases?per_page=10` with auth headers. Token-missing guard. Exported. |
| **2.3** — Build GitHub event normalizer | May 2026 | Map raw commits/PRs/releases → existing `TimelineEntry` shape | `src/lib/github/normalizeEvents.ts` (new) | ✅ done | Exports `normalizeCommit`, `normalizePullRequest`, `normalizeRelease`. **Spec reconciliation:** task used `eventType`/`createdAt`/`pull_request`/`privacyLevel`; actual `TimelineEntry` uses `type`/`dateIso`/`"pr"`/`postStatus` (no `privacyLevel` field). Mapped to real fields, did not modify `TimelineEntry`. PR `state` derived from `merged_at` + `state`. Summaries truncated to 500 chars. |
| **3.1** — Create `GET /api/timeline` route | May 2026 | Single endpoint returning combined commits + PRs + releases as `TimelineEntry[]` for the selected repo | `src/app/api/timeline/route.ts` (new) | ✅ done | Auth + token guards (401), no selected repo → `[]`, parallel `Promise.all` fetch of commits/PRs/releases, normalize → merge → sort by `dateIso` desc. Used existing `getGithubAccessTokenForUser` helper (same query the task spec described). Try/catch → 500 with logged message. Timeline page not yet wired to this — that's a later task. |
| **3.2** — Wire timeline page to `/api/timeline` | May 2026 | Replace inline server-side GitHub fetch + demo fallback with a single `fetch("/api/timeline")` call | `src/app/(app)/timeline/page.tsx` | ✅ done | Removed `fetchRepoCommits`, `TIMELINE_ENTRIES`, `mapCommitsToTimeline` imports. Server component kept — forwards session cookie via `headers()` + absolute `NEXTAUTH_URL` base. Empty state shown for no data or fetch error; repo source banner shown when events present. `TimelineView` props unchanged. |
| **4.1** — Create `POST /api/posts/generate` | May 2026 | LLM-powered draft post generation per platform from selected timeline entries (Anthropic `claude-opus-4-7`) | `src/app/api/posts/generate/route.ts` (new) | ✅ done | Strict body validation (timelineEntryIds, platforms ⊂ {x,linkedin,reddit}, tone, privacyLevel) → 400. Auth → 401. Reuses Prisma + `lib/github` helpers from 3.1 (no internal HTTP roundtrip) to load timeline, then filters by id. Calls Anthropic Messages API with `max_tokens: 1000`. Robust JSON extraction (handles markdown fences). Returns `[{platform, content}]`. Try/catch → 500. Requires `ANTHROPIC_API_KEY` (already in `.env.example`). |
| **4.2** — Build post generator UI | May 2026 | Client-side page: select events, pick platforms/tone/privacy, generate posts, edit drafts in textarea | `src/app/(app)/generate/page.tsx` (new), `src/components/layout/Sidebar.tsx` | ✅ done | "use client" — `useEffect` loads `/api/timeline` on mount. Checkbox list per event. Toggle buttons for platforms (X/LinkedIn/Reddit), tone, privacy. Generate button disabled until ≥1 event + ≥1 platform. Calls `POST /api/posts/generate`. Renders editable textarea per platform with X char counter. Error states for load/generate failures. "Generate" added to sidebar nav (after Timeline, Sparkles icon). |

## Completed

| Branch | Merged (date) | Scope | Notes |
|--------|---------------|-------|-------|
| `feature/dev-timeline-ui` | **2026-03-19** → `main` | Timeline types, fake data, filters, app shell restoration, dashboard/settings/timeline routes, Tailwind/Next scaffold fixes | Merged locally into `main`; branch can be deleted after push |
| `feature/app-shell` | **2026-03-18** → `main` | Sidebar, Topbar, (app) route-group layout, dashboard/settings placeholders | PR #3 |
| `feature/landing-page` | **2026-03-16** → `main` | Full marketing landing page | PR #2 |

| `feature/post-generator` | Post generator chat / May 4, 2026 | AI post generation pipeline: event enricher, privacy sanitizer, platform prompt templates, generate API route, generator UI | `src/lib/postGenerator/enrichEvent.ts`, `src/lib/postGenerator/sanitizeEvent.ts`, `src/app/api/posts/generate/route.ts`, `src/app/(app)/generate/page.tsx` | 🔄 in progress | Phase A (enricher + sanitizer) done. Platform prompt templates and wiring to generate route are next. |

## Update Template

Copy this row format for new feature branches. Include an approximate **date** or month in **Timeline** and in task rows when you close work so the log stays chronological.

| When (approx.) | `feature/your-feature` | Chat name or owner | Short description | Key paths | Status | Notes |
|----------------|------------------------|---------------------|-------------------|-----------|--------|-------|
| e.g. **2026-06** | `feature/example` | You | One-line scope | `src/...` | planned / in progress / done | Dependencies, assumptions |
