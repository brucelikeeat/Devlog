import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TimelineEntry } from "@/features/timeline/types";
import {
  fetchRepoCommits,
  fetchRepoPullRequests,
  fetchRepoReleases,
} from "@/lib/github/api";
import {
  normalizeCommit,
  normalizePullRequest,
  normalizeRelease,
} from "@/lib/github/normalizeEvents";
import { getGithubAccessTokenForUser } from "@/server/github/getGithubAccessToken";
import {
  enrichEvent,
  type EnrichedEvent,
} from "@/lib/postGenerator/enrichEvent";
import { sanitizeEvent } from "@/lib/postGenerator/sanitizeEvent";
import {
  generatePost,
  type GeneratedPost,
  type Platform,
} from "@/lib/postGenerator/generatePost";
import { withRetry } from "@/lib/postGenerator/withRetry";

const PLATFORMS = ["x", "linkedin", "reddit"] as const;
const TONES = [
  "casual",
  "professional",
  "feedback-seeking",
  "educational",
] as const;
const PRIVACY = ["high", "medium", "low"] as const;

type Tone = (typeof TONES)[number];
type Privacy = (typeof PRIVACY)[number];

interface GenerateBody {
  timelineEntryIds: string[];
  platforms: Platform[];
  tone: Tone;
  privacyLevel: Privacy;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function parseBody(raw: unknown): GenerateBody | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;

  if (!isStringArray(b.timelineEntryIds) || b.timelineEntryIds.length === 0) {
    return null;
  }

  if (
    !Array.isArray(b.platforms) ||
    b.platforms.length === 0 ||
    !b.platforms.every(
      (p): p is Platform =>
        typeof p === "string" && (PLATFORMS as readonly string[]).includes(p),
    )
  ) {
    return null;
  }

  if (
    typeof b.tone !== "string" ||
    !(TONES as readonly string[]).includes(b.tone)
  ) {
    return null;
  }
  if (
    typeof b.privacyLevel !== "string" ||
    !(PRIVACY as readonly string[]).includes(b.privacyLevel)
  ) {
    return null;
  }

  return {
    timelineEntryIds: b.timelineEntryIds,
    platforms: b.platforms as Platform[],
    tone: b.tone as Tone,
    privacyLevel: b.privacyLevel as Privacy,
  };
}

const DIFFICULTY_RANK: Record<EnrichedEvent["difficulty"], number> = {
  trivial: 0,
  moderate: 1,
  significant: 2,
};

/**
 * Pick the single "anchor" event to drive generation when the user has
 * selected multiple timeline entries.
 *
 * Why one anchor instead of merging all selected events into the prompt:
 * - Concatenating multiple events into one post tends to produce muddled,
 *   multi-topic drafts that read like a status report, not a hook.
 * - Each platform template is tuned to a single thesis (X = one hook,
 *   LinkedIn = one story arc, Reddit = one title + body).
 *
 * Selection rule:
 *   1. Highest difficulty wins (significant > moderate > trivial).
 *   2. On a tie, the most recent entry by `dateIso` wins.
 *
 * A future task may swap this for a multi-event narrative generator.
 */
function pickAnchorEvent(events: EnrichedEvent[]): EnrichedEvent {
  return [...events].sort((a, b) => {
    const rankDelta =
      DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty];
    if (rankDelta !== 0) return rankDelta;
    return b.originalEntry.dateIso.localeCompare(a.originalEntry.dateIso);
  })[0];
}

export async function POST(request: Request) {
  try {
    console.log("[generate] step 1 — request received");

    const session = await getServerSession(authOptions);
    console.log("[generate] step 3 — session:", !!session);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const body = parseBody(raw);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    console.log("[generate] step 2 — body:", {
      timelineEntryIds: body.timelineEntryIds,
      platforms: body.platforms,
      tone: body.tone,
      privacyLevel: body.privacyLevel,
    });

    // Load timeline directly — no internal HTTP call (loopback self-fetch is
    // unreliable in Next.js dev mode and causes ECONNREFUSED). This mirrors
    // the logic in GET /api/timeline.
    console.log("[generate] step 4 — timeline fetch starting");

    const token = await getGithubAccessTokenForUser(session.user.id);
    if (!token) {
      return NextResponse.json(
        { error: "No GitHub token on file. Sign in again with GitHub." },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedGithubRepo: true },
    });
    const selected = user?.selectedGithubRepo ?? null;
    if (!selected) {
      return NextResponse.json(
        { error: "No matching timeline entries found" },
        { status: 400 },
      );
    }

    const [owner, repo] = selected.split("/", 2);
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "No matching timeline entries found" },
        { status: 400 },
      );
    }

    const [commits, pulls, releases] = await Promise.all([
      fetchRepoCommits(token, owner, repo),
      fetchRepoPullRequests(token, owner, repo),
      fetchRepoReleases(token, owner, repo),
    ]);

    const repoName = `${owner}/${repo}`;
    const allEntries: TimelineEntry[] = [
      ...commits.map((c) => normalizeCommit(c, repoName)),
      ...pulls.map((p) => normalizePullRequest(p, repoName)),
      ...releases.map((r) => normalizeRelease(r, repoName)),
    ];

    const wanted = new Set(body.timelineEntryIds);
    const selectedEntries = allEntries.filter((e) => wanted.has(e.id));

    console.log("[generate] step 5 — timeline entries found:", selectedEntries.length);

    if (selectedEntries.length === 0) {
      return NextResponse.json(
        { error: "No matching timeline entries found" },
        { status: 400 },
      );
    }

    console.log("[generate] step 7 — enrichment starting");
    const enriched = await Promise.all(
      selectedEntries.map((entry) => enrichEvent(entry)),
    );

    console.log("[generate] step 8 — sanitization starting");
    const sanitized = enriched.map((e) =>
      sanitizeEvent(e, body.privacyLevel),
    );

    const anchor = pickAnchorEvent(sanitized);
    console.log("[generate] step 6 — anchor event:", anchor?.originalEntry?.id);

    console.log("[generate] step 9 — generation starting for platforms:", body.platforms);
    const results = await Promise.all(
      body.platforms.map((platform) =>
        withRetry(() => generatePost(anchor, platform, body.tone), 1, platform),
      ),
    );

    console.log("[generate] step 10 — results:", results);

    const posts: GeneratedPost[] = [];
    const failed: Platform[] = [];
    for (let i = 0; i < body.platforms.length; i++) {
      const result = results[i];
      if (result !== null) {
        posts.push(result);
      } else {
        failed.push(body.platforms[i]);
      }
    }

    if (posts.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to generate posts",
          detail: `All platform generations failed: ${failed.join(", ")}.`,
        },
        { status: 500 },
      );
    }

    if (failed.length > 0) {
      return NextResponse.json({ posts, failed }, { status: 207 });
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[generate] FAILED at unknown step:", error);
    return NextResponse.json(
      { error: "Failed to generate posts", detail: String(error) },
      { status: 500 },
    );
  }
}
