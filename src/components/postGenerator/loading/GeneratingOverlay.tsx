"use client";

import { useEffect, useRef, useState } from "react";
import PulsingOrb from "./PulsingOrb";
import PipelineSteps from "./PipelineSteps";
import ParticleBackground from "./ParticleBackground";

type Props = {
  isVisible: boolean;
  onComplete?: () => void;
};

const STAGE_DURATIONS = [2200, 2200] as const; // ms between stage 0→1 and 1→2
const FADE_OUT_MS = 500;

const PROGRESS_BY_STAGE: Record<number, string> = {
  0: "35%",
  1: "70%",
  2: "95%",
};

const ORB_STAGES = ["enriching", "generating", "done"] as const satisfies readonly (
  | "idle"
  | "enriching"
  | "generating"
  | "done"
)[];

export default function GeneratingOverlay({ isVisible, onComplete }: Props) {
  const [stage, setStage] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Fade in / out based on isVisible
  useEffect(() => {
    if (isVisible) {
      // Next tick so the initial opacity:0 is painted first
      const t = requestAnimationFrame(() => setOpacity(1));
      return () => cancelAnimationFrame(t);
    } else {
      setOpacity(0);
      const t = setTimeout(() => {
        onCompleteRef.current?.();
      }, FADE_OUT_MS);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  // Reset + advance stage progression whenever overlay becomes visible
  useEffect(() => {
    if (!isVisible) {
      setStage(0);
      return;
    }

    setStage(0);

    const t1 = setTimeout(() => setStage(1), STAGE_DURATIONS[0]);
    const t2 = setTimeout(() => setStage(2), STAGE_DURATIONS[0] + STAGE_DURATIONS[1]);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isVisible]);

  const progressWidth = PROGRESS_BY_STAGE[stage] ?? "0%";
  const orbStage = ORB_STAGES[stage];

  return (
    <div
      aria-live="polite"
      aria-label="Generating posts"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(13, 13, 18, 0.97)",
        opacity,
        transition: isVisible
          ? "opacity 400ms ease"
          : `opacity ${FADE_OUT_MS}ms ease`,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      {/* Particle background fills the entire overlay */}
      <ParticleBackground />

      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 2,
          width: progressWidth,
          background: "#7C3AED",
          transition: "width 1.8s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1,
        }}
      />

      {/* Main centered content */}
      <div
        style={{ position: "relative", zIndex: 1 }}
        className="flex h-full flex-col items-center justify-center gap-8 px-6"
      >
        {/* Top label */}
        <p className="font-mono text-xs tracking-widest text-zinc-500">
          devlog · generating
          <span
            style={{ animation: "blink 1s step-end infinite" }}
            className="ml-0.5"
          >
            ▋
          </span>
        </p>

        {/* Orb */}
        <PulsingOrb stage={orbStage} />

        {/* Pipeline steps */}
        <div style={{ width: "100%", maxWidth: 320 }}>
          <PipelineSteps activeStage={stage} />
        </div>

        {/* Bottom hint */}
        <p className="text-center font-mono text-[11px] text-zinc-700">
          This usually takes 5–10 seconds
        </p>
      </div>
    </div>
  );
}
