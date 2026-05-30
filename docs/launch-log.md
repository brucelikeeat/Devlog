# Launch Log

Tracks launch-phase milestones across all phases. Agents check boxes and append to "Agent Log" sections as steps complete.

---

## Phase 1 — Database Migration (SQLite → Supabase PostgreSQL)

| Step | Description | Status |
|------|-------------|--------|
| 1.1 | Read current state (schema, .env, prisma.ts, package.json) | ✅ done |
| 1.2 | Update `datasource` block in `schema.prisma` to `postgresql` + `directUrl` | ✅ done |
| 1.3 | Audit model fields — add `@db.Text` to OAuth token fields | ✅ done |
| 1.4 | Verify `.env` has `DATABASE_URL` and `DIRECT_URL` | ✅ done |
| 1.5 | Run `prisma migrate dev --name switch-to-postgres` | ✅ done |
| 1.6 | Run `prisma generate` + `next build` — confirm no Prisma errors | ✅ done |

---

### Agent Log — Phase 1

**Date:** 2026-05-29
**Branch:** `cursor/sqlite-to-supabase-postgres-2f13`

#### Files changed

| File | Change |
|------|--------|
| `prisma/schema.prisma` | `datasource` provider changed `sqlite` → `postgresql`; `directUrl = env("DIRECT_URL")` added; `Account.refresh_token`, `access_token`, `id_token` annotated with `@db.Text` |
| `.env` | **Created** (did not previously exist) — placeholder Supabase URLs inserted; needs real values from Supabase dashboard |
| `.env.example` | Updated `DATABASE_URL` comment + value from SQLite `file:./prisma/dev.db` → PostgreSQL pooler URL format; `DIRECT_URL` entry added |

#### Field audit results

**Account model:**
- `refresh_token String?` → `String? @db.Text` ✅ — OAuth refresh tokens exceed `varchar(191)` on Postgres
- `access_token String?` → `String? @db.Text` ✅ — GitHub PATs / OAuth tokens can exceed 191 chars
- `id_token String?` → `String? @db.Text` ✅ — OIDC JWTs are long
- All other `String?` fields (`token_type`, `scope`, `session_state`) are short-value fields — no `@db.Text` needed

**DateTime fields:**
- `Session.expires`, `User.emailVerified`, `VerificationToken.expires` — all use `DateTime` with no string defaults ✅

**Boolean fields:**
- None present in schema ✅

**Long text content fields (summaries, bodies):**
- Schema has no post/body content fields at this time — no additional `@db.Text` needed ✅

**NextAuth adapter table completeness:**
- `User` ✅ — `id`, `name`, `email`, `emailVerified`, `image`, `accounts`, `sessions`
- `Account` ✅ — all 12 required fields present
- `Session` ✅ — `id`, `sessionToken`, `userId`, `expires`, `user` relation
- `VerificationToken` ✅ — `identifier`, `token`, `expires`, `@@unique([identifier, token])`

#### Step 1.4 — .env status

**✅ COMPLETE.**

Real Supabase connection strings added to `.env` on **2026-05-30**:
- `DATABASE_URL` — Transaction pooler (`aws-1-us-east-2.pooler.supabase.com:6543`, IPv4 compatible)
- `DIRECT_URL` — Session pooler (`aws-1-us-east-2.pooler.supabase.com:5432`, IPv4 compatible)

Note: The Supabase dashboard shows the direct connection (port 5432 on `db.tziipxidkvyijwwvqrdl.supabase.co`) as "Not IPv4 compatible." The session pooler on the same host as the transaction pooler was used for `DIRECT_URL` instead — this is the correct approach for Prisma migrations when not on an IPv6 or IPv4-addon plan. The `&` in the password was percent-encoded as `%26` in both URLs.

#### Step 1.5 — Migration result

**✅ COMPLETE.**

The old SQLite migration history (`prisma/migrations/20260326051942_init/`) was removed since Prisma cannot migrate across provider types. A new PostgreSQL-native migration was created from scratch:

```
migrations/
  └─ 20260530210226_init_postgres/
    └─ migration.sql
```

Migration applied successfully to Supabase. All 4 NextAuth tables created with correct PostgreSQL types:
- `Account` — `refresh_token`, `access_token`, `id_token` as `TEXT` (from `@db.Text`)
- `Session` — `expires` as `TIMESTAMP(3)`
- `User` — `emailVerified` as `TIMESTAMP(3)`, `selectedGithubRepo` as `TEXT`
- `VerificationToken` — `expires` as `TIMESTAMP(3)`, both unique indexes applied

