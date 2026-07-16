"use client";

import { useState } from "react";

const PRIVACY_OPTIONS = [
  {
    id: "high",
    name: "High Privacy",
    description:
      "Commit messages and high-level summaries only. No code, file paths, or implementation details in generated content.",
  },
  {
    id: "medium",
    name: "Medium Privacy",
    description:
      "Describes behavior and impact without exposing sensitive internals, algorithm details, or file paths.",
  },
  {
    id: "low",
    name: "Low Privacy",
    description:
      "Best for open-source. Allows specific feature mentions, links, and more technical detail in generated content.",
  },
] as const;

export function PrivacyControls() {
  const [selected, setSelected] = useState<(typeof PRIVACY_OPTIONS)[number]["id"]>("high");

  return (
    <div className="space-y-2" role="radiogroup" aria-label="Privacy level">
      {PRIVACY_OPTIONS.map((level) => {
        const isSelected = selected === level.id;
        return (
          <button
            key={level.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setSelected(level.id)}
            className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
              isSelected
                ? "border-violet-500/40 bg-violet-500/5"
                : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div
              className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                isSelected ? "border-violet-500 bg-violet-500" : "border-zinc-600"
              }`}
            >
              {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-200">{level.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                {level.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

const NOTIFICATION_OPTIONS = [
  {
    id: "drafts",
    label: "Post drafts ready",
    description: "When Devlog generates a new post from your GitHub activity",
    defaultEnabled: true,
  },
  {
    id: "digest",
    label: "Weekly digest",
    description: "A summary of your build activity every Monday",
    defaultEnabled: false,
  },
  {
    id: "publish",
    label: "Publishing confirmations",
    description: "When a post is successfully published to a platform",
    defaultEnabled: true,
  },
] as const;

export function NotificationToggles() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      NOTIFICATION_OPTIONS.map((o) => [o.id, o.defaultEnabled]),
    ),
  );

  return (
    <div className="space-y-4">
      {NOTIFICATION_OPTIONS.map((item) => {
        const on = enabled[item.id] ?? false;
        return (
          <div key={item.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-zinc-200">{item.label}</p>
              <p className="text-xs text-zinc-500">{item.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={item.label}
              onClick={() =>
                setEnabled((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
              }
              className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                on ? "bg-violet-500" : "bg-zinc-700"
              }`}
            >
              <div
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  on ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
