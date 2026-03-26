## Devlog – Build Journal

> A lightweight log of how Devlog itself is being built.

---

### Project Snapshot

- **Project**: Devlog – GitHub-powered development journal and content engine
- **Status**: App shell + timeline UI + **GitHub sign-in scaffold** (NextAuth/Prisma/repo picker) in tree; **full GitHub/production pass intentionally deferred** — see `docs/todo-github-integration.md`
- **Audience (current thesis)**:
  - Indie founders & solo SaaS builders
  - Open-source maintainers
  - Privacy-conscious teams who want internal build logs first, public posts second

---

### Day 1 – Framing the Product & README

**Date**: 2026-03-16

**What I did**

- Drafted a production-style `README.md` for Devlog, clarifying:
  - Core value: turn GitHub activity into a clean development timeline and optionally shareable posts
  - Architecture, tech stack, roadmap, and pricing (planned Free + Pro model)
- Incorporated early feedback about:
  - Privacy concerns (added repo-level privacy controls concept)
  - Desire for internal-only use (documenting the journey without public posting)
  - Need for platform-aware tone (e.g., feedback-seeking Reddit posts vs announcement-style X/LinkedIn posts)
- Added notes about an **interactive dev timeline UI** as a first-class part of the product vision.

**Why it matters**

- The README is now a clear "source of truth" for:
  - Who Devlog is for
  - What problems it solves
  - How it should feel (privacy-first, non-spammy, developer-focused)
- This gives a solid reference for future implementation decisions and for sharing the project with early users or collaborators.

**What I learned / decided**

- Branding should emphasize **development journaling first**, promotion second. That framing reduces spammy vibes and aligns with the name "Devlog".
- Privacy is not a "nice to have" – it's core to adoption for any serious project or startup codebase. Repo-level privacy modes need to exist from early versions.
- A commenter made it clear that **privacy is the differentiator**: most devs are interested *if* they can tightly control what gets exposed (e.g. only safe commit messages or aggregated stats instead of specific code changes).
- Another insight: good dev storytelling is more like personal blogs (e.g. Zen Habits) – focused on **outcomes and lessons**, not code dumps. Devlog should help users talk about what changed and what they learned, not just what files they touched.
- There is real interest in using Devlog purely as an automatic **build diary**, even without cross-platform posting. That's an important parallel use case.

**Potential X post draft (not yet published)**

> Building **Devlog**: a GitHub-powered dev journal that can also turn your commits into platform-ready posts.
>
> Spent today tightening the README and product vision: privacy controls, internal-only mode, and an interactive timeline of your build journey.
>
> Goal: help indie devs and OSS maintainers tell the story of what they ship, without writing from scratch every day.

---

### Day 2 – Scaffolding the App Shell

**Date**: 2026-03-17

**What I did**

- Set up the Next.js root layout with Geist font variables and a hardcoded dark-mode base.
- Created the `(app)` route group with a shared layout that offsets content for the fixed sidebar.
- Scaffolded three placeholder pages: **Dashboard** (stats grid, recent activity), **Timeline** (vertical spine, three entry types), and **Settings** (five collapsible section cards).
- All pages use static placeholder data — the goal was to get the shell working and navigable before building real data layers.

**Why it matters**

- Having navigable pages early makes every subsequent session more concrete. You're not building in a vacuum; you can open the browser and see the thing.
- The route-group pattern (`(app)`) means the sidebar and topbar layout is shared automatically — new pages get the shell for free.

**What I decided**

- Keep the app shell layout completely dumb for now: no auth, no session, no context. Just HTML + Tailwind.
- Placeholder pages are better than empty routes — they give future sessions an anchor to build on top of rather than starting from a blank file.

---

### Day 3 – Sidebar, Topbar, and Merging the App Shell

**Date**: 2026-03-18

**What I did**

- Built the **Sidebar**: 240px fixed panel with the Devlog logo, a dashed "No repo connected" CTA, main navigation (Dashboard, Timeline + three Soon-badged items), Settings link, and a user profile row at the bottom. Active state detection via `usePathname`.
- Built the **Topbar**: sticky h-14 header with page title + description, a cmd+K search shortcut button, notification bell with unread dot, and a user avatar.
- Opened and merged **PR #3** (`feature/app-shell → main`) — the app shell is now on main and deployable.

