import type { EnrichedEvent } from "../enrichEvent";

type KnownTone = "casual" | "professional" | "feedback-seeking" | "educational";

const TONE_GUIDANCE: Record<KnownTone, string> = {
  casual:
    "Tone: casual. More informal phrasing is fine; light self-deprecating humor is welcome if it fits. Stay honest — do not become flippant.",
  professional:
    "Tone: professional. Still honest and self-aware, but more measured and structured. No slang, no jokes.",
  "feedback-seeking":
    "Tone: feedback-seeking. End the body with ONE specific, technical question that someone in the subreddit could actually answer (not a vague \"thoughts?\").",
  educational:
    "Tone: educational. Frame the whole post as a lesson you learned, written so a less-experienced developer reading the thread could take something useful away.",
};

const FALLBACK_TONE_GUIDANCE =
  "Tone: neutral. Stay honest, factual, and self-aware. No slang, no marketing language.";

const BANNED_WORDS = [
  "excited",
  "thrilled",
  "game-changer",
  "game changer",
  "journey",
  "passionate",
  "leverage",
  "synergy",
  "revolutionary",
  "cutting-edge",
  "delighted",
  "stoked",
];

function toneInstruction(tone: string): string {
  const key = tone.trim().toLowerCase();
  if ((Object.keys(TONE_GUIDANCE) as KnownTone[]).includes(key as KnownTone)) {
    return TONE_GUIDANCE[key as KnownTone];
  }
  return FALLBACK_TONE_GUIDANCE;
}

function technicalDetailBlock(technicalDetail: string): string {
  const trimmed = technicalDetail.trim();
  if (!trimmed) {
    return "Technical detail: (withheld — privacy level high; do NOT invent specifics, file names, or stack traces. Keep the post about the experience and outcome.)";
  }
  return `Technical detail: ${trimmed}`;
}

export function buildRedditPrompt(
  event: EnrichedEvent,
  tone: string,
): string {
  const { whatChanged, whyItMatters, technicalDetail, outcome, difficulty } =
    event;

  return [
    "You are writing a single Reddit post for a developer sharing a recent change to their project.",
    "The post should fit naturally in r/programming, r/webdev, or r/devlog — communities that downvote marketing language and reward honest, self-aware writing.",
    "",
    "Source material — use these and ONLY these facts (do not invent metrics, library names, or outcomes):",
    `- whatChanged: ${whatChanged}`,
    `- whyItMatters: ${whyItMatters}`,
    `- ${technicalDetailBlock(technicalDetail)}`,
    `- outcome: ${outcome}`,
    `- difficulty: ${difficulty}  (use this to calibrate how big a deal you make this — \"trivial\" should not sound heroic)`,
    "",
    toneInstruction(tone),
    "",
    "Voice rules (apply regardless of tone):",
    "- Always lean honest and self-aware. Reddit rewards vulnerability over polish.",
    "- Be willing to mention what was confusing, what didn't work the first time, or what surprised you.",
    "- Sound like a person typing in a thread, not a press release.",
    "",
    "Banned vocabulary — do NOT use any of these words or close variants:",
    `  ${BANNED_WORDS.join(", ")}.`,
    "Avoid all startup/LinkedIn-style vocabulary in general.",
    "",
    "Hard requirements:",
    "- Title:",
    "  - First line of the output, with NO prefix like \"Title:\".",
    "  - At most 12 words.",
    "  - Factual, not clickbait. No emojis. No ALL CAPS. No question marks unless the post genuinely asks the community something.",
    "- Body structure (in this order, as flowing prose with paragraph breaks — not bullet headings):",
    "  1. What I was trying to do.",
    "  2. What actually happened, including any struggles or surprises.",
    "  3. What I learned or what's next.",
    "  4. (Optional) ONE genuine question for the community. Required if the tone is feedback-seeking.",
    "- No hashtags anywhere.",
    "- No links unless they appear verbatim in the source material.",
    "- No emojis except where the casual tone would naturally include one (max one for the entire post).",
    "",
    "Output format (exactly this shape):",
    "  <title line>",
    "  <one blank line>",
    "  <body>",
    "Return ONLY that. No preamble, no explanation, no surrounding quotation marks, no Markdown code fences.",
  ].join("\n");
}
