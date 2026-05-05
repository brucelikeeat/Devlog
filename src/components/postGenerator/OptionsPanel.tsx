"use client";

import { cn } from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────

type Platform = "x" | "linkedin" | "reddit";
type Tone = "casual" | "professional" | "feedback-seeking" | "educational";
type PrivacyLevel = "high" | "medium" | "low";

type Props = {
  selectedPlatforms: Platform[];
  tone: Tone;
  privacyLevel: PrivacyLevel;
  onPlatformsChange: (platforms: Platform[]) => void;
  onToneChange: (tone: string) => void;
  onPrivacyChange: (level: string) => void;
};

// ── Config ─────────────────────────────────────────────────────────────────

type PlatformCfg = { value: Platform; label: string; dot: string };

const PLATFORMS: PlatformCfg[] = [
  { value: "x",        label: "X (Twitter)", dot: "bg-zinc-100"    },
  { value: "linkedin", label: "LinkedIn",    dot: "bg-blue-500"    },
  { value: "reddit",   label: "Reddit",      dot: "bg-orange-500"  },
];

type ToneCfg = { value: Tone; label: string; desc: string };

const TONES: ToneCfg[] = [
  {
    value: "casual",
    label: "Casual",
    desc: "First-person, conversational — sounds like a person, not a press release",
  },
  {
    value: "professional",
    label: "Professional",
    desc: "Reflective and measured — polished narrative without the hype",
  },
  {
    value: "feedback-seeking",
    label: "Feedback-seeking",
    desc: "Ends with a genuine question to invite discussion",
  },
  {
    value: "educational",
    label: "Educational",
    desc: "Centers the lesson — broadly useful beyond this specific project",
  },
];

type PrivacyCfg = { value: PrivacyLevel; label: string; desc: string; accent: string };

const PRIVACY_LEVELS: PrivacyCfg[] = [
  {
    value: "high",
    label: "High",
    desc: "No code details or internal specifics",
    accent: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  },
  {
    value: "medium",
    label: "Medium",
    desc: "Outcomes and behavior only",
    accent: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  },
  {
    value: "low",
    label: "Low",
    desc: "Full technical detail",
    accent: "border-red-500/50 bg-red-500/10 text-red-300",
  },
];

// ── Section wrapper ─────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── OptionsPanel ────────────────────────────────────────────────────────────

export function OptionsPanel({
  selectedPlatforms,
  tone,
  privacyLevel,
  onPlatformsChange,
  onToneChange,
  onPrivacyChange,
}: Props) {
  const platformSet = new Set(selectedPlatforms);

  function togglePlatform(value: Platform) {
    if (platformSet.has(value)) {
      onPlatformsChange(selectedPlatforms.filter((p) => p !== value));
    } else {
      onPlatformsChange([...selectedPlatforms, value]);
    }
  }

  return (
    <div className="space-y-6">
      {/* Platforms */}
      <Section title="Platforms">
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(({ value, label, dot }) => {
            const active = platformSet.has(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => togglePlatform(value)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300",
                )}
              >
                <span className={cn("h-2 w-2 flex-shrink-0 rounded-full", dot)} />
                {label}
              </button>
            );
          })}
        </div>
        {selectedPlatforms.length === 0 && (
          <p className="text-[11px] text-amber-500/80">
            Select at least one platform to enable generation.
          </p>
        )}
      </Section>

      {/* Tone */}
      <Section title="Tone">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TONES.map(({ value, label, desc }) => {
            const active = tone === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onToneChange(value)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start rounded-md border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300",
                )}
              >
                <span className="text-sm font-medium">{label}</span>
                <span
                  className={cn(
                    "mt-1 text-[11px] leading-relaxed",
                    active ? "text-violet-400/70" : "text-zinc-600",
                  )}
                >
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Privacy level */}
      <Section title="Privacy level">
        <div className="grid grid-cols-3 gap-2">
          {PRIVACY_LEVELS.map(({ value, label, desc, accent }) => {
            const active = privacyLevel === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onPrivacyChange(value)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start rounded-md border px-3 py-2.5 text-left transition-colors",
                  active
                    ? accent
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300",
                )}
              >
                <span className="text-sm font-medium">{label}</span>
                <span
                  className={cn(
                    "mt-1 text-[11px] leading-relaxed",
                    active ? "opacity-70" : "text-zinc-600",
                  )}
                >
                  {desc}
                </span>
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