**Why it matters**

- The shell is the most important piece of the app to get right early. Every page builds inside it, and if the layout is broken, everything downstream looks broken.
- The "Soon" badges on unbuilt nav items (Content, Calendar, Analytics) communicate product direction without requiring those features to exist.

**What I learned**

- The `pl-60` offset on the content div is the simplest possible way to handle a fixed sidebar without a CSS grid or flexbox dance. Good enough for now.
- Getting a PR merged early — even if it's just UI scaffolding — creates a clean checkpoint. The main branch stays deployable from day one.

---

### Day 4 – Timeline UI Componentization

**Date**: 2026-03-19

**What I did**

- Opened `feature/dev-timeline-ui` and built the full timeline feature layer:
  - **`src/features/timeline/types.ts`** — discriminated union: `CommitEntry | PrEntry | ReleaseEntry`, plus `PostStatus`, `PrState`, and `TimelineFilterType`.
  - **`src/features/timeline/data.ts`** — 12 rich fake entries across 5 days of Devlog's own build history, with per-type metadata (hashes, diff stats, PR numbers, labels, release highlights).
  - **`src/features/timeline/useTimelineFilter.ts`** — client-side hook for live search and type filtering with per-tab counts.
  - **`src/components/timeline/TimelineEntryCard.tsx`** — full row component (spine icon node + card) handling all three entry types. Commit diff stats, PR state badges + labels, release highlight bullets, hover action bar.
  - **`src/components/timeline/TimelineFilters.tsx`** — search input with live clear, a filter button stub, type tabs with counts.
  - **`src/components/timeline/TimelineList.tsx`** — vertical spine, date-group headers (Today / Yesterday / Mar N), empty state.
  - **`src/components/timeline/TimelineView.tsx`** — `"use client"` wrapper composing the hook into filters + list.
  - Refactored `src/app/(app)/timeline/page.tsx` to a clean 9-line server component.
- Caught a missing `.gitignore` on `feature/dev-timeline-ui` (checked it out from main) before 22k node_modules files could be accidentally staged.

**Why it matters**

- The timeline is the core product surface — it needs to feel real before anything else. The componentized architecture means the fake data layer can be swapped for a real API response without touching any UI code.
- Date grouping ("Today", "Yesterday", "Mar 17") makes the feed feel alive rather than a flat list.
- Interactive filtering (search + type tabs) that actually works, even with fake data, makes the prototype feel like a real product in demos.

**What I decided**

- Keep the page as a server component and push all interactivity into `TimelineView`. This is the correct Next.js 14 App Router pattern — data fetching later happens server-side by default.
- Fake data lives in `features/timeline/data.ts`, not inline in the page or components. When real GitHub data comes in, only that file changes.

**What's next**

- GitHub OAuth + repo connection flow (`feature/github-oauth`).
- Real `TimelineEntry` objects sourced from GitHub API (commits, PRs, releases).
- Swap `TIMELINE_ENTRIES` for a server-fetched result passed into `TimelineView`.

---

### Day 5 – GitHub scaffold + intentional pause

**Date**: 2026-03-26

**What happened**

- Landed a **first-pass** GitHub integration: NextAuth (GitHub), Prisma/SQLite, per-user repo selection, optional live commits on the timeline, protected `(app)` routes and `/login`.
- **Decision:** Treat this as **good enough to keep in the tree** but **not** the final commercial integration. A **later session** (e.g. with a stronger implementation model) should own webhooks, token lifecycle, production Postgres, and hardening.

**Where to look**

- **Big TODO / handoff:** `docs/todo-github-integration.md`
- **Progress table:** `README.md` → Current Build Status
- **Coordination:** `docs/agent-worklog.md` → Paused / deferred

**What's next (when resuming)**

- Work from `docs/todo-github-integration.md`; avoid drive-by rewrites until that pass is scheduled.
