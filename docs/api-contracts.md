# API Contracts

This file tracks the public and internal API shapes that multiple features depend on.

**Keep this updated whenever a route contract changes** so parallel chats and agents do not drift.

---

## Authentication (NextAuth.js)

> Added: **~Mar–Apr 2026**

Sign-in is handled by **NextAuth** under:

- `GET/POST /api/auth/*` (e.g. `GET /api/auth/signin/github`, `GET /api/auth/callback/github`)

GitHub OAuth App **Authorization callback URL** must be:

- Local: `http://localhost:3000/api/auth/callback/github`
- Production: `https://<your-domain>/api/auth/callback/github`

Required env vars: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL`

User sessions and GitHub access tokens are stored via the **Prisma adapter** (database), not session cookies.

---

## Implemented Endpoints

### `GET /api/github/status`

> Added: **~Mar–Apr 2026** · Handler: `src/app/api/github/status/route.ts`

Returns the current GitHub connection status for the signed-in user.

```ts
type GitHubConnectionStatus = {
  connected: boolean;
  user: { login: string; avatarUrl: string } | null;
  selectedRepo: string | null;
};
```

---

### `GET /api/github/repos`

> Added: **~Mar–Apr 2026** · Handler: `src/app/api/github/repos/route.ts`

Fetches the authenticated user's GitHub repositories, sorted by most recently pushed.

Requires: signed-in NextAuth session + valid GitHub `access_token` on the user's `Account` row.

Response: Array of GitHub repository objects.

---

### `GET /api/github/repos/[owner]/[repo]/commits`

> Added: **~Mar–Apr 2026** · Handler: `src/app/api/github/repos/[owner]/[repo]/commits/route.ts`

Fetches recent commits for a specific repository. Returns up to 20 commits.

Response: Array of GitHub commit objects.

---

### `POST /api/github/select-repo`

> Added: **~Mar–Apr 2026** · Handler: `src/app/api/github/select-repo/route.ts`

Persists the selected repository for the signed-in user (`User.selectedGithubRepo` in the database). Used by the repo picker UI.

Request body:

```ts
{ repo: string | null }
```

---

### `POST /api/github/disconnect`

> Added: **~Mar–Apr 2026** · Handler: `src/app/api/github/disconnect/route.ts`

Clears `User.selectedGithubRepo` only — stops tracking a repository without removing the GitHub OAuth link.
To fully end the session use **Sign out**.

---

### `GET /api/timeline`

> Added: **~May 2026** · Handler: `src/app/api/timeline/route.ts`

Returns timeline entries for the authenticated user's selected GitHub repo. Fetches commits, PRs, and releases in parallel, normalizes them, and returns the list sorted by date descending.

**Auth:** requires NextAuth session + GitHub access token on the `Account` row (either missing → 401).

**Response — success (`200`):** `TimelineEntry[]` sorted by `dateIso` descending.

```ts
// Full source: src/features/timeline/types.ts
// This is a discriminated union — not a flat object.

type PostStatus = "published" | "draft" | null;
type PrState   = "open" | "merged" | "closed";

interface BaseEntry {
  id:          string;
  title:       string;
  summary:     string;
  repo:        string;
  branch:      string;
  dateIso:     string;      // ISO 8601 — used for grouping and sorting
  displayTime: string;      // human-readable label shown in the card
  postStatus:  PostStatus;
}

interface CommitEntry extends BaseEntry {
  type:         "commit";
  hash:         string;
  filesChanged: number;
  additions:    number;
  deletions:    number;
}

interface PrEntry extends BaseEntry {
  type:         "pr";
  prNumber:     number;
  state:        PrState;
  labels:       string[];
  commits:      number;
  filesChanged: number;
}

interface ReleaseEntry extends BaseEntry {
  type:       "release";
  version:    string;
  highlights: string[];
  commits:    number;
}

