import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import type { TimelineEntry } from "@/features/timeline/types";
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
    const session = await getServerSession(authOptions);
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

    // Internal HTTP fetch to GET /api/timeline (per task spec). The session
    // cookie is forwarded so /api/timeline's getServerSession() resolves to
    // the same user. Base URL prefers NEXTAUTH_URL, falls back to the
    // incoming request's origin.
    const reqUrl = new URL(request.url);
    const baseUrl =
      process.env.NEXTAUTH_URL?.trim() ||
      `${reqUrl.protocol}//${reqUrl.host}`;
    const cookieHeader = request.headers.get("cookie") ?? "";

    const timelineRes = await fetch(`${baseUrl}/api/timeline`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (!timelineRes.ok) {
      console.error(
        `[POST /api/posts/generate] /api/timeline returned ${timelineRes.status}`,
      );
      return NextResponse.json(
        {
          error: "Failed to generate posts",
          detail: `Failed to load timeline (HTTP ${timelineRes.status}).`,
        },
        { status: 500 },
      );
    }

    const allEntries = (await timelineRes.json()) as unknown;
    if (!Array.isArray(allEntries)) {
      return NextResponse.json(
        {
          error: "Failed to generate posts",
          detail: "Timeline response was not an array.",
        },
        { status: 500 },
      );
    }

    const wanted = new Set(body.timelineEntryIds);
    const selectedEntries = (allEntries as TimelineEntry[]).filter(
      (e) => wanted.has(e.id),
    );

    if (selectedEntries.length === 0) {
      return NextResponse.json(
        { error: "No matching timeline entries found" },
        { status: 400 },
      );
    }

    const enriched = await Promise.all(
      selectedEntries.map((entry) => enrichEvent(entry)),
    );
    const sanitized = enriched.map((e) =>
      sanitizeEvent(e, body.privacyLevel),
    );

    const anchor = pickAnchorEvent(sanitized);

    const results = await Promise.all(
      body.platforms.map((platform) =>
        withRetry(() => generatePost(anchor, platform, body.tone), 1, platform),
      ),
    );

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
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/posts/generate] failed:", message);
    return NextResponse.json(
      { error: "Failed to generate posts", detail: message },
      { status: 500 },
    );
  }
}
