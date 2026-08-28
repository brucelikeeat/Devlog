# Documentation & product changelog

This file lists **major milestones** so anyone opening `docs/` can see **what changed and when**.  
For day-to-day task detail, see **`agent-worklog.md`**. For HTTP shapes, see **`api-contracts.md`**.

Entries are **newest first**. Dates use **ISO-style `YYYY-MM-DD`** when known; otherwise **`YYYY-MM`**.

---

## 2026-05-04

| Area | What changed |
|------|----------------|
| Post generator | **Phase A — enrichment layer:** `enrichEvent.ts` (Anthropic Haiku pre-pass), `sanitizeEvent.ts` (privacy levels). |
| Post generator | **Phase B.1 — LinkedIn prompt template:** `templates/linkedinTemplate.ts` (`buildLinkedInPrompt`) — story-arc structure, tone-aware, ≤2 hashtags, hype-opener block. |
| Post generator | **Phase B.2 — X prompt template:** `templates/xTemplate.ts` (`buildXPrompt`) — hook-first (first 8 words), ≤260 char hard cap, no `I`/`We`/`Just` openers, banned generic-spam hashtags, in-prompt char self-check. Replaces earlier same-day stub. |
| Post generator | **Phase B.3 — Reddit prompt template:** `templates/redditTemplate.ts` (`buildRedditPrompt`) — title + body, devlog voice, banned-vocab list, tone-aware, no hashtags, uses `difficulty` for calibration. *(Renumbered from B.2 → B.3 on the same day when the X template took B.2.)* |
| Post generator | **Phase C.1 — Core `generatePost`:** `generatePost.ts` (`Platform`, `GeneratedPost`, `generatePost`) — wires enricher + sanitizer + templates → Anthropic `claude-sonnet-4-6`, X retry-once-when-over-280 logic, throws `Failed to generate ${platform} post: ${message}` on any failure. |
| API| **Phase C.2 — `POST /api/posts/generate` rewritten:** route now drives the full pipeline (enrich → sanitize → anchor pick → parallel generation). **Response shape changed** from bare `GeneratedPost[]` to `{ posts: GeneratedPost[] }`, and each post now includes `characterCount`. Internal HTTP `fetch /api/timeline` (session cookie forwarded) replaces direct Prisma access. |
| App | **C.2-followup — Generator UI parse fixed:** `src/app/(app)/generate/page.tsx` now destructures `{ posts }` from the new `{ posts: GeneratedPost[] }` response envelope. One-line data-parsing change only; no UI, state, or other logic altered. |
| Docs | `api-contracts.md` — `POST /api/posts/generate` rewritten with new pipeline semantics, anchor-event rule, and updated response shape. Internal modules for enrich, sanitize, LinkedIn / X / Reddit templates, and `generatePost` documented. |
| Post generator | **C.3 — Retry wrapper + error resilience:** `withRetry.ts` (1 retry, 500 ms delay, returns `null` on total failure). Route now returns `207 { posts, failed }` on partial success and `500` only when all platforms fail. |
| UI | **D.1 — `EventSelector` component:** `src/components/postGenerator/EventSelector.tsx` — selectable timeline event cards; amber/violet/blue/emerald badges by type; summary truncated at 100 chars; "Select all / Deselect all" toggle; keyboard accessible. |

| UI | **D.2 — `OptionsPanel` component:** `src/components/postGenerator/OptionsPanel.tsx` — platform toggles (colored dots), 4-option tone selector with descriptions, 3-option privacy selector (emerald/amber/red accent per risk level). Fully controlled, `aria-pressed` on all toggles. |


| UI | **D.3 — `ResultsPanel` component:** `src/components/postGenerator/ResultsPanel.tsx` — auto-resize textareas, X char counter (red >280, amber >90%), clipboard copy with 2s "Copied!" feedback, per-platform Regenerate button with spinner. |

| UI | **D.4 — Generate page wired up:** `src/app/(app)/generate/page.tsx` rewritten — two-column desktop layout, all three D-components composed, generate + per-platform regenerate handlers, 207 partial-failure warning, scroll-to-results, loading skeleton. Sidebar nav unchanged (already had Generate). |
---

## 2026-05 (month; see `agent-worklog` for task IDs)

| Area | What changed |
|------|----------------|
| GitHub & timeline | **Phase 1:** Prisma/env checks, NextAuth audit, `src/lib/github` helpers, GitHub API routes audit. |
| GitHub & timeline | **Phase 2:** `fetchRepoPullRequests`, `fetchRepoReleases`, `normalizeEvents.ts`. |
| API | **`GET /api/timeline`** — commits + PRs + releases → `TimelineEntry[]`. |
| App | **Timeline page** wired to `/api/timeline` (server fetch with session). |
| Post generator | **`POST /api/posts/generate`** — Anthropic, platform drafts. |
| App | **Generate page** + sidebar link — select events, platforms, tone, privacy. |

- !!!! important, the next step is to improve the landing hero page and the timeline UI ( for the timeline UI i want it to be more interactive and heavier on the motion graphic side, like a galaxy kind of vibe where each star is a cahnge and they can form some kind of timeline with dates and user can click to check on each of them, and together they form something big and cool that user can feel a sense of accomplishment when seeing them)
- update pro plan idea(better post generations access to more niche platforms and analystics and also theres should be a limit for the number of post generated by free users like 20 posts? also how much should the pro plan be, 6.99? or 12.99? )
- Question: should I integrate a function where users can one click posts the content through our website or just leave it as of right now where user can just copy and paste the content from our website and post it to social media platforms themselevs, and if i want to integrate this functionality, how much effort do I have to put in such as " I might have to connect the API of each social media platform to my website and some of them I believe costs money.  
---

## 2026-03-19

| Area | What changed |
|------|----------------|
| App / UI | **`feature/dev-timeline-ui`** merged to `main` — timeline types, filters, demo data, dashboard/settings/timeline routes, app shell alignment. |

---

## 2026-03-18

| Area | What changed |
|------|----------------|
| App / UI | **`feature/app-shell`** merged to `main` — sidebar, topbar, `(app)` layout (PR #3). |

---

## 2026-03-16

| Area | What changed |
|------|----------------|
| Marketing | **`feature/landing-page`** merged to `main` — full marketing landing (PR #2). |

---

## Earlier foundation

| When | What |
|------|------|
| **2026-03** (approx.) | Initial Next.js app, Tailwind, Prisma, NextAuth (GitHub), ADR-0001 structure. |

---

## How to update this file

When you ship a **user-visible** or **contract-changing** milestone, add a **dated section** at the top (or append under the right month) with a short table. Link to PRs or commits when helpful.
