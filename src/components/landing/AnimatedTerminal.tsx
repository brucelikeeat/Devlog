"use client";

import { useState, useEffect } from "react";
import { TERMINAL_SCENARIOS } from "./terminalData";
import { useTypewriter } from "@/hooks/useTypewriter";

type Stage =
  | "idle"
  | "commit"
  | "analyzing"
  | "generating"
  | "done"
  | "resetting";

function AnalyzingDots({ active }: { active: boolean }) {
  const [dots, setDots] = useState("generating outcome-focused summary");

  useEffect(() => {
    if (!active) {
      setDots("generating outcome-focused summary...");
      return;
    }
    let count = 0;
    const interval = setInterval(() => {
      count = (count + 1) % 4;
      setDots("generating outcome-focused summary" + ".".repeat(count));
    }, 400);
    return () => clearInterval(interval);
  }, [active]);

  return <span className="text-sm text-white/30">{dots}</span>;
}

export default function AnimatedTerminal() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("idle");
  const [visible, setVisible] = useState(true);

  const scenario = TERMINAL_SCENARIOS[scenarioIndex];

  // Kick off the loop on mount
  useEffect(() => {
    const t = setTimeout(() => setStage("idle"), 500);
    return () => clearTimeout(t);
  }, []);

  // Typewriter hooks
  const commitTyped = useTypewriter(
    scenario.commit.message,
    22,
    0,
    stage === "commit" ||
      stage === "analyzing" ||
      stage === "generating" ||
      stage === "done",
  );

  const postTyped = useTypewriter(
    scenario.generatedPost,
    18,
    0,
    stage === "generating" || stage === "done",
  );

  // Stage timer: pure-timer transitions
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;

    if (stage === "idle") {
      t = setTimeout(() => setStage("commit"), 800);
    } else if (stage === "analyzing") {
      t = setTimeout(() => setStage("generating"), 2800);
    } else if (stage === "done") {
      t = setTimeout(() => setStage("resetting"), 3000);
    } else if (stage === "resetting") {
      setVisible(false);
      t = setTimeout(() => {
        setScenarioIndex((i) => (i + 1) % TERMINAL_SCENARIOS.length);
        setStage("idle");
        setVisible(true);
      }, 400);
    }

    return () => clearTimeout(t);
  }, [stage]);

  // commit → analyzing: wait for typewriter + 600ms
  useEffect(() => {
    if (stage !== "commit" || !commitTyped.isDone) return;
    const t = setTimeout(() => setStage("analyzing"), 600);
    return () => clearTimeout(t);
  }, [stage, commitTyped.isDone]);

  // generating → done: wait for typewriter + 1200ms
  useEffect(() => {
    if (stage !== "generating" || !postTyped.isDone) return;
    const t = setTimeout(() => setStage("done"), 1200);
    return () => clearTimeout(t);
  }, [stage, postTyped.isDone]);

  const showCommit =
    stage === "commit" ||
    stage === "analyzing" ||
    stage === "generating" ||
    stage === "done";
  const showAnalyzing =
    stage === "analyzing" || stage === "generating" || stage === "done";
  const showPost = stage === "generating" || stage === "done";

  return (
    <div
      className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D0D12] text-left shadow-2xl shadow-black/60 backdrop-blur-sm"
      style={{ fontFamily: "monospace" }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-2 text-[11px] text-white/30">
          devlog · activity feed
        </span>
      </div>

      {/* Body */}
      <div
        className="min-h-[220px] space-y-5 p-5"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}
      >
        {/* Stage 1 — commit detected */}
        {showCommit && (
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-amber-400/80 text-sm">→</span>
            <div>
              <span className="text-amber-400/80 text-sm">commit detected</span>
              <span className="ml-2 text-sm text-white/30">
                · {scenario.commit.repo}
              </span>
              <div className="mt-0.5 text-sm text-white/50">
                &ldquo;{commitTyped.displayed}
                {!commitTyped.isDone && (
                  <span className="animate-pulse">▋</span>
                )}
                &rdquo;
              </div>
            </div>
          </div>
        )}

        {/* Stage 2 — AI analyzing */}
        {showAnalyzing && (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-violet-400/80 text-sm">⚡</span>
            <div>
              <span className="text-sm text-violet-400/80">AI analyzing</span>
              <span className="text-sm text-white/30"> · </span>
              <AnalyzingDots active={stage === "analyzing"} />
            </div>
          </div>
        )}

        {/* Stage 3 — post generated */}
        {showPost && (
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-emerald-400/80 text-sm">◎</span>
            <div>
              <span className="text-sm text-emerald-400/80">post generated</span>
              <span className="ml-2 text-sm text-white/30">
                · {scenario.platform}
              </span>
              <div className="mt-0.5 text-sm leading-relaxed text-white/60">
                &ldquo;{postTyped.displayed}
                {!postTyped.isDone && (
                  <span className="animate-pulse">▋</span>
                )}
                &rdquo;
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
