# Devlog — Launch Log

This file is the coordination log for the production launch of Devlog.
Every agent and every manual step must be recorded here as it completes.
No step is considered done until it is logged here.

## Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| Database | Supabase (PostgreSQL) | Replacing SQLite. Free tier. Familiar from other projects. |
| Hosting | Vercel | Native Next.js support, free tier, deploys from GitHub. |
| Launch scope | Core features only | Timeline + Post Generator live. Others disabled but described. |
| Pricing | Free tier only at launch | Pro plan visible but marked "Coming soon" — no Stripe yet. |
| Auth | GitHub OAuth only | No email/password. One OAuth App for production. |

---

## Feature Status at Launch

| Feature | Status | Notes |
|---------|--------|-------|
| GitHub OAuth sign-in | ✅ Live | Full NextAuth + Supabase session storage |
| Repo selection | ✅ Live | Per-user selectedGithubRepo stored in DB |
| Timeline view | ✅ Live | Commits, PRs, releases fetched from GitHub API |
| Post generator | ✅ Live | X, LinkedIn, Reddit via Anthropic API |
| Loading animation | ✅ Live | Pipeline visualizer overlay during generation |
| Landing page | ✅ Live | Full marketing page with animations |
| Pricing page | ✅ Live | Free tier active. Pro plan shown as "Coming soon" |
| Content calendar | 🔒 Disabled | UI hidden from nav. Planned for post-launch v0.2 |
| Analytics dashboard | 🔒 Disabled | UI hidden from nav. Planned for post-launch v0.2 |
| Publishing (direct post) | 🔒 Disabled | Posting directly to platforms not yet built. v0.3 |
| Webhooks | 🔒 Disabled | Real-time GitHub push ingestion. Not yet implemented. |
| Pro plan / Stripe | 🔒 Disabled | Payment flow not built. Pro CTA shows "Coming soon" |

---

## Phase 1 — Database Migration (SQLite → Supabase PostgreSQL)

**Owner:** Cursor Agent  
**Status:** ⬜ Not started

### Steps

- [ ] 1.1 — Agent: Update `prisma/schema.prisma` provider from `sqlite` to `postgresql`
- [ ] 1.2 — Agent: Verify all field types are Postgres-compatible (check for `@db.Text` needs)
- [ ] 1.3 — Agent: Update `DATABASE_URL` in `.env` to Supabase connection string
- [ ] 1.4 — Agent: Run `npx prisma migrate dev --name switch-to-postgres`
- [ ] 1.5 — Agent: Run `npx prisma generate`
- [ ] 1.6 — Agent: Confirm app boots without errors after migration

### Agent Log
<!-- Agent paste output and findings here -->

---

## Phase 2 — Production Hardening

**Owner:** Cursor Agent  
**Status:** ⬜ Not started

### Steps

- [ ] 2.1 — Agent: Scan for hardcoded `localhost` URLs in non-.env files
- [ ] 2.2 — Agent: Fix any `fetch("http://localhost...")` calls in API routes to use relative URLs
- [ ] 2.3 — Agent: Scan for `console.log` statements that may expose tokens, secrets, or user emails
- [ ] 2.4 — Agent: Remove or guard all sensitive logs behind `process.env.NODE_ENV !== "production"`
- [ ] 2.5 — Agent: Confirm `NEXTAUTH_URL` is read from env and not hardcoded anywhere
- [ ] 2.6 — Agent: Generate complete env variable checklist at `docs/env-checklist.md`

### Agent Log
<!-- Agent paste output and findings here -->

---

## Phase 3 — Disable Unbuilt Features

**Owner:** Cursor Agent  
**Status:** ⬜ Not started

### Steps

- [ ] 3.1 — Agent: Remove Content Calendar from sidebar navigation
- [ ] 3.2 — Agent: Remove Analytics Dashboard from sidebar navigation
- [ ] 3.3 — Agent: Update Pricing section — Pro plan CTA button changed to "Coming soon" (disabled, no link)
- [ ] 3.4 — Agent: Confirm no broken routes or 404s from removed nav items
- [ ] 3.5 — Agent: Add a `FEATURE_FLAGS.md` in docs listing what is disabled and why

