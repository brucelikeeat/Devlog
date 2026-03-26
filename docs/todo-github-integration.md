# TODO: GitHub integration — deferred full pass

> **Status:** Intentionally paused. The codebase keeps the current scaffold (NextAuth + Prisma + repo picker + timeline wiring). A **later session with a stronger model** should own the next wave of GitHub work: hardening, webhooks, token lifecycle, and production readiness.

Do **not** delete the existing routes and UI without reading this list. Extend or replace deliberately.

---

## What exists today (leave as-is unless you are improving it)

- NextAuth **Sign in with GitHub** (`/login`, `/api/auth/*`)
- Prisma: `User`, `Account`, `Session`, `User.selectedGithubRepo`
- API: `/api/github/status`, `repos`, `repos/[owner]/[repo]/commits`, `select-repo`, `disconnect` (clears tracked repo only)
- Settings: GitHub section + repo list; Timeline: real commits when repo selected + session valid
- Docs: `docs/api-contracts.md`, `README.md` install steps

---

## TODO — production-grade GitHub integration (big list)

### Auth & security

- [ ] **OAuth `state` / CSRF** — confirm NextAuth defaults are sufficient; document any custom provider needs
- [ ] **Token storage** — encrypt `Account.access_token` at rest; support rotation / refresh if GitHub issues refresh tokens for the app type
- [ ] **Scope minimization** — audit `read:user user:email repo`; consider fine-grained tokens or GitHub App for org installs
- [ ] **Session hardening** — cookie flags, `NEXTAUTH_URL` / multi-env (preview deploys), `trustHost` where needed

### Data model & multi-tenancy

- [ ] **Multiple repos per user** (if product requires) — today: single `selectedGithubRepo` string
- [ ] **Org / team** models — if moving beyond single-user SaaS
- [ ] **Postgres in production** — migrate off default SQLite; connection pooling (e.g. Neon, Supabase)

### Ingestion (not built)

- [ ] **`POST /api/github/webhook`** — signature verification (HMAC), idempotency, event normalization
- [ ] **Background jobs** — queue (BullMQ / etc.) for heavy work; retries and dead-letter handling
- [ ] **PR / release / issue events** — map to `TimelineEntry` variants beyond commits

### API & UX correctness

- [ ] **Commit list vs commit detail** — GitHub list endpoint does not include per-commit `stats`/`files`; either fetch per SHA or adjust timeline UI to avoid misleading zeros
- [ ] **Default branch** — stop hard-coding `main` in `mapCommitsToTimeline` when showing branch metadata
- [ ] **Rate limits** — handle `403` / `429` from GitHub with user-visible messaging

### Observability & ops

- [ ] **Structured logging** for OAuth errors and GitHub API failures
- [ ] **Health check** route or admin status for “GitHub API reachable”

### Testing

- [ ] **Integration tests** — mock GitHub OAuth + API (or contract tests against recorded fixtures)
- [ ] **E2E** — sign-in → pick repo → timeline shows commits

---

## Suggested handoff for the next implementation chat

1. Read `docs/api-contracts.md` and this file.
2. Run `README` setup (`.env.local`, `prisma migrate dev`, GitHub OAuth callback URL).
3. Pick one vertical: **webhooks** *or* **token security** *or* **data model** — avoid rewriting everything at once.

---

## Owner

Deferred by project maintainer — resume when ready with a dedicated GitHub integration pass.