type TimelineEntry = CommitEntry | PrEntry | ReleaseEntry;
```

**Other responses:**
- `200` with `[]` if no repo is selected.
- `400` if `selectedGithubRepo` is not a valid `owner/repo` string.
- `500` with `{ error: "Failed to fetch timeline" }` on unexpected failure.

> ⚠️ An older draft of this contract listed a flat shape with `repoName`, `eventType`, `createdAt`, and `privacyLevel`. That shape was never implemented and has been removed.

---

### `POST /api/posts/generate`

> Added: **~May 2026** (Task 4.1) · **Rewritten: 2026-05-04** (Task C.2) · Handler: `src/app/api/posts/generate/route.ts`

Generates platform-specific draft posts from one or more selected timeline entries by running the full post-generator pipeline:

1. Validate body → `400` on malformed input.
2. `getServerSession` → `401` if no session.
3. Internal HTTP `GET /api/timeline` (session cookie forwarded). Failure here surfaces as `500` with `detail`.
4. Filter entries by `timelineEntryIds`. If nothing matches → `400 { error: "No matching timeline entries found" }`.
5. `enrichEvent()` + `sanitizeEvent()` over **all** matched entries in parallel.
6. `pickAnchorEvent()` chooses one event to drive generation: highest `difficulty` first, then most recent `dateIso`. *(Why one anchor: see source comment — concatenating multiple events produces muddled, multi-topic posts.)*
7. `Promise.all` over `platforms` → `generatePost(anchor, platform, tone)` → Anthropic `claude-sonnet-4-6`.

**Auth:** requires NextAuth session (missing → `401`).

**Request body:**

```ts
type GeneratePostsRequest = {
  timelineEntryIds: string[];                                           // non-empty
  platforms:        Array<"x" | "linkedin" | "reddit">;                // non-empty subset
  tone:             "casual" | "professional" | "feedback-seeking" | "educational";
  privacyLevel:     "high" | "medium" | "low";
};
```

**Response — success (`200`):**

```ts
type GeneratedPost = {
  platform:       "x" | "linkedin" | "reddit";
  content:        string;
  characterCount: number;
};

type GeneratePostsResponse = {
  posts: GeneratedPost[];
};
```

> ⚠️ **Breaking change vs. Task 4.1.** The previous handler returned a **bare** `GeneratedPost[]` without `characterCount`. C.2 wraps the array in `{ posts }` and adds `characterCount` to each post. Any consumer reading the old shape needs to update.

**Other responses:**

| Status | Body | When |
|---|---|---|
| `400` | `{ error: "Invalid request body" }` | Body fails schema validation |
| `400` | `{ error: "No matching timeline entries found" }` | `timelineEntryIds` filter yields no entries from `/api/timeline` |
| `401` | `{ error: "Unauthorized" }` | No NextAuth session |
| `207` | `{ posts: GeneratedPost[], failed: Platform[] }` | Some but not all platforms generated successfully (partial success) |
| `500` | `{ error: "Failed to generate posts", detail: string }` | All platform generations failed, internal `/api/timeline` error, or any other thrown error |

**Retry behavior (Task C.3):** each platform generation is wrapped in `withRetry(..., 1, platform)` — on failure it waits 500 ms and retries once before logging and returning `null`. Platforms that return `null` end up in the `failed` array.

Required env: `ANTHROPIC_API_KEY` · also reads `NEXTAUTH_URL` to compute the internal `/api/timeline` base URL (falls back to the incoming request's origin).

---

## Planned Endpoints

### `POST /api/github/webhook`

> Status: **not yet implemented**

Receives GitHub webhook events, validates signatures, and normalizes them into Devlog's internal event format.

Expected request:
- GitHub webhook payload + event headers

Expected response:
- `200 OK` for accepted events
- `4xx` for invalid signatures or malformed payloads

---

## Internal Modules

These are not HTTP endpoints but shared library contracts that multiple features depend on.

---

### `src/lib/postGenerator/enrichEvent.ts`

> Added: **May 4, 2026**

Exports `EnrichedEvent` type and `enrichEvent(entry: TimelineEntry): Promise<EnrichedEvent>`.

Calls Anthropic `claude-haiku-4-5-20251001` as a fast pre-pass to expand raw event data before post generation.

```ts
type EnrichmentDifficulty = "trivial" | "moderate" | "significant";

