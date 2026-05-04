"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import type { TimelineEntry } from "@/features/timeline/types";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Platform = "x" | "linkedin" | "reddit";
type Tone = "casual" | "professional" | "feedback-seeking" | "educational";
type Privacy = "high" | "medium" | "low";

interface GeneratedPost {
  platform: Platform;
  content: string;
}

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "reddit", label: "Reddit" },
];

const TONES: { value: Tone; label: string; desc: string }[] = [
  { value: "casual", label: "Casual", desc: "Conversational and friendly" },
  { value: "professional", label: "Professional", desc: "Polished, clear narrative" },
  { value: "feedback-seeking", label: "Feedback-seeking", desc: "Invite reactions and thoughts" },
  { value: "educational", label: "Educational", desc: "Teach something from your experience" },
];

const PRIVACY_LEVELS: { value: Privacy; label: string; desc: string }[] = [
  { value: "high", label: "High", desc: "Outcomes only, no technical detail" },
  { value: "medium", label: "Medium", desc: "Behavior & outcomes, no implementation" },
  { value: "low", label: "Low", desc: "Full detail — code, architecture, specifics" },
];

const PLATFORM_LABELS: Record<Platform, string> = {
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  reddit: "Reddit",
};

function entryLabel(entry: TimelineEntry): string {
  const badge = entry.type === "commit" ? "commit" : entry.type === "pr" ? "PR" : "release";
  return `[${badge}] ${entry.title}`;
}

export default function GeneratePage() {
  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set());
  const [tone, setTone] = useState<Tone>("professional");
  const [privacy, setPrivacy] = useState<Privacy>("medium");

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [postContents, setPostContents] = useState<Record<Platform, string>>({
    x: "",
    linkedin: "",
    reddit: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/timeline");
        if (!res.ok) {
          setEventsError("Could not load events. Make sure you have a GitHub repo selected in Settings.");
          return;
        }
        const data: unknown = await res.json();
        setEvents(Array.isArray(data) ? (data as TimelineEntry[]) : []);
      } catch {
        setEventsError("Network error loading events.");
      } finally {
        setLoadingEvents(false);
      }
    }
    load();
  }, []);

  function toggleId(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function togglePlatform(p: Platform) {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }

  const canGenerate = selectedIds.size > 0 && selectedPlatforms.size > 0;

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    setGenerateError(null);
    setPosts([]);

    try {
      const res = await fetch("/api/posts/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          timelineEntryIds: Array.from(selectedIds),
          platforms: Array.from(selectedPlatforms),
          tone,
          privacyLevel: privacy,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setGenerateError(body?.error ?? "Generation failed. Please try again.");
        return;
      }

      const generated = (await res.json()) as GeneratedPost[];
      setPosts(generated);
      const initial: Record<Platform, string> = { x: "", linkedin: "", reddit: "" };
      for (const g of generated) {
        initial[g.platform] = g.content;
      }
      setPostContents(initial);
    } catch {
      setGenerateError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Generate Posts"
        description="Turn your recent dev events into shareable content"
      />
      <main className="flex-1 p-6 animate-fade-in space-y-8 max-w-3xl">

        {/* Step 1 — Select events */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            1 — Select events
          </h2>
          {loadingEvents ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading events…
            </div>
          ) : eventsError ? (
            <p className="text-sm text-amber-400">{eventsError}</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No events found.{" "}
              <a href="/settings" className="text-violet-400 hover:text-violet-300 transition-colors">
                Connect a repo in Settings
              </a>{" "}
              to get started.
            </p>
          ) : (
            <div className="space-y-1.5">
              {events.map((e) => (
                <label
                  key={e.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors",
                    selectedIds.has(e.id)
                      ? "border-violet-500/40 bg-violet-500/5 text-zinc-200"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300",
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 accent-violet-500"
                    checked={selectedIds.has(e.id)}
                    onChange={() => toggleId(e.id)}
                  />
                  <span className="min-w-0 truncate">{entryLabel(e)}</span>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* Step 2 — Platforms */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            2 — Platforms
          </h2>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => togglePlatform(value)}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                  selectedPlatforms.has(value)
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Step 3 — Tone */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            3 — Tone
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TONES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTone(value)}
                className={cn(
                  "flex flex-col items-start rounded-md border px-3 py-2.5 text-left transition-colors",
                  tone === value
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300",
                )}
              >
                <span className="text-sm font-medium">{label}</span>
                <span className="mt-0.5 text-[11px] text-zinc-600">{desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Step 4 — Privacy */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            4 — Privacy level
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {PRIVACY_LEVELS.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPrivacy(value)}
                className={cn(
                  "flex flex-col items-start rounded-md border px-3 py-2.5 text-left transition-colors",
                  privacy === value
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300",
                )}
              >
                <span className="text-sm font-medium">{label}</span>
                <span className="mt-0.5 text-[11px] text-zinc-600">{desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate || generating}
          className={cn(
            "flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors",
            canGenerate && !generating
              ? "bg-violet-600 text-white hover:bg-violet-500"
              : "cursor-not-allowed bg-zinc-800 text-zinc-600",
          )}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Posts
            </>
          )}
        </button>

        {generateError && (
          <p className="text-sm text-red-400">{generateError}</p>
        )}

        {/* Generated posts */}
        {posts.length > 0 && (
          <section className="space-y-6 border-t border-zinc-800 pt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Generated posts
            </h2>
            {posts.map(({ platform }) => (
              <div key={platform}>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  {PLATFORM_LABELS[platform]}
                  {platform === "x" && (
                    <span className="ml-2 text-xs text-zinc-600">
                      {postContents[platform].length}/280
                    </span>
                  )}
                </label>
                <textarea
                  value={postContents[platform]}
                  onChange={(e) =>
                    setPostContents((prev) => ({
                      ...prev,
                      [platform]: e.target.value,
                    }))
                  }
                  rows={platform === "x" ? 4 : 7}
                  className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
