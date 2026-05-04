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

> Added: **~May 2026** · Handler: `src/app/api/posts/generate/route.ts`

Generates platform-specific draft posts from one or more selected timeline entries using the Anthropic API (`claude-opus-4-7`).

**Auth:** requires NextAuth session (missing → 401).

**Request body:**

```ts
type GeneratePostsRequest = {
  timelineEntryIds: string[];                                           // non-empty
  platforms:        Array<"x" | "linkedin" | "reddit">;                // non-empty subset
  tone:             "casual" | "professional" | "feedback-seeking" | "educational";
  privacyLevel:     "high" | "medium" | "low";
};
```

**Response — success (`200`):** `GeneratedPost[]`

```ts
type GeneratedPost = {
  platform: "x" | "linkedin" | "reddit";
  content:  string;
};
```

**Other responses:**
- `400` if body is malformed or no matching timeline entries are found.
- `500` on Anthropic failure or empty model response.

Required env: `ANTHROPIC_API_KEY`

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