type EnrichedEvent = {
  originalEntry:   TimelineEntry;
  whatChanged:     string;   // what was actually built or fixed
  whyItMatters:    string;   // user-facing or developer-facing impact
  technicalDetail: string;   // implementation specifics (filtered by privacy level downstream)
  outcome:         string;   // what is now possible that wasn't before
  difficulty:      EnrichmentDifficulty;
};
```

**Fallback behavior:** if `ANTHROPIC_API_KEY` is missing, Anthropic returns non-2xx, or JSON parsing fails, all text fields fall back to values from the entry (`title`, `summary`). The function never throws.

---

### `src/lib/postGenerator/sanitizeEvent.ts`

> Added: **May 4, 2026**

Exports `sanitizeEvent(event: EnrichedEvent, privacyLevel: "high" | "medium" | "low"): EnrichedEvent`.

Pure, synchronous — no AI calls, no async.

| Privacy level | Behavior |
|---|---|
| `"high"` | Blanks `technicalDetail`. Redacts file paths, function calls, variable-like tokens, and error messages in `whatChanged` and `outcome` → `[internal detail]`. |
| `"medium"` | Replaces `technicalDetail` with `"Implementation details hidden."`. Strips inline code, fenced code blocks, and stack-trace lines from all text fields. |
| `"low"` | Returns the event unchanged. |

---

### `src/lib/postGenerator/templates/linkedinTemplate.ts`

> Added: **May 4, 2026**

Exports `buildLinkedInPrompt(event: EnrichedEvent, tone: string): string`.

Pure, synchronous — builds the full prompt string used to generate a single LinkedIn draft. Does not call any model.

**Prompt enforces:**

- 150–300 word limit.
- Five-part story structure: (1) problem/challenge hook, (2) what was built and how, (3) why it matters / what changed, (4) takeaway, (5) soft closing line.
- ≤2 hashtags, on the final line only.
- Blocks hype openers (`"I am excited to share"`, `"Thrilled to announce"`, etc.).
- Returns post text only — no preamble, no surrounding quotes, no Markdown fences.

**Tone-specific guidance:**

| Tone | Effect |
|---|---|
| `"casual"` | First person, conversational. Soft `"check it out"` close allowed. |
| `"professional"` | Reflective, measured, no slang or CTAs. |
| `"feedback-seeking"` | Ends with a genuine open question. |
| `"educational"` | Centers a broadly applicable lesson. |
| *anything else* | Falls back to a neutral, reflective tone. |

**Privacy interaction:** if `event.technicalDetail` is empty (high-privacy sanitization), the prompt instructs the model not to invent specifics and to keep the post outcome-focused.

---

### `src/lib/postGenerator/templates/xTemplate.ts`

> Added: **May 4, 2026** *(replaced earlier B.3* stub on the same date)*

Exports `buildXPrompt(event: EnrichedEvent, tone: string): string`.

Pure, synchronous — builds the full prompt string used to generate a single X (Twitter) draft. Does not call any model.

The prompt's central principle: on X, the first 8 words decide whether someone keeps reading. Hook carries the post; everything else supports it.

**Hard requirements enforced by the prompt:**

- **Maximum 260 characters** total, including hashtags. (X's hard limit is 280; the 20-character buffer is for safety.)
- The first sentence is the hook — the single most interesting or surprising thing about the event.
- The hook **must NOT** start with `"I"`, `"We"`, or `"Just"`. Lead with the OUTCOME or the PROBLEM.
- After the hook, at most **1–2 short follow-up lines**.
- **0–2 hashtags**, relevant and specific. Generic spam tags are explicitly banned: `#coding`, `#developer`, `#tech`, `#programming`, `#software`.
- Hype openers blocked (`"Excited to share"`, `"Thrilled to announce"`, `"Big news"`, etc.).
- Single post — never a thread.
- Self-check loop in the prompt: count characters before responding; if over 260, rewrite shorter and count again. Also re-verify the first word is not `"I"`, `"We"`, or `"Just"`.
- Returns post text only — no preamble, no character count, no surrounding quotes, no Markdown fences.

**Tone-specific guidance:**

| Tone | Effect |
|---|---|
| `"casual"` | Punchy, direct, sentence fragments allowed. |
| `"professional"` | Complete sentences, measured wording, no slang. |
| `"feedback-seeking"` | Ends with one short genuine question (≤8 words). |
| `"educational"` | Leads with the insight — the takeaway IS the hook. |
| *anything else* | Neutral, punchy, factual. |

**Inputs used:** only `whatChanged`, `outcome`, and `difficulty` (intentionally narrower than LinkedIn/Reddit — keeps the post tight and avoids accidental detail leaks). `whyItMatters` and `technicalDetail` are not injected.

**`difficulty` calibration:**

| Value | Effect |
|---|---|
| `"significant"` | Worth letting the post reflect that, but never inflate. |
| `"moderate"` | Match the size of the change without overselling. |
| `"trivial"` | Keep the post understated — do not make a small change sound heroic. |

