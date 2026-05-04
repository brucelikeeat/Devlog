import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
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
import type { TimelineEntry } from "@/features/timeline/types";
import { prisma } from "@/lib/prisma";
import { getGithubAccessTokenForUser } from "@/server/github/getGithubAccessToken";

const PLATFORMS = ["x", "linkedin", "reddit"] as const;
const TONES = ["casual", "professional", "feedback-seeking", "educational"] as const;
const PRIVACY = ["high", "medium", "low"] as const;

type Platform = (typeof PLATFORMS)[number];
type Tone = (typeof TONES)[number];
type Privacy = (typeof PRIVACY)[number];

interface GenerateBody {
  timelineEntryIds: string[];
  platforms: Platform[];
  tone: Tone;
  privacyLevel: Privacy;
}

interface GeneratedPost {
  platform: Platform;
  content: string;
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
    !b.platforms.every((p): p is Platform =>
      typeof p === "string" && (PLATFORMS as readonly string[]).includes(p),
    )
  ) {
    return null;
  }
  if (typeof b.tone !== "string" || !(TONES as readonly string[]).includes(b.tone)) {
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

async function loadTimelineForUser(userId: string): Promise<TimelineEntry[]> {
  const token = await getGithubAccessTokenForUser(userId);
  if (!token) return [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { selectedGithubRepo: true },
  });
  const selected = user?.selectedGithubRepo ?? null;
  if (!selected) return [];

  const [owner, repo] = selected.split("/", 2);
  if (!owner || !repo) return [];

  const [commits, pulls, releases] = await Promise.all([
    fetchRepoCommits(token, owner, repo),
    fetchRepoPullRequests(token, owner, repo),
    fetchRepoReleases(token, owner, repo),
  ]);

  const repoName = `${owner}/${repo}`;
  return [
    ...commits.map((c) => normalizeCommit(c, repoName)),
    ...pulls.map((p) => normalizePullRequest(p, repoName)),
    ...releases.map((r) => normalizeRelease(r, repoName)),
  ];
}

function buildPrompt(
  entries: TimelineEntry[],
  platforms: Platform[],
  tone: Tone,
  privacyLevel: Privacy,
): string {
  const eventLines = entries
    .map((e) => `- [${e.type}] ${e.title}: ${e.summary}`)
    .join("\n");

  return [
    "You are a developer content writer helping a software developer share their work on social media.",
    "",
    "Given these development events:",
    eventLines,
    "",
    `Generate one post per platform for these platforms: ${platforms.join(", ")}.`,
    `Tone: ${tone}.`,
    `Privacy level: ${privacyLevel}.`,
    "- high: no code details, no technical specifics, only high-level outcomes",
    "- medium: behavior and outcomes only, no implementation details",
    "- low: full detail including code, architecture, and specifics is fine",
    "",
    "Platform guidance:",
    "- x: max 280 characters, punchy, use 1-2 hashtags",
    "- linkedin: 3-5 sentences, professional narrative, no hashtag spam",
    "- reddit: conversational, honest, suitable for a devlog or programming subreddit",
    "",
    'Return ONLY a valid JSON array with no extra text: [{"platform": "x", "content": "..."}, ...]',
  ].join("\n");
}

function extractJsonArray(text: string): unknown {
  let candidate = text.trim();

  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) candidate = fenced[1].trim();

  if (!candidate.startsWith("[")) {
    const start = candidate.indexOf("[");
    const end = candidate.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Model response did not contain a JSON array.");
    }
    candidate = candidate.slice(start, end + 1);
  }

  return JSON.parse(candidate);
}

function validatePosts(value: unknown): GeneratedPost[] {
  if (!Array.isArray(value)) throw new Error("Model output is not an array.");
  return value.map((item, i) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Post ${i} is not an object.`);
    }
    const o = item as Record<string, unknown>;
    if (typeof o.platform !== "string" || typeof o.content !== "string") {
      throw new Error(`Post ${i} is missing platform/content strings.`);
    }
    if (!(PLATFORMS as readonly string[]).includes(o.platform)) {
      throw new Error(`Post ${i} has unknown platform "${o.platform}".`);
    }
    return { platform: o.platform as Platform, content: o.content };
  });
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
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const body = parseBody(raw);
    if (!body) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      console.error("[POST /api/posts/generate] ANTHROPIC_API_KEY is not set.");
      return NextResponse.json(
        { error: "Failed to generate posts" },
        { status: 500 },
      );
    }

    const allEntries = await loadTimelineForUser(session.user.id);
    const wanted = new Set(body.timelineEntryIds);
    const selected = allEntries.filter((e) => wanted.has(e.id));

    if (selected.length === 0) {
      return NextResponse.json(
        { error: "No matching timeline entries found." },
        { status: 400 },
      );
    }

    const prompt = buildPrompt(
      selected,
      body.platforms,
      body.tone,
      body.privacyLevel,
    );

    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-7",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error(
        `[POST /api/posts/generate] Anthropic ${anthropicRes.status}: ${errText}`,
      );
      return NextResponse.json(
        { error: "Failed to generate posts" },
        { status: 500 },
      );
    }

    const payload = (await anthropicRes.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text =
      payload.content
        ?.filter((c) => c.type === "text" && typeof c.text === "string")
        .map((c) => c.text as string)
        .join("\n") ?? "";

    if (!text) {
      console.error("[POST /api/posts/generate] Empty model response.");
      return NextResponse.json(
        { error: "Failed to generate posts" },
        { status: 500 },
      );
    }

    const posts = validatePosts(extractJsonArray(text));
    return NextResponse.json(posts);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/posts/generate] failed:", message);
    return NextResponse.json(
      { error: "Failed to generate posts" },
      { status: 500 },
    );
  }
}
