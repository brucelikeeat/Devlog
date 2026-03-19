# API Contracts

This file tracks the public and internal API shapes that multiple features depend on.

Keep this updated whenever a route contract changes so parallel chats do not drift.

## Planned Endpoints

### `POST /api/github/webhook`

Purpose:
- Receive GitHub webhook events.
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