`npx next build` — ✅ passes cleanly after migration.

#### Step 1.6 — prisma generate + next build

- `npx prisma generate` — **✅ succeeded** — Prisma Client v5.22.0 generated from updated schema
- `npx next build` — **✅ succeeded** — compiled all 16 routes with zero Prisma-related errors

**Non-Prisma issues found during build (not fixed per instructions):**
- `[ENV CHECK]` debug log fires at static-page generation time — leftover debug code that `docs/agent-worklog.md` records as removed but is still present
- `/api/debug-session` route still exists in the build — same worklog entry says it was removed after auth verification but it remains

---

## Phase 2 — Production Hardening Audit

| Step | Description | Status |
|------|-------------|--------|
| 2.1 | Audit A — hardcoded localhost URLs | ✅ done |
| 2.2 | Audit B — sensitive data in console.log | ✅ done |
| 2.3 | Audit C — missing error boundaries in API routes | ✅ done (report only) |
| 2.3 | Audit D — exposed stack traces in API responses | ✅ done |
| 2.3 | Audit E — dead imports and unused files | ✅ done (report only) |
| 2.3 | Audit F — TypeScript `any` in critical files | ✅ done |
| 2.3 | Audit G — environment variable coverage | ✅ done |
| 2.4 | Fix pass — apply all required fixes | ✅ done |

---

### Agent Log — Phase 2

**Date:** 2026-05-29
**Branch:** `cursor/production-hardening-audit-2f13`

#### Files changed

| File | Change |
|------|--------|
| `src/app/api/auth/[...nextauth]/route.ts` | Wrapped `console.log("[ENV CHECK]", {...})` in `if (process.env.NODE_ENV !== "production")` guard |
| `src/lib/auth.ts` | Wrapped `console.log("[NextAuth signIn]", message)` in `if (process.env.NODE_ENV !== "production")` guard |
| `src/app/api/posts/generate/route.ts` | Replaced `detail: String(error)` with `NODE_ENV`-conditional: returns the raw string in dev, `"See server logs for details."` in production |

---

#### Audit A — Hardcoded localhost URLs

**Result: NONE FOUND.**

`rg "localhost" src/` returned zero matches. No hardcoded localhost fetch calls anywhere in `src/`.

---

#### Audit B — Sensitive data in console.log

**2 issues found and fixed:**

| File | Line | Statement | Problem | Fix applied |
|------|------|-----------|---------|-------------|
| `src/app/api/auth/[...nextauth]/route.ts` | 4 | `console.log("[ENV CHECK]", { hasClientId, hasClientSecret, hasSecret, nextAuthUrl, hasDatabaseUrl })` | Fires at module load time (including during `next build`); logs `NEXTAUTH_URL` value in plain text | Wrapped in `NODE_ENV !== "production"` guard |
| `src/lib/auth.ts` | 46 | `console.log("[NextAuth signIn]", message)` | NextAuth's `signIn` event `message` object contains `{ user, account, profile, isNewUser }`. The `account` field includes `access_token`, `refresh_token`, and `id_token` — live OAuth tokens written to logs on every sign-in | Wrapped in `NODE_ENV !== "production"` guard |

All other `console.log` and `console.error` calls reviewed:
- `[generate] step N` logs — log primitive values (booleans, counts, platform strings, IDs); no tokens or user PII
- `[generatePost] calling API for platform:` — logs platform name only
- `[enrichEvent]` error logs — log error messages, not tokens
- `[withRetry]` error log — logs error message string, not tokens
- `[NextAuth Error]` error log — appropriate; NextAuth error metadata does not contain raw tokens

---

#### Audit C — Missing error boundaries

**Report only — no fixes applied.**

The following API route handlers have no top-level try/catch and will return an unhandled 500 if their Prisma calls throw:

| File | Missing coverage |
|------|-----------------|
| `src/app/api/debug-session/route.ts` | Entire handler — no try/catch at all |
| `src/app/api/github/disconnect/route.ts` | `prisma.user.update` can throw (DB error, connection failure) |
| `src/app/api/github/select-repo/route.ts` | `request.json()` can throw on malformed body; `prisma.user.update` can throw |
| `src/app/api/github/status/route.ts` | `getGithubAccessTokenForUser` + `prisma.account.findFirst` can throw |
| `src/app/api/github/repos/route.ts` | Auth + token section outside try/catch; `getGithubAccessTokenForUser` can throw |
| `src/app/api/github/repos/[owner]/[repo]/commits/route.ts` | Same pattern as repos |

