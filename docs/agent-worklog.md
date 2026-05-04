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
| **2026-05-04** | Phase B — Post generator templates: LinkedIn prompt (`B.1`), Reddit prompt (`B.2`) |

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
| **B.2** — Reddit prompt template | Pure prompt builder for Reddit drafts (title + body, devlog voice — honest, self-aware, downvote-resistant) | `src/lib/postGenerator/templates/redditTemplate.ts` *(new)* | ✅ done | Exports `buildRedditPrompt(event, tone)`. Title ≤12 words on line 1, blank line, then body (tried → happened → learned → optional question). No hashtags. Banned vocab list (`excited`, `thrilled`, `game-changer`, `journey`, `passionate`, `leverage`, etc.). Tone variants: casual = informal/humor, professional = measured, feedback-seeking = ends with specific technical question, educational = lesson-framed. Always leans honest regardless of tone. Injects all 5 enriched fields including `difficulty` for calibration. |

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
