import type { EnrichedEvent } from "./enrichEvent";
import { buildLinkedInPrompt } from "./templates/linkedinTemplate";
import { buildXPrompt } from "./templates/xTemplate";
import { buildRedditPrompt } from "./templates/redditTemplate";

export type Platform = "x" | "linkedin" | "reddit";

export type GeneratedPost = {
  platform: Platform;
  content: string;
  characterCount: number;
};

const GENERATE_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const MAX_TOKENS = 1000;

const X_HARD_LIMIT = 280;
const X_SHORTEN_TARGET = 260;

function selectPromptBuilder(
  platform: Platform,
): (event: EnrichedEvent, tone: string) => string {
  switch (platform) {
    case "linkedin":
      return buildLinkedInPrompt;
    case "x":
      return buildXPrompt;
    case "reddit":
      return buildRedditPrompt;
  }
}

async function callAnthropic(
  apiKey: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): Promise<string> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: GENERATE_MODEL,
      max_tokens: MAX_TOKENS,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Anthropic ${res.status}${errText ? `: ${errText.slice(0, 200)}` : ""}`,
    );
  }

  const payload = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text =
    payload.content
      ?.filter((c) => c.type === "text" && typeof c.text === "string")
      .map((c) => c.text as string)
      .join("\n")
      .trim() ?? "";

  if (!text) {
    throw new Error("Empty model response.");
  }

  return text;
}

function cleanModelOutput(text: string): string {
  let out = text.trim();

  const fenced = out.match(/^```(?:\w+)?\s*([\s\S]*?)\s*```$/);
  if (fenced) out = fenced[1].trim();

  if (
    (out.startsWith('"') && out.endsWith('"')) ||
    (out.startsWith("“") && out.endsWith("”")) ||
    (out.startsWith("'") && out.endsWith("'"))
  ) {
    out = out.slice(1, -1).trim();
  }

  return out;
}

export async function generatePost(
  event: EnrichedEvent,
  platform: Platform,
  tone: string,
): Promise<GeneratedPost> {
  console.log("[generatePost] calling API for platform:", platform);
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set.");
    }

    const buildPrompt = selectPromptBuilder(platform);
    const prompt = buildPrompt(event, tone);

    let raw = await callAnthropic(apiKey, [{ role: "user", content: prompt }]);
    let content = cleanModelOutput(raw);

    if (platform === "x" && content.length > X_HARD_LIMIT) {
      const followUp = `The previous response was ${content.length} characters. Shorten it to under ${X_SHORTEN_TARGET} characters while keeping the hook. Return ONLY the shortened post text.`;

      raw = await callAnthropic(apiKey, [
        { role: "user", content: prompt },
        { role: "assistant", content },
        { role: "user", content: followUp },
      ]);
      content = cleanModelOutput(raw);
    }

    return {
      platform,
      content,
      characterCount: content.length,
    };
  } catch (err) {
    console.error("[generatePost] failed:", platform, err);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to generate ${platform} post: ${message}`);
  }
}