### Agent Log
<!-- Agent paste output and findings here -->

---

## Phase 4 — Manual Steps (You)

**Owner:** You  
**Status:** ⬜ Not started

### Steps

- [ ] 4.1 — Create Supabase project at supabase.com → copy `DATABASE_URL` (Transaction mode pooler URL)
- [ ] 4.2 — Create production GitHub OAuth App at github.com/settings/developers
  - Homepage URL: `https://your-app.vercel.app`
  - Callback URL: `https://your-app.vercel.app/api/auth/callback/github`
- [ ] 4.3 — Generate `NEXTAUTH_SECRET` by running: `openssl rand -base64 32` in terminal
- [ ] 4.4 — Set Anthropic spend cap to $20/month at console.anthropic.com
- [ ] 4.5 — Push latest code to GitHub main branch
- [ ] 4.6 — Connect GitHub repo to Vercel at vercel.com/new
- [ ] 4.7 — Add all environment variables in Vercel dashboard (see `docs/env-checklist.md`)
- [ ] 4.8 — Trigger first Vercel deploy
- [ ] 4.9 — Update GitHub OAuth App URLs to match final Vercel domain

### Notes
<!-- Log what you did and any issues here -->

---

## Phase 5 — Pre-Launch Verification

**Owner:** Cursor Agent + You  
**Status:** ⬜ Not started

### Steps

- [ ] 5.1 — Agent: Write a pre-launch checklist prompt that tests every critical user flow
- [ ] 5.2 — You: Test sign in with GitHub on production URL
- [ ] 5.3 — You: Connect a repo and confirm timeline loads real data
- [ ] 5.4 — You: Generate a post and confirm Anthropic call works in production
- [ ] 5.5 — You: Check landing page, pricing page, and all nav links on mobile
- [ ] 5.6 — You: Confirm disabled features (calendar, analytics) do not appear in nav

### Notes
<!-- Log test results here -->

---

## Phase 6 — Launch

**Owner:** You  
**Status:** ⬜ Not started

### Steps

- [ ] 6.1 — Record a 60-second Loom: connect GitHub → see timeline → generate a post
- [ ] 6.2 — Post on r/SideProject and r/webdev (honest "I built this" post, no hype)
- [ ] 6.3 — Post on Indie Hackers "Show IH" thread
- [ ] 6.4 — Post a build-in-public thread on X/Twitter with #buildinpublic
- [ ] 6.5 — Share with 5-10 people personally for early feedback
- [ ] 6.6 — Product Hunt launch (after first round of bug fixes — not on day 1)

### Notes
<!-- Log launch posts and early feedback here -->

---

## Environment Variables (Production)

Fill this in after Phase 4 is complete. Never commit real values to git.

| Variable | Set on Vercel | Notes |
|----------|--------------|-------|
| `DATABASE_URL` | ⬜ | Supabase transaction pooler URL |
| `DIRECT_URL` | ⬜ | Supabase direct connection URL (needed for migrations) |
| `GITHUB_CLIENT_ID` | ⬜ | Production OAuth App |
| `GITHUB_CLIENT_SECRET` | ⬜ | Production OAuth App |
| `NEXTAUTH_SECRET` | ⬜ | Generated with openssl |
| `NEXTAUTH_URL` | ⬜ | Full production URL e.g. https://devlog.vercel.app |
| `ANTHROPIC_API_KEY` | ⬜ | From console.anthropic.com |

---

## Issues & Blockers

<!-- Log any problems that come up during any phase here -->
| Phase | Issue | Status | Resolution |
|-------|-------|--------|------------|
| | | | |

---

## Validation Metrics

After launch, track these to know if it's working:

| Metric | Target | Actual | Notes |
|--------|--------|--------|-------|
| Signups in first week | 10 | — | |
| Users who connect a repo | 7 | — | |
| Users who generate a post | 5 | — | |
| Users who return a second time | 3 | — | |
| Bug reports in first 48 hours | < 5 | — | |
