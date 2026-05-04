import type { EnrichedEvent } from "../enrichEvent";

type KnownTone = "casual" | "professional" | "feedback-seeking" | "educational";

const TONE_GUIDANCE: Record<KnownTone, string> = {
  casual:
    "Tone: casual. Punchy and direct. Sentence fragments are fine. Sound like a person, not a brand.",
  professional:
    "Tone: professional. Complete sentences, measured wording. No slang.",
  "feedback-seeking":
    "Tone: feedback-seeking. End with one short, genuine question (≤8 words). No \"thoughts?\".",
  educational:
    "Tone: educational. Lead with the insight in the first sentence — the takeaway IS the hook.",
};

const FALLBACK_TONE_GUIDANCE =
  "Tone: neutral. Punchy and factual. No slang, no marketing language.";

function toneInstruction(tone: string): string {
  const key = tone.trim().toLowerCase();
  if ((Object.keys(TONE_GUIDANCE) as KnownTone[]).includes(key as KnownTone)) {
    return TONE_GUIDANCE[key as KnownTone];
  }
  return FALLBACK_TONE_GUIDANCE;
}

function difficultyNote(
  difficulty: EnrichedEvent["difficulty"],
): string {
  if (difficulty === "significant") {
    return "Difficulty: significant — this was a non-trivial change. It's worth letting the post reflect that, but never inflate it.";
  }
  if (difficulty === "trivial") {
    return "Difficulty: trivial — keep the post understated. Do NOT make a small change sound heroic.";
  }
  return "Difficulty: moderate — match the size of the change without overselling.";
}

export function buildXPrompt(event: EnrichedEvent, tone: string): string {
  const { whatChanged, outcome, difficulty } = event;

  return [
    "You are writing a single X (Twitter) post for a developer sharing a recent change to their project.",
    "On X, the first 8 words decide whether someone keeps reading. The hook carries the post; everything else supports it.",
    "",
    "Source material — use these and ONLY these facts (do not invent metrics, names, or impact):",
    `- whatChanged: ${whatChanged}`,
    `- outcome: ${outcome}`,
    `- ${difficultyNote(difficulty)}`,
    "",
    toneInstruction(tone),
    "",
    "Hard requirements:",
    "- MAXIMUM 260 characters total, including any hashtags. (Hard X limit is 280; the 20-character buffer is for safety.)",
    "- The FIRST sentence is the hook — the single most interesting or surprising thing about this event. Make someone stop scrolling.",
    "- The hook MUST NOT start with the words \"I\", \"We\", or \"Just\". Lead with the OUTCOME or the PROBLEM instead.",
    "- After the hook, at most 1–2 short follow-up lines that add context. Cut anything that doesn't earn its characters.",
    "- 0–2 hashtags only. They must be relevant and specific (good: #buildinpublic, #webdev, #postgres). NEVER use generic spam tags like #coding, #developer, #tech, #programming, #software.",
    "- No emojis unless the tone is casual; even then, at most one.",
    "- No hype openers (\"Excited to share\", \"Thrilled to announce\", \"Big news\", etc.).",
    "- Single post — never a thread.",
    "- No links unless they appear verbatim in the source material.",
    "",
    "Self-check before responding:",
    "- Count the characters of your draft. If the total is over 260, rewrite it shorter and count again. Do this until you are at or under 260.",
    "- Verify the first word is NOT \"I\", \"We\", or \"Just\". If it is, rewrite the hook to lead with the outcome or the problem.",
    "",
    "Output format:",
    "- Return ONLY the post text.",
    "- No explanation, no character count, no preamble, no surrounding quotation marks, no Markdown code fences.",
  ].join("\n");
}
