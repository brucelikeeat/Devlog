# Architecture

## Goal

Keep Devlog easy to ship as a single Next.js application today while preserving a clean path to a future monorepo split if backend complexity grows.

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
  - **Progress (Mar 2026):** A first-pass scaffold exists in the app (NextAuth + Prisma + API routes + settings/timeline wiring). A **full production integration** (webhooks, token hardening, etc.) is **deferred**; see `docs/todo-github-integration.md`.
- `timeline`
  - Internal devlog feed, timeline grouping, progress views.
  - Internal devlog feed, timeline grouping, progress views.
  - Current implementation includes `types.ts`, `data.ts`, `useTimelineFilter.ts`, and UI components in `src/components/timeline/`.
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