---

### `src/lib/postGenerator/templates/redditTemplate.ts`

> Added: **May 4, 2026**

Exports `buildRedditPrompt(event: EnrichedEvent, tone: string): string`.

Pure, synchronous — builds the full prompt string used to generate a single Reddit draft for r/programming, r/webdev, or r/devlog. Does not call any model.

**Output format enforced by the prompt:**

```
<title line — ≤12 words, factual>
<one blank line>
<body — flowing prose, paragraph breaks>
```

No hashtags, no Markdown code fences, no surrounding quotes.

**Body structure required:**

1. What I was trying to do.
2. What actually happened (including struggles or surprises).
3. What I learned or what's next.
4. *(Optional)* One genuine question for the community — required if tone is `"feedback-seeking"`.

**Voice rules (apply regardless of tone):**

- Always lean honest and self-aware — Reddit downvotes marketing language.
- Banned vocabulary: `excited`, `thrilled`, `game-changer`, `journey`, `passionate`, `leverage`, `synergy`, `revolutionary`, `cutting-edge`, `delighted`, `stoked`, plus startup/LinkedIn-style phrasing in general.

**Tone-specific guidance:**

| Tone | Effect |
|---|---|
| `"casual"` | More informal, light self-deprecating humor allowed. |
| `"professional"` | Measured and structured — still honest, no jokes. |
| `"feedback-seeking"` | Body must end with a specific technical question. |
| `"educational"` | Frames the post as a lesson someone less experienced could learn from. |
| *anything else* | Falls back to neutral, factual, self-aware. |

**Inputs used:** all five enriched fields — `whatChanged`, `whyItMatters`, `technicalDetail`, `outcome`, and `difficulty` (the last calibrates how big a deal the post should sound; `"trivial"` should not sound heroic).

**Privacy interaction:** if `event.technicalDetail` is empty (high-privacy sanitization), the prompt forbids inventing specifics, file names, or stack traces and keeps the post about experience and outcome.

---

### `src/lib/postGenerator/withRetry.ts`

> Added: **May 4, 2026**

Exports `withRetry<T>(fn: () => Promise<T>, retries?: number, label?: string): Promise<T | null>`.

Generic retry wrapper used by `POST /api/posts/generate` to isolate per-platform failures without crashing the whole request.

**Behavior:**
- Calls `fn()`.
- On throw: waits **500 ms**, then retries up to `retries` times (default `1` — so 2 total attempts).
- If all attempts throw: logs `[withRetry:${label}] failed after N attempt(s): ${message}` and returns `null` (does **not** rethrow).
- On success: returns the resolved value of `fn()`.

**Returns `null` instead of throwing** — this is deliberate. Callers (the route) check for `null` to decide between partial success (`207`) and total failure (`500`).

---

### `src/lib/postGenerator/generatePost.ts`

> Added: **May 4, 2026**

Exports the `Platform` type, the `GeneratedPost` type, and the async function `generatePost(event, platform, tone): Promise<GeneratedPost>`.

```ts
type Platform = "x" | "linkedin" | "reddit";

type GeneratedPost = {
  platform:       Platform;
  content:        string;
  characterCount: number;
};
```

**Behavior:**

1. Reads `ANTHROPIC_API_KEY` from env (trimmed); throws if missing.
2. Selects the prompt builder for the platform via an exhaustive switch (`buildLinkedInPrompt` / `buildXPrompt` / `buildRedditPrompt`).
3. Calls `POST https://api.anthropic.com/v1/messages` with model `claude-sonnet-4-6`, `max_tokens: 1000`, headers `x-api-key` + `anthropic-version: 2023-06-01`.
4. Extracts text from `content[].text` items, trims, and strips Markdown code fences and any surrounding straight or curly quotes.
5. **X retry:** if `platform === "x"` and the cleaned content exceeds **280** characters, makes one follow-up call that includes the original prompt, the previous assistant response, and a user message:
   *"The previous response was N characters. Shorten it to under 260 characters while keeping the hook."* Retries **once only**.
6. Returns `{ platform, content, characterCount: content.length }`.

**Error handling:** every failure path (missing API key, non-2xx Anthropic response, empty content, network throw) is wrapped in `try/catch` and rethrown as `Error("Failed to generate ${platform} post: ${message}")`. The function does **not** silently fall back to placeholder text — callers decide how to surface the error.
