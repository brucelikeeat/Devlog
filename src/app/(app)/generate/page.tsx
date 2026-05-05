"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { EventSelector } from "@/components/postGenerator/EventSelector";
import { OptionsPanel } from "@/components/postGenerator/OptionsPanel";
import { ResultsPanel } from "@/components/postGenerator/ResultsPanel";
import GeneratingOverlay from "@/components/postGenerator/loading/GeneratingOverlay";
import { cn } from "@/lib/utils/cn";
import type { TimelineEntry } from "@/features/timeline/types";

// ── Types ──────────────────────────────────────────────────────────────────

type Platform = "x" | "linkedin" | "reddit";
type Tone = "casual" | "professional" | "feedback-seeking" | "educational";
type PrivacyLevel = "high" | "medium" | "low";

type GeneratedPost = {
  platform: Platform;
  content: string;
  characterCount: number;
};

type GenerateResponse =
  | { posts: GeneratedPost[]; failed?: Platform[] }
  | { error: string; detail?: string };

// ── Loading skeleton ───────────────────────────────────────────────────────

function EventSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-20 rounded-xl border border-zinc-800 bg-zinc-900/40"
        />
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function GeneratePage() {
  // ── Data ──
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Selections ──
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>(["linkedin"]);
  const [tone, setTone] = useState<Tone>("casual");
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>("medium");

  // ── Generation ──
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState<Platform[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [partialFailures, setPartialFailures] = useState<Platform[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);

  // ── Load timeline ──────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/timeline");
        if (!res.ok) {
          setLoadError(
            "Could not load events. Make sure you have a GitHub repo selected in Settings.",
          );
          return;
        }
        const data: unknown = await res.json();
        setEntries(Array.isArray(data) ? (data as TimelineEntry[]) : []);
      } catch {
        setLoadError("Network error loading events.");
      } finally {
        setLoadingEntries(false);
      }
    }
    load();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────

  function buildRequestBody(overridePlatforms: Platform[]) {
    return {
      timelineEntryIds: selectedIds,
      platforms: overridePlatforms,
      tone,
      privacyLevel,
    };
  }

  function mergeIntoPost(
    prev: GeneratedPost[],
    incoming: GeneratedPost[],
  ): GeneratedPost[] {
    const map = new Map(prev.map((p) => [p.platform, p]));
    for (const p of incoming) map.set(p.platform, p);
    return Array.from(map.values());
  }

  async function callGenerateApi(
    body: object,
  ): Promise<GenerateResponse | null> {
    const res = await fetch("/api/posts/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => null)) as GenerateResponse | null;

    if (!res.ok && res.status !== 207) {
      return data;
    }
    return data;
  }

  // ── Generate all ───────────────────────────────────────────────────────

  const canGenerate = selectedIds.length > 0 && platforms.length > 0;

  async function handleGenerate() {
    if (!canGenerate || generating) return;
    setGenerating(true);
    setError(null);
    setPartialFailures([]);

    try {
      const data = await callGenerateApi(buildRequestBody(platforms));

      if (!data || "error" in data) {
        setError(
          (data as { error?: string } | null)?.error ??
            "Generation failed. Please try again.",
        );
        return;
      }

      setPosts(data.posts);
      setPartialFailures(data.failed ?? []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  // ── Regenerate one platform ────────────────────────────────────────────

  async function handleRegenerate(platform: Platform) {
    if (regenerating.includes(platform)) return;
    setRegenerating((prev) => [...prev, platform]);
    setError(null);

    try {
      const data = await callGenerateApi(buildRequestBody([platform]));

      if (!data || "error" in data) {
        setError(
          (data as { error?: string } | null)?.error ??
            `Failed to regenerate ${platform} post.`,
        );
        return;
      }

      setPosts((prev) => mergeIntoPost(prev, data.posts));
      // Remove platform from failures if it now succeeded
      if (data.posts.some((p) => p.platform === platform)) {
        setPartialFailures((prev) => prev.filter((f) => f !== platform));
      }
    } catch {
      setError(`Network error regenerating ${platform} post.`);
    } finally {
      setRegenerating((prev) => prev.filter((p) => p !== platform));
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen flex-col">
      <GeneratingOverlay
        isVisible={generating}
        onComplete={() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      <Topbar
        title="Generate Posts"
        description="Turn your recent dev events into shareable content"
      />

      <main className="flex-1 animate-fade-in p-6">
        <div className="mx-auto max-w-6xl">

          {/* Two-column grid on large screens */}
          <div className="grid gap-8 lg:grid-cols-[1fr,1.25fr]">

            {/* ── Left: event selector ── */}
            <section className="min-w-0">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                1 — Select events
              </h2>

              {loadingEntries ? (
                <EventSkeleton />
              ) : loadError ? (
                <p className="text-sm text-amber-400">{loadError}</p>
              ) : entries.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No events yet.{" "}
                  <a
                    href="/settings"
                    className="text-violet-400 transition-colors hover:text-violet-300"
                  >
                    Connect a GitHub repo in Settings
                  </a>{" "}
                  to get started.
                </p>
              ) : (
                <EventSelector
                  entries={entries}
                  selectedIds={selectedIds}
                  onChange={setSelectedIds}
                />
              )}
            </section>

            {/* ── Right: options + action + results ── */}
            <section className="min-w-0 space-y-8">

              {/* Options */}
              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  2 — Options
                </h2>
                <OptionsPanel
                  selectedPlatforms={platforms}
                  tone={tone}
                  privacyLevel={privacyLevel}
                  onPlatformsChange={setPlatforms}
                  onToneChange={(t) => setTone(t as Tone)}
                  onPrivacyChange={(l) => setPrivacyLevel(l as PrivacyLevel)}
                />
              </div>

              {/* Generate button */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!canGenerate || generating}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors sm:w-auto",
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

                {!canGenerate && !generating && (
                  <p className="text-[11px] text-zinc-600">
                    {selectedIds.length === 0
                      ? "Select at least one event to continue."
                      : "Select at least one platform to continue."}
                  </p>
                )}

                {error && (
                  <p className="text-sm text-red-400">{error}</p>
                )}
              </div>

              {/* Results */}
              {(posts.length > 0 || partialFailures.length > 0) && (
                <div ref={resultsRef} className="space-y-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    3 — Generated posts
                  </h2>

                  {partialFailures.length > 0 && (
                    <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-400">
                      Generation failed for:{" "}
                      <span className="font-medium">
                        {partialFailures.join(", ")}
                      </span>
                      . Use Regenerate on any card below, or try again.
                    </p>
                  )}

                  <ResultsPanel
                    posts={posts}
                    regenerating={regenerating}
                    onRegenerate={handleRegenerate}
                  />
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
