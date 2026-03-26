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

### `GET /api/timeline`

Purpose:
- Return timeline entries for the authenticated user.

Expected response shape:

```ts
type TimelineEntry = {
  id: string;
  repoName: string;
  eventType: "commit" | "pull_request" | "release" | "milestone";
  title: string;
  summary: string;
  privacyLevel: "high" | "medium" | "low";
  createdAt: string;
};
```

### `POST /api/posts/generate`

Purpose:
- Generate platform-specific drafts from one or more timeline events.

Expected request shape:

```ts
type GeneratePostsRequest = {
  timelineEntryIds: string[];
  platforms: Array<"x" | "linkedin" | "reddit">;
  tone: "casual" | "professional" | "feedback-seeking" | "educational";
  privacyLevel: "high" | "medium" | "low";
};
```

Expected response shape:

```ts
type GeneratedPost = {
  platform: "x" | "linkedin" | "reddit";
  content: string;
};
```
