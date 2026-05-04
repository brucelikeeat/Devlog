# Architecture

| | |
|---|---|
| **Last reviewed** | **2026-05** |
| **Related** | [`CHANGELOG.md`](./CHANGELOG.md) · [`agent-worklog.md`](./agent-worklog.md) |

## Goal

Keep Devlog easy to ship as a single Next.js application today while preserving a clean path to a future monorepo split if backend complexity grows.

## Significant updates (dated)

| Date | Summary |
|------|---------|
| **2026-05** | GitHub pipeline: PR/release fetch, event normalizer, **`GET /api/timeline`**, timeline UI wired to API. Post generator: **`POST /api/posts/generate`**, generate UI, enrich + sanitize layer. |
| **2026-03** | Landing page, app shell, timeline UI merged to `main` (see [`CHANGELOG.md`](./CHANGELOG.md)). |
| **2026-03** | ADR-0001: single-app structure with `src/app` / `components` / `features` / `lib` / `server` (see [`decisions/ADR-0001-project-structure.md`](./decisions/ADR-0001-project-structure.md)). |

## Current Structure Choice

Option A: single application with clear internal boundaries.

### High-level layers

- `src/app`
  - Routes, layouts, and route-level API handlers.
- `src/components`
  - Reusable UI components grouped by interface area.
- `src/features`
  - Feature-level modules and orchestration for product domains.
- `src/lib`
  - Shared infrastructure helpers, SDK clients, utilities, and framework-independent helpers.
- `src/server`
  - Server-only business logic, repositories, jobs, and schemas.

## Core product domains

- `github`
  - OAuth, repo selection, webhook ingestion, event normalization.
- `timeline`
  - Internal devlog feed, timeline grouping, progress views.
  - Current implementation includes `types.ts`, `data.ts`, `useTimelineFilter.ts`, and UI components in `src/components/timeline/`; live data from **`GET /api/timeline`** as of **2026-05**.
- `privacy`
  - Repo privacy levels, sanitization rules, post visibility policies.
- `post-generator`
  - AI summaries, platform-specific drafts, tone modes.
- `publishing`
  - Scheduling, status tracking, platform posting workflows.
- `analytics`
  - Content performance, consistency metrics, post insights.

## Migration Path

If Devlog outgrows the single-app structure, the likely split is:

- `apps/web` for UI and app routes
- `apps/api` for webhook handling and AI orchestration
- `packages/*` for shared UI, prompts, types, and SDK utilities

That future split should preserve current domain boundaries rather than rewrite them.
