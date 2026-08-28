import type { EnrichedEvent } from "./enrichEvent";

type PrivacyLevel = "high" | "medium" | "low";

/**
 * Patterns that suggest technical internals: file paths, function/method calls,
 * variable-like tokens, error class names, and stack trace lines.
 */
const FILE_PATH_RE = /(\b[\w-]+\/)+[\w.-]+\.\w{1,6}/g;
const FUNCTION_CALL_RE = /\b[a-zA-Z_$][\w$]*\s*\(/g;
const VARIABLE_LIKE_RE = /\b(?:const|let|var|function|class|return|throw|new|import|export)\s+\w+/g;
const ERROR_MESSAGE_RE = /\b[A-Z][a-zA-Z]*(?:Error|Exception|Warning|Failure)\b[^.!?\n]*/g;
const CODE_SNIPPET_RE = /`[^`\n]{1,200}`|```[\s\S]*?```/g;
const STACK_TRACE_LINE_RE = /^\s+at\s+.+$/gm;

function stripCodeAndStackTraces(text: string): string {
  return text
    .replace(CODE_SNIPPET_RE, "[code snippet]")
    .replace(STACK_TRACE_LINE_RE, "")
    .trim();
}

function redactInternalDetails(text: string): string {
  let out = text;
  out = out.replace(FILE_PATH_RE, "[internal detail]");
  out = out.replace(FUNCTION_CALL_RE, "[internal detail](");
  out = out.replace(VARIABLE_LIKE_RE, "[internal detail]");
  out = out.replace(ERROR_MESSAGE_RE, "[internal detail]");
  out = out.replace(CODE_SNIPPET_RE, "[internal detail]");
  return out.trim();
}

function applyHigh(event: EnrichedEvent): EnrichedEvent {
  return {
    ...event,
    whatChanged: redactInternalDetails(event.whatChanged),
    technicalDetail: "",
    outcome: redactInternalDetails(event.outcome),
  };
}

function applyMedium(event: EnrichedEvent): EnrichedEvent {
  return {
    ...event,
    whatChanged: stripCodeAndStackTraces(event.whatChanged),
    whyItMatters: stripCodeAndStackTraces(event.whyItMatters),
    technicalDetail: "Implementation details hidden.",
    outcome: stripCodeAndStackTraces(event.outcome),
  };
}

export function sanitizeEvent(
  event: EnrichedEvent,
  privacyLevel: PrivacyLevel,
): EnrichedEvent {
  switch (privacyLevel) {
    case "high":
      return applyHigh(event);
    case "medium":
      return applyMedium(event);
    case "low":
      return event;
  }
}
