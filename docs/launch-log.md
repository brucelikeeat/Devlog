# Launch Log

Tracks launch-phase milestones across all phases. Agents check boxes and append to "Agent Log" sections as steps complete.

---

## Phase 1 — Database Migration (SQLite → Supabase PostgreSQL)

| Step | Description | Status |
|------|-------------|--------|
| 1.1 | Read current state (schema, .env, prisma.ts, package.json) | ✅ done |
| 1.2 | Update `datasource` block in `schema.prisma` to `postgresql` + `directUrl` | ✅ done |
| 1.3 | Audit model fields — add `@db.Text` to OAuth token fields | ✅ done |
| 1.4 | Verify `.env` has `DATABASE_URL` and `DIRECT_URL` | ⚠️ blocked — see Agent Log |
| 1.5 | Run `prisma migrate dev --name switch-to-postgres` | ⚠️ blocked — see Agent Log |
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

**BLOCKED — manual action required.**

The `.env` file did not exist in this environment. It was created with correctly-structured placeholder URLs. You must replace both placeholders with your real Supabase connection strings before running the migration:

1. Go to Supabase dashboard → your project → **Settings → Database → Connection string**
2. Copy the **Transaction pooler** URL (port **6543**) → set as `DATABASE_URL`
3. Copy the **Direct connection** URL (port **5432**) → set as `DIRECT_URL`

`.env` format:
```
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

#### Step 1.5 — Migration result

**BLOCKED** — migration failed because `.env` contained placeholder (invalid) URLs:
```
Error: P1013: The provided database string is invalid. invalid domain character in database URL.
```
Once real Supabase URLs are in `.env`, run:
```bash
npx prisma migrate dev --name switch-to-postgres
```
This will create a new migration in `prisma/migrations/` and apply it to Supabase. The existing `20260326051942_init` SQLite migration will be superseded.

#### Step 1.6 — prisma generate + next build

- `npx prisma generate` — **✅ succeeded** — Prisma Client v5.22.0 generated from updated schema
- `npx next build` — **✅ succeeded** — compiled all 16 routes with zero Prisma-related errors

**Non-Prisma issues found during build (not fixed per instructions):**
- `[ENV CHECK]` debug log fires at static-page generation time — leftover debug code that `docs/agent-worklog.md` records as removed but is still present
- `/api/debug-session` route still exists in the build — same worklog entry says it was removed after auth verification but it remains

---

## Phase 2 — (pending)

---

## Phase 3 — (pending)

---

## Phase 4 — (pending)
