import type { EnrichedEvent } from "../enrichEvent";

type KnownTone = "casual" | "professional" | "feedback-seeking" | "educational";

const TONE_GUIDANCE: Record<KnownTone, string> = {
  casual:
    "Tone: casual. Write in first person and keep it conversational, like talking to a friend who codes. A soft \"check it out\" line at the end is allowed if it feels natural.",
  professional:
    "Tone: professional. Be reflective and measured. Avoid slang. No \"check it out\" CTAs.",
  "feedback-seeking":
    "Tone: feedback-seeking. End the post with one genuine, open question that invites discussion (not a rhetorical one). No \"check it out\" CTAs.",
  educational:
    "Tone: educational. Center the takeaway and frame it as a broadly applicable lesson — useful even to someone who has never seen this codebase. No \"check it out\" CTAs.",
};

const FALLBACK_TONE_GUIDANCE =
  "Tone: neutral and reflective. Avoid slang and hype. No \"check it out\" CTAs.";

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
    return "Technical detail: (withheld — privacy level high; do NOT invent or infer specifics, keep the post outcome-focused).";
  }
  return `Technical detail: ${trimmed}`;
}

export function buildLinkedInPrompt(
  event: EnrichedEvent,
  tone: string,
): string {
  const { whatChanged, whyItMatters, outcome, technicalDetail } = event;

  return [
    "You are writing a single LinkedIn post for a software developer reflecting on their work.",
    "",
    "Source material — use these and ONLY these facts (do not fabricate metrics, names, or impact):",
    `- whatChanged: ${whatChanged}`,
    `- whyItMatters: ${whyItMatters}`,
    `- outcome: ${outcome}`,
    `- ${technicalDetailBlock(technicalDetail)}`,
    "",
    toneInstruction(tone),
    "",
    "Hard requirements:",
    "- Length: 150–300 words. Count words; do not exceed 300.",
    "- Structure (in this order):",
    "  1. ONE opening line that hooks with the problem or challenge. No hype openers.",
    "  2. 2–3 lines on what was built and how.",
    "  3. 1–2 lines on why it matters or what is different now.",
    "  4. ONE takeaway or lesson learned.",
    "  5. ONE soft closing line. No hard sell. No \"check it out\" unless the tone is casual.",
    "- Use plain line breaks between sections (LinkedIn-friendly), not Markdown.",
    "- At most 2 hashtags total, placed on the final line. Zero hashtags is fine.",
    "- NEVER start with \"I am excited to share\", \"Thrilled to announce\", \"Excited to announce\", \"Happy to share\", or any similar hype phrasing.",
    "- No emojis unless the tone is casual, and even then keep it to at most one.",
    "- Do not use exclamation marks more than once in the entire post.",
    "",
    "Output format:",
    "- Return ONLY the post text.",
    "- No explanation, no preamble, no surrounding quotation marks, no Markdown code fences.",
  ].join("\n");
}