**Routes with adequate error handling:**
- `src/app/api/posts/generate/route.ts` — full outer try/catch ✅
- `src/app/api/timeline/route.ts` — delegates to `fetchTimelineEntries` which handles errors internally ✅
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler ✅

---

#### Audit D — Exposed stack traces

**1 issue found and fixed:**

| File | Line | Pattern | Fix applied |
|------|------|---------|-------------|
| `src/app/api/posts/generate/route.ts` | 267 | `detail: String(error)` in the outer catch block | Replaced with `NODE_ENV`-conditional: dev = `String(error)` (original), production = `"See server logs for details."`. The `console.error` that logs the full error is retained. |

**Additional security note (report only):**
- `src/app/api/debug-session/route.ts` — `return NextResponse.json({ session })` with no authentication guard returns the full NextAuth session object (user `id`, `name`, `email`, `image`, `selectedGithubRepo`, token expiry) to any unauthenticated caller. This route should be removed or protected.

---

#### Audit E — Dead imports and unused files

**Report only — nothing deleted.**

| File | Status | Reason |
|------|--------|--------|
| `src/features/github/mapCommitsToTimeline.ts` | ⚠️ Dead | Superseded by `normalizeEvents.ts`. Not imported anywhere. |
| `src/features/timeline/data.ts` | ⚠️ Dead | Fake timeline data for prototype. Not imported anywhere; real data comes from GitHub API. |
| `src/lib/github/index.ts` | ⚠️ Dead barrel | Not imported anywhere. All consumers import directly from `@/lib/github/api`, `@/lib/github/types`, `@/lib/github/normalizeEvents`. |
| `src/lib/github/oauth.ts` | ⚠️ Dead | Only re-exported by the unused barrel. `buildAuthUrl`, `exchangeCodeForToken`, `fetchAuthenticatedUser` are unused; OAuth is handled by NextAuth. |
| `src/components/timeline/TimelineView.tsx` | ⚠️ Dead | Superseded by `ConstellationTimeline`. Not imported outside `src/components/timeline/`. |
| `src/components/timeline/TimelineList.tsx` | ⚠️ Dead | Only used by `TimelineView` (dead). |
| `src/components/timeline/TimelineFilters.tsx` | ⚠️ Dead | Only used by `TimelineView` (dead). |
| `src/components/ui/timeline.tsx` | ⚠️ Dead | Only used by `TimelineView` (dead). |
| `src/features/timeline/useTimelineFilter.ts` | ⚠️ Dead | Only used by `TimelineView` (dead). |

No broken import paths found — all imports resolve to real files.

---

#### Audit F — TypeScript `any` in critical files

**Result: NONE FOUND.**

Checked all 5 files explicitly:
- `src/lib/postGenerator/generatePost.ts` — no `: any` ✅
- `src/lib/postGenerator/enrichEvent.ts` — no `: any` ✅
- `src/lib/github/normalizeEvents.ts` — no `: any` ✅
- `src/app/api/posts/generate/route.ts` — no `: any` ✅
- `src/app/api/timeline/route.ts` — no `: any` ✅

---

#### Audit G — Environment variable coverage

**Result: Full coverage — all code-accessed vars are in `.env`.**

| Variable | Used in code | In `.env` |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | `enrichEvent.ts`, `generatePost.ts` | ✅ |
| `DATABASE_URL` | `[...nextauth]/route.ts` (ENV CHECK) | ✅ |
| `GITHUB_CLIENT_ID` | `lib/auth.ts` | ✅ |
| `GITHUB_CLIENT_SECRET` | `lib/auth.ts` | ✅ |
| `NEXTAUTH_SECRET` | `lib/auth.ts` | ✅ |
| `NEXTAUTH_URL` | `[...nextauth]/route.ts` (ENV CHECK) | ✅ |
| `NODE_ENV` | Multiple files (guard conditions) | Built-in — auto-set by Next.js |
| `DIRECT_URL` | Not accessed via `process.env` in app code — used by Prisma engine only | ✅ |

**In `.env` but not referenced in app code:** `OPENAI_API_KEY` (present but unused), `REDIS_URL` (present but unused).

---

## Phase 3 — (pending)

---

## Phase 4 — (pending)
