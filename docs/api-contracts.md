# API Contracts

This file tracks the public and internal API shapes that multiple features depend on.

Keep this updated whenever a route contract changes so parallel chats do not drift.

## Authentication (NextAuth.js)

Sign-in is handled by **NextAuth** under:

- `GET/POST /api/auth/*` (e.g. `GET /api/auth/signin/github`, `GET /api/auth/callback/github`)

GitHub OAuth App **Authorization callback URL** must be:

- Local: `http://localhost:3000/api/auth/callback/github`
- Production: `https://<your-domain>/api/auth/callback/github`

Requires env: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL`

User sessions and GitHub access tokens are stored via the **Prisma adapter** (database), not integration cookies.

## Implemented Endpoints

### `GET /api/github/status`

Purpose:
- Return the current GitHub connection status.

Response shape:

```ts
type GitHubConnectionStatus = {
  connected: boolean;
  user: { login: string; avatarUrl: string } | null;
  selectedRepo: string | null;
};
```

### `GET /api/github/repos`

Purpose:
- Fetch the authenticated user's GitHub repositories.
- Requires a signed-in NextAuth session and a valid GitHub `access_token` on the user's `Account` row.

Response: Array of GitHub repository objects (sorted by most recently pushed).

### `GET /api/github/repos/[owner]/[repo]/commits`

Purpose:
- Fetch recent commits for a specific repository.
- Returns up to 20 commits.

Response: Array of GitHub commit objects.

### `POST /api/github/select-repo`

Purpose:
- Persist the selected repository for the signed-in user (`User.selectedGithubRepo` in the database).
- Used by the repo picker UI.

Request body:

```ts
{ repo: string | null }
```

### `POST /api/github/disconnect`

Purpose:
- Clear `User.selectedGithubRepo` only (stop tracking a repository).
- Does not remove the GitHub OAuth link; use **Sign out** to end the app session.

### `GET /api/timeline`

Implemented: **May 2026** · Handler: `src/app/api/timeline/route.ts`

Purpose:
- Return timeline entries for the authenticated user's selected GitHub repo.
- Fetches commits, PRs, and releases in parallel, normalizes them, and sorts by date descending.

Auth: requires NextAuth session + GitHub access token on the `Account` row (both → 401 if missing).

Response — success (`200`): `TimelineEntry[]` sorted by `dateIso` descending.

```ts
// src/features/timeline/types.ts — actual discriminated union (not a flat object)
type EntryType = "commit" | "pr" | "release";
type PostStatus = "published" | "draft" | null;
type PrState = "open" | "merged" | "closed";

interface BaseEntry {
  id: string;
  title: string;
  summary: string;
  repo: string;
  branch: string;
  dateIso: string;       // ISO 8601 — used for grouping and sorting
  displayTime: string;   // human-readable label shown in the card
  postStatus: PostStatus;
}

interface CommitEntry extends BaseEntry {
  type: "commit";
  hash: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}

interface PrEntry extends BaseEntry {
  type: "pr";
  prNumber: number;
  state: PrState;
  labels: string[];
  commits: number;
  filesChanged: number;
}

interface ReleaseEntry extends BaseEntry {
  type: "release";
  version: string;
  highlights: string[];
  commits: number;
}

type TimelineEntry = CommitEntry | PrEntry | ReleaseEntry;
```

Other responses:
- `200` with `[]` if no repo is selected.
- `400` if `selectedGithubRepo` is not valid `owner/repo`.
- `500` with `{ error: "Failed to fetch timeline" }` on unexpected failure.

> **Note:** The `TimelineEntry` shape above (discriminated union with `type`, `repo`, `dateIso`, `postStatus`) is the real implemented shape. An older flat draft (`repoName`, `eventType`, `createdAt`, `privacyLevel`) previously listed here was stale and has been removed.

### `POST /api/posts/generate`

Implemented: **May 2026** · Handler: `src/app/api/posts/generate/route.ts`

Purpose:
- Generate platform-specific draft posts from one or more selected timeline entries using the Anthropic API (`claude-opus-4-7`).

Auth: requires NextAuth session (→ 401 if missing).

Request body:

```ts
type GeneratePostsRequest = {
  timelineEntryIds: string[];                                          // must be non-empty
  platforms: Array<"x" | "linkedin" | "reddit">;                      // must be non-empty subset
  tone: "casual" | "professional" | "feedback-seeking" | "educational";
  privacyLevel: "high" | "medium" | "low";
};
```

Response — success (`200`):

```ts
type GeneratedPost = {
  platform: "x" | "linkedin" | "reddit";
  content: string;
};
// returns GeneratedPost[]
```

Other responses:
- `400` if body is malformed or no matching timeline entries found.
- `500` on Anthropic failure or empty model response.

Requires env: `ANTHROPIC_API_KEY`

## Planned Endpoints

### `POST /api/github/webhook`

Purpose:
- Receive GitHub webhook events (not yet implemented).
- Validate signatures.
- Normalize events into Devlog's internal event format.

Expected request:
- GitHub webhook payload
- GitHub event headers

Expected response:
- `200 OK` for accepted events
- `4xx` for invalid signatures or malformed payloads

## Internal Modules

These are not HTTP endpoints but shared library contracts that multiple features depend on.

### `src/lib/postGenerator/enrichEvent.ts`

Added: **May 4, 2026**

Exports `EnrichedEvent` and `enrichEvent(entry: TimelineEntry): Promise<EnrichedEvent>`.

Calls Anthropic `claude-haiku-4-5-20251001` as a fast pre-pass to expand raw event data before post generation.

```ts
type EnrichmentDifficulty = "trivial" | "moderate" | "significant";

type EnrichedEvent = {
  originalEntry: TimelineEntry;
  whatChanged: string;      // what was actually built or fixed
  whyItMatters: string;     // user-facing or developer-facing impact
  technicalDetail: string;  // implementation specifics (filtered later by privacy level)
  outcome: string;          // what is now possible that wasn't before
  difficulty: EnrichmentDifficulty;
};
```

Fallback behavior: if `ANTHROPIC_API_KEY` is missing, Anthropic returns non-2xx, or JSON parsing fails, all fields fall back to values derived from the entry (`title`, `summary`). Never throws.

### `src/lib/postGenerator/sanitizeEvent.ts`

Added: **May 4, 2026**

Exports `sanitizeEvent(event: EnrichedEvent, privacyLevel: "high" | "medium" | "low"): EnrichedEvent`.

Pure, synchronous, no AI calls.

| Privacy level | Behavior |
|---|---|
| `"high"` | Blanks `technicalDetail`. Redacts file paths, function calls, variable tokens, and error messages in `whatChanged` and `outcome` with `[internal detail]`. |
| `"medium"` | Replaces `technicalDetail` with `"Implementation details hidden."`. Strips inline code, fenced code blocks, and stack-trace lines from all text fields. |
| `"low"` | Returns the event unchanged. |

