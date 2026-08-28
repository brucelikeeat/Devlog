# AGENTS.md

Guidance for AI agents working in this repository.

## Cursor Cloud specific instructions

### Product

Devlog is a single Next.js 14 app (not a monorepo). One process (`npm run dev` or `npm start`) serves the UI and all API routes. SQLite via Prisma stores users/sessions; GitHub OAuth and Anthropic APIs are external.

### Update script vs manual setup

The VM **update script** only runs `npm install` (which triggers `postinstall` → `prisma generate`). It does **not** start services, run migrations, or create `.env.local`.

On a **fresh clone**, after `npm install`:

1. `cp .env.example .env.local` and fill secrets (see README).
2. Apply DB migrations (see SQLite note below).
3. Start the dev server (see Running).

### SQLite `DATABASE_URL` gotcha

Prisma CLI resolves SQLite paths **relative to `prisma/schema.prisma`**, while the Next.js app resolves them **relative to the repo root**. The example `file:./prisma/dev.db` can create `prisma/prisma/dev.db` when using the CLI but `prisma/dev.db` at runtime.

**Recommended for Cloud Agents:** use an absolute path in `.env.local`, e.g. `DATABASE_URL="file:/workspace/prisma/dev.db"`, then run migrations with that file sourced:

```bash
set -a && source .env.local && set +a && npx prisma migrate deploy
```

### Running the dev server

Use a dedicated tmux session (do not rely on one-shot background shells):

```bash
SESSION_NAME="devlog-dev"
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=$SESSION_NAME" 2>/dev/null \
  || tmux -f /exec-daemon/tmux.portal.conf new-session -d -s "$SESSION_NAME" -c /workspace -- "${SHELL:-bash}" -l
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "$SESSION_NAME:0.0" 'cd /workspace && npm run dev' C-m
```

App URL: http://localhost:3000

### Lint / typecheck / build

See `package.json` scripts: `npm run lint`, `npm run type-check`, `npm run build`. There is no `test` script or `tests/` directory in the repo today.

### What works without secrets

| Flow | Requirements |
|------|----------------|
| Landing, marketing UI | Dev server only |
| Login UI | Dev server + placeholder or real `GITHUB_*` + `NEXTAUTH_*` |
| GitHub sign-in, timeline, generate | Real GitHub OAuth app + user session; generate also needs `ANTHROPIC_API_KEY` |

Protected app routes (e.g. `/timeline`, `/dashboard`) redirect to `/login` when unauthenticated.

### Optional / unused today

`REDIS_URL`, `OPENAI_API_KEY`, and Postgres are documented in `.env.example` but not used by current `src/` code. No Docker Compose or separate worker process.
