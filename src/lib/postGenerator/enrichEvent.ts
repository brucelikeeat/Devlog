import type { TimelineEntry } from "@/features/timeline/types";

export type EnrichmentDifficulty = "trivial" | "moderate" | "significant";

export type EnrichedEvent = {
  originalEntry: TimelineEntry;
  whatChanged: string;
  whyItMatters: string;
  technicalDetail: string;
  outcome: string;
  difficulty: EnrichmentDifficulty;
};

const ENRICH_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 600;

const DIFFICULTIES: readonly EnrichmentDifficulty[] = [
  "trivial",
  "moderate",
  "significant",
];

function describeEntry(entry: TimelineEntry): string {
  const lines: string[] = [
    `Type: ${entry.type}`,
    `Repo: ${entry.repo}`,
    `Branch: ${entry.branch}`,
    `Title: ${entry.title}`,
    `Summary: ${entry.summary}`,
  ];

  if (entry.type === "commit") {
    lines.push(
      `Hash: ${entry.hash}`,
      `Files changed: ${entry.filesChanged}`,
      `Additions: ${entry.additions}`,
      `Deletions: ${entry.deletions}`,
    );
  } else if (entry.type === "pr") {
    lines.push(
      `PR #${entry.prNumber}`,
      `State: ${entry.state}`,
      `Labels: ${entry.labels.join(", ") || "(none)"}`,
      `Commits: ${entry.commits}`,
      `Files changed: ${entry.filesChanged}`,
    );
  } else if (entry.type === "release") {
    lines.push(
      `Version: ${entry.version}`,
      `Highlights: ${entry.highlights.join("; ") || "(none)"}`,
      `Commits: ${entry.commits}`,
    );
  }

  return lines.join("\n");
}

function buildPrompt(entry: TimelineEntry): string {
  return [
    "You are analyzing a single software development event so it can later be turned into a social media post.",
    "Expand the raw event into richer context: what was actually built or fixed, the user-facing or developer-facing impact, the implementation specifics, and what is now possible that wasn't before.",
    "",
    "Event:",
    describeEntry(entry),
    "",
    "Rules:",
    '- "whatChanged": one sentence describing what was built or fixed.',
    '- "whyItMatters": one sentence on the user-facing or developer-facing impact.',
    '- "technicalDetail": implementation specifics (frameworks, files, approach). May include code-level detail; downstream code will filter by privacy level.',
    '- "outcome": what is now possible that wasn\'t before.',
    '- "difficulty": one of "trivial", "moderate", or "significant" based on perceived effort and risk.',
    "",
    "Return ONLY valid JSON with no markdown, no backticks, no preamble. Keys: whatChanged, whyItMatters, technicalDetail, outcome, difficulty",
  ].join("\n");
}

function extractJsonObject(text: string): unknown {
  let candidate = text.trim();

  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) candidate = fenced[1].trim();

  if (!candidate.startsWith("{")) {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("Model response did not contain a JSON object.");
    }
    candidate = candidate.slice(start, end + 1);
  }

  return JSON.parse(candidate);
}

function coerceEnrichment(
  value: unknown,
  entry: TimelineEntry,
): Omit<EnrichedEvent, "originalEntry"> {
  if (!value || typeof value !== "object") {
    throw new Error("Enrichment payload is not an object.");
  }
  const o = value as Record<string, unknown>;

  const whatChanged =
    typeof o.whatChanged === "string" && o.whatChanged.trim().length > 0
      ? o.whatChanged.trim()
      : entry.title;
  const whyItMatters =
    typeof o.whyItMatters === "string" && o.whyItMatters.trim().length > 0
      ? o.whyItMatters.trim()
      : entry.summary;
  const technicalDetail =
    typeof o.technicalDetail === "string" && o.technicalDetail.trim().length > 0
      ? o.technicalDetail.trim()
      : entry.summary;
  const outcome =
    typeof o.outcome === "string" && o.outcome.trim().length > 0
      ? o.outcome.trim()
      : entry.summary;

  const rawDifficulty =
    typeof o.difficulty === "string" ? o.difficulty.trim().toLowerCase() : "";
  const difficulty: EnrichmentDifficulty = (DIFFICULTIES as readonly string[]).includes(
    rawDifficulty,
  )
    ? (rawDifficulty as EnrichmentDifficulty)
    : "moderate";

  return { whatChanged, whyItMatters, technicalDetail, outcome, difficulty };
}

function fallbackEnrichment(entry: TimelineEntry): EnrichedEvent {
  return {
    originalEntry: entry,
    whatChanged: entry.title,
    whyItMatters: entry.summary,
    technicalDetail: entry.summary,
    outcome: entry.summary,
    difficulty: "moderate",
  };
}

export async function enrichEvent(entry: TimelineEntry): Promise<EnrichedEvent> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    console.error("[enrichEvent] ANTHROPIC_API_KEY is not set; using fallback.");
    return fallbackEnrichment(entry);
  }

  const prompt = buildPrompt(entry);

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: ENRICH_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(
        `[enrichEvent] Anthropic ${res.status} for entry ${entry.id}: ${errText}`,
      );
      return fallbackEnrichment(entry);
    }

    const payload = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text =
      payload.content
        ?.filter((c) => c.type === "text" && typeof c.text === "string")
        .map((c) => c.text as string)
        .join("\n") ?? "";

    if (!text) {
      console.error(`[enrichEvent] Empty model response for entry ${entry.id}.`);
      return fallbackEnrichment(entry);
    }

    const parsed = extractJsonObject(text);
    const fields = coerceEnrichment(parsed, entry);
    return { originalEntry: entry, ...fields };
  } catch (err) {
    console.error("[enrichEvent] failed:", err);
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[enrichEvent] Failed to enrich entry ${entry.id}: ${message}`,
    );
    return fallbackEnrichment(entry);
  }
}
