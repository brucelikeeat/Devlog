# Agent Worklog

This file is the shared coordination log for feature branches and focused implementation chats.

## Rule

Every `feature/*` branch must update this file in its first meaningful commit so future chats and agents can see:

- what branch is active,
- what area is being changed,
- which files or folders are expected to be touched,
- and any API or integration assumptions.

## Active Work

| Branch | Owner / Chat | Scope | Files Touched | Status | Notes |
|--------|---------------|-------|----------------|--------|-------|
| — | — | *None — GitHub integration deferred; see `docs/todo-github-integration.md`* | — | — | Resume in a future focused chat when ready. |

## Paused / deferred

| Branch | Scope | Notes |
|--------|--------|-------|
| `feature/github-integration` | NextAuth (GitHub) + Prisma + repo picker + timeline commits; login gate on `(app)` | **Code left as-is.** Full production pass deferred — revisit with a stronger model. Checklist: `docs/todo-github-integration.md`. |

## Completed

| Branch | Merged | Scope | Notes |
|--------|--------|-------|-------|
| `feature/dev-timeline-ui` | Mar 19, 2026 → `main` | Timeline types, fake data, filters, app shell restoration, dashboard/settings/timeline routes, Tailwind/Next scaffold fixes | Merged locally into `main`; branch can be deleted after push |
| `feature/app-shell` | Mar 18, 2026 → `main` | Sidebar, Topbar, (app) route-group layout, dashboard/settings placeholders | PR #3 |
| `feature/landing-page` | Mar 16, 2026 → `main` | Full marketing landing page | PR #2 |

## Update Template

Copy this row format for new feature branches:

| `feature/your-feature` | Chat name or owner | Short description of the feature | `src/features/...`, `src/components/...` | planned / in progress / blocked / done | Any dependencies or assumptions |
