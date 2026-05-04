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
| Docs | `api-contracts.md` — internal modules for enrich, sanitize, LinkedIn template, X template, Reddit template, and `generatePost` documented. |

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
