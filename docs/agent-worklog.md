# Agent Worklog

Shared coordination log for all feature branches and focused implementation chats.
Dates are the actual session dates from conversation timestamps unless marked *(estimate)*.

---

## Chronological Timeline

| Date | What happened |
|------|---------------|
| **2026-03-16** | `feature/landing-page` merged → `main` (PR #2) |
| **2026-03-18** | `feature/app-shell` merged → `main` (PR #3) |
| **2026-03-19** | `feature/dev-timeline-ui` merged → `main` |
| **2026-03 → 04** *(estimate)* | First GitHub integration slice: NextAuth + Prisma + API routes. Deferred for hardening — see `docs/todo-github-integration.md` |
| **2026-05-01** | Phase 1 begins — Task 1.1: Prisma schema + env audit |
| **2026-05-02** | Tasks 1.2–4.2: NextAuth audit, GitHub helpers, normalizer, `/api/timeline`, timeline page, post generator API + UI |
| **2026-05-02** | GitHub OAuth credentials set, `NEXTAUTH_URL` corrected to port 3001 |
| **2026-05-03** | Auth end-to-end verification — sign-in confirmed working, `access_token` stored in DB |
| **2026-05-04** | Phase A — Post generator enrichment: event enricher (`A.1`) + privacy sanitizer (`A.2`) |
| **2026-05-04** | Phase B — Post generator templates: LinkedIn prompt (`B.1`), X prompt (`B.2`), Reddit prompt (`B.3`) |
| **2026-05-04** | Phase C — Generation pipeline: core `generatePost` (`C.1`), pipeline-driven `POST /api/posts/generate` route (`C.2`), retry wrapper + partial-success (`C.3`) |

---

## Rule

Every `feature/*` branch must update this file in its first meaningful commit so future chats and agents can see:
- what branch is active
- what area is being changed
- which files or folders are expected to be touched
- any API or integration assumptions

---

## Phase A — Post Generator: Enrichment Layer
**2026-05-04**

| Task | Scope | Files | Status | Notes |
|------|-------|-------|--------|-------|
| **A.1** — Event enricher | Pre-pass that expands a `TimelineEntry` into richer content (whatChanged, whyItMatters, technicalDetail, outcome, difficulty) via Anthropic | `src/lib/postGenerator/enrichEvent.ts` *(new)* | ✅ done | Uses `claude-haiku-4-5`. Exports `EnrichedEvent` + `enrichEvent(entry)`. Falls back to entry fields on parse/network failure. `ANTHROPIC_API_KEY` guard. |
| **A.2** — Privacy sanitizer | Pure sync function — strips/replaces technical detail before enriched events reach any generation prompt | `src/lib/postGenerator/sanitizeEvent.ts` *(new)* | ✅ done | `sanitizeEvent(event, privacyLevel)`. `"high"`: blanks `technicalDetail`, redacts file paths/function calls/tokens via regex. `"medium"`: replaces `technicalDetail`, strips code snippets/stack traces. `"low"`: passthrough. |

---

## Phase B — Post Generator: Platform Prompt Templates
**2026-05-04**

| Task | Scope | Files | Status | Notes |
|------|-------|-------|--------|-------|
| **B.1** — LinkedIn prompt template | Pure prompt builder for LinkedIn drafts (story arc: hook → what built → why it matters → takeaway → soft close) | `src/lib/postGenerator/templates/linkedinTemplate.ts` *(new)* | ✅ done | Exports `buildLinkedInPrompt(event, tone)`. Length 150–300 words, ≤2 hashtags last line, blocks hype openers, tone-specific guidance for casual/professional/feedback-seeking/educational with neutral fallback. Empty `technicalDetail` triggers "do not invent specifics" guard for high-privacy posts. |
| **B.2** — X prompt template | Pure prompt builder for X/Twitter drafts (hook-first; first 8 words decide if reader stops) | `src/lib/postGenerator/templates/xTemplate.ts` *(new)* | ✅ done | Exports `buildXPrompt(event, tone)`. Hard cap **260 chars** (20-char buffer below 280). Hook MUST NOT start with `"I"`, `"We"`, or `"Just"` — lead with outcome or problem. 0–2 specific hashtags (blocks generic spam: `#coding`, `#developer`, `#tech`, `#programming`). Single post, never a thread. Self-check loop in prompt: count chars and rewrite if over 260. Injects only `whatChanged`, `outcome`, `difficulty` (no `whyItMatters` / `technicalDetail` — keeps post tight and avoids leaks). `difficulty` calibrates tone (significant = worth noting, trivial = understated). Tone variants: casual = punchy fragments OK, professional = complete sentences, feedback-seeking = short genuine question, educational = lead with the insight. **Replaces the previous B.3* stub.** |
| **B.3** — Reddit prompt template | Pure prompt builder for Reddit drafts (title + body, devlog voice — honest, self-aware, downvote-resistant) | `src/lib/postGenerator/templates/redditTemplate.ts` *(new)* | ✅ done | Exports `buildRedditPrompt(event, tone)`. Title ≤12 words on line 1, blank line, then body (tried → happened → learned → optional question). No hashtags. Banned vocab list (`excited`, `thrilled`, `game-changer`, `journey`, `passionate`, `leverage`, etc.). Tone variants: casual = informal/humor, professional = measured, feedback-seeking = ends with specific technical question, educational = lesson-framed. Always leans honest regardless of tone. Injects all 5 enriched fields including `difficulty` for calibration. *(Renumbered from B.2 → B.3 on 2026-05-04.)* |

---

## Phase C — Post Generator: Generation Pipeline
**2026-05-04**

| Task | Scope | Files | Status | Notes |
|------|-------|-------|--------|-------|
| **C.1** — Core `generatePost` | Single function that ties enriched event + platform + tone → one generated post via Anthropic | `src/lib/postGenerator/generatePost.ts` *(new)* | ✅ done | Exports `Platform`, `GeneratedPost` types and `generatePost(event, platform, tone)`. Selects prompt builder via exhaustive `switch`. Calls `claude-sonnet-4-6` at `https://api.anthropic.com/v1/messages` with `max_tokens: 1000`. Cleans output (strips Markdown fences and surrounding quotes). For platform `"x"`: if content > 280 chars, retries ONCE in a multi-turn message asking the model to shorten under 260 while keeping the hook. Wraps everything in try/catch and rethrows as `Failed to generate ${platform} post: ${message}`. Throws (does not silently fall back) so callers can decide. |
| **C.2** — Pipeline-driven `POST /api/posts/generate` route | Orchestrates: validate → auth → fetch `/api/timeline` internally → enrich → sanitize → pick anchor event → generate all platforms in parallel → return | `src/app/api/posts/generate/route.ts` *(rewritten — replaces 4.1 implementation)* | ✅ done | Strict body validation → 400. `getServerSession` → 401. Internal HTTP `fetch(${NEXTAUTH_URL ?? request origin}/api/timeline, { cookie })` per spec — replaces 4.1's direct Prisma + `lib/github` access. No matching entries → 400 `{ error: "No matching timeline entries found" }`. Multi-event handling: enriches + sanitizes ALL selected entries in parallel, then `pickAnchorEvent()` selects ONE by `(difficulty desc, dateIso desc)` — comment in source explains why concatenating events produces muddled posts. `Promise.all` over platforms → `claude-sonnet-4-6` via `generatePost`. Try/catch → 500 `{ error, detail }`. **Response shape change**: returns `{ posts: GeneratedPost[] }` with `characterCount` per post (was bare `GeneratedPost[]` in 4.1). |
| **C.3** — Retry wrapper + error resilience | `withRetry` utility + route updated to return partial success (`207`) or total failure (`500`) gracefully | `src/lib/postGenerator/withRetry.ts` *(new)*, `src/app/api/posts/generate/route.ts` *(edit)* | ✅ done | `withRetry<T>(fn, retries=1, label="")` → tries `fn()`, on throw waits 500 ms and retries once, on second throw logs with label and returns `null` (never throws). Route wraps each `generatePost` call with `withRetry(..., 1, platform)`. After `Promise.all`, partitions results: `posts[]` (non-null) + `failed[]` (null → platform name). All failed → `500 { error, detail }`. Some failed → `207 { posts, failed }`. All success → `200 { posts }`. |
| **C.2-followup** — Fix generate page response parsing | One-line fix: destructure `{ posts }` from the new `{ posts: GeneratedPost[] }` response envelope | `src/app/(app)/generate/page.tsx` | ✅ done | Changed `(await res.json()) as GeneratedPost[]` → `const { posts: generated } = (await res.json()) as { posts: GeneratedPost[] }`. No re-roll handler exists in the UI. No other UI or state logic changed. |

---

## Phase 1 → 4 — GitHub Integration Rework
**2026-05-01 → 2026-05-02** · Full checklist: `docs/todo-github-integration.md`

| Date | Task | Scope | Files | Status | Notes |
|------|------|-------|-------|--------|-------|
| **2026-05-01** | **1.1** — Prisma schema + env setup | Confirm schema correctness, migration state, Prisma client | `prisma/schema.prisma`, `prisma/migrations/`, `.env` *(created)* | ✅ done | Schema correct. 1 migration applied. Created `.env` so Prisma CLI auto-loads `DATABASE_URL`. |
| **2026-05-02** | **1.2** — NextAuth config audit | Confirm `authOptions`, provider, adapter, session callback | `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/types/next-auth.d.ts` | ✅ done | Restored `.trim()` on `clientId`, `clientSecret`, `secret`. Added `logger` + `events` debug blocks. |
| **2026-05-02** | **1.3** — GitHub API helper audit | Confirm `fetchUserRepos` + `fetchRepoCommits` endpoints, headers, error guards | `src/lib/github/api.ts`, `types.ts`, `index.ts` | ✅ done | `perPage` default raised 30→50. Added token-missing guard to both functions. |
| **2026-05-02** | **1.4** — GitHub API route audit | Confirm all 5 routes use `getServerSession`, correct Prisma models, error handling | `src/app/api/github/status/`, `repos/`, `commits/`, `select-repo/`, `disconnect/` | ✅ done | All correct. No changes needed. `disconnect` clears `selectedGithubRepo` only — Account row preserved. |
| **2026-05-02** | **2.1** — `fetchRepoPullRequests` helper | Fetch closed PRs from GitHub API | `src/lib/github/api.ts`, `types.ts`, `index.ts` | ✅ done | `GET /repos/{owner}/{repo}/pulls?state=closed&sort=updated&per_page=20`. `GitHubPullRequest` type added. |
| **2026-05-02** | **2.2** — `fetchRepoReleases` helper | Fetch releases (high-signal events) from GitHub API | `src/lib/github/api.ts`, `types.ts`, `index.ts` | ✅ done | `GET /repos/{owner}/{repo}/releases?per_page=10`. `GitHubRelease` type added. |
| **2026-05-02** | **2.3** — GitHub event normalizer | Map raw commits/PRs/releases → `TimelineEntry` shape | `src/lib/github/normalizeEvents.ts` *(new)* | ✅ done | Exports `normalizeCommit`, `normalizePullRequest`, `normalizeRelease`. PR state derived from `merged_at`. Summaries truncated at 500 chars. |
| **2026-05-02** | **3.1** — `GET /api/timeline` route | Combined endpoint: commits + PRs + releases as `TimelineEntry[]` | `src/app/api/timeline/route.ts` *(new)* | ✅ done | Auth + token guards → 401. `Promise.all` parallel fetch. Normalizes → merges → sorts by `dateIso` desc. Try/catch → 500. |
| **2026-05-02** | **3.2** — Timeline page wired to `/api/timeline` | Replace inline GitHub fetch + demo fallback | `src/app/(app)/timeline/page.tsx` | ✅ done | Removed `fetchRepoCommits`, `TIMELINE_ENTRIES`, `mapCommitsToTimeline`. Forwards session cookie via `headers()`. Empty state with Settings link. |
| **2026-05-02** | **4.1** — `POST /api/posts/generate` route | LLM post generation from selected timeline entries via Anthropic | `src/app/api/posts/generate/route.ts` *(new)* | ✅ done | Validates `timelineEntryIds`, `platforms`, `tone`, `privacyLevel`. Calls `claude-opus-4-7`, `max_tokens: 1000`. Robust JSON extraction. Returns `[{platform, content}]`. |
| **2026-05-02** | **4.2** — Post generator UI | Select events, pick platforms/tone/privacy, trigger generation, edit drafts | `src/app/(app)/generate/page.tsx` *(new)*, `src/components/layout/Sidebar.tsx` | ✅ done | `"use client"`. Checkbox event list. Toggle buttons for platforms/tone/privacy. Generate button disabled until ≥1 event + ≥1 platform. Editable textareas per platform. "Generate" added to sidebar nav. |

---

## Auth Setup & Verification
**2026-05-02 → 2026-05-03**

| Date | What | Outcome |
|------|------|---------|
| **2026-05-02** | GitHub OAuth App credentials added to `.env.local` — `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NEXTAUTH_SECRET` | All env vars confirmed present |
| **2026-05-02** | `NEXTAUTH_URL` corrected from `3000` → `3001` (dev server port conflict) | `http://localhost:3001` — matches GitHub callback URL |
| **2026-05-03** | End-to-end auth verification — sign-in flow, DB records, `access_token` | User + Account + Session created in DB. `access_token` starts with `gho_`. Scopes: `read:user, repo, user:email`. Session valid to 2026-06-02. |
| **2026-05-03** | Debug code added then cleaned up | `[ENV CHECK]` log + `/api/debug-session` endpoint removed after verification |

---

## Completed Features

| Merged | Branch | Scope |
|--------|--------|-------|
| **2026-03-16** | `feature/landing-page` | Full marketing landing page — PR #2 |
| **2026-03-18** | `feature/app-shell` | Sidebar, Topbar, `(app)` route-group layout, dashboard/settings placeholders — PR #3 |
| **2026-03-19** | `feature/dev-timeline-ui` | Timeline types, fake data, filters, app shell restoration, dashboard/settings/timeline routes |

---

## Update Template

When closing work, add a row with the **exact date** (`YYYY-MM-DD`). Use *(estimate)* only if the date is genuinely unknown.

| Date | Task | Scope | Files | Status | Notes |
|------|------|-------|-------|--------|-------|
| **YYYY-MM-DD** | Short task name | One-line description | `src/...` | ✅ done / 🔲 pending / 🔄 in progress | Key decisions, fixes, caveats |
