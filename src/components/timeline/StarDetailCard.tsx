"use client";

import { useEffect, useState } from "react";
import type { TimelineEntry } from "@/features/timeline/types";
import type { ConstellationStar } from "@/lib/timeline/constellationUtils";

type Props = {
  star: ConstellationStar | null;
  isLocked: boolean;
  containerWidth: number;
  containerHeight: number;
  onClose: () => void;
  onGeneratePost: (entryId: string) => void;
};

const CARD_WIDTH = 280;

const OPACITY_TRANSFORM_TRANSITION =
  "opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)";

function badgeTypeFromEntry(entry: TimelineEntry): string {
  if (entry.type === "pr") return "pull_request";
  return entry.type;
}

function EventTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    commit: { label: "commit", color: "#c4b5fd", bg: "rgba(196,181,253,0.1)" },
    pull_request: { label: "PR", color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
    release: { label: "release", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
    milestone: {
      label: "milestone",
      color: "#34d399",
      bg: "rgba(52,211,153,0.1)",
    },
  };
  const style = map[type] ?? {
    label: type,
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
  };

  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.color}30`,
        borderRadius: 4,
        padding: "1px 6px",
        fontSize: 10,
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {style.label}
    </span>
  );
}

export default function StarDetailCard({
  star,
  isLocked,
  containerWidth,
  containerHeight,
  onClose,
  onGeneratePost,
}: Props) {
  const [enterReady, setEnterReady] = useState(false);

  const activeEntryId = star?.entry.id;

  useEffect(() => {
    if (!activeEntryId) {
      setEnterReady(false);
      return;
    }
    setEnterReady(false);
    let innerFrame = 0;
    const outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => setEnterReady(true));
    });
    return () => {
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
    };
  }, [activeEntryId]);

  if (!star || containerWidth <= 0 || containerHeight <= 0) return null;

  const badgeType = badgeTypeFromEntry(star.entry);
  const dateSrc = star.entry.dateIso;

  const cardX = Math.max(
    8,
    Math.min(
      containerWidth - CARD_WIDTH - 8,
      (star.x / 100) * containerWidth - CARD_WIDTH / 2,
    ),
  );
  const cardY = Math.max(
    8,
    (star.y / 100) * containerHeight - (isLocked ? 220 : 120) - 16,
  );

  const revealStyle = {
    opacity: enterReady ? 1 : 0,
    transform: enterReady ? "scale(1)" : "scale(0.92)",
    transformOrigin: "center bottom",
  } as const;

  if (!isLocked) {
    return (
      <div
        style={{
          position: "absolute",
          left: cardX,
          top: cardY,
          width: CARD_WIDTH,
          background: "rgba(13,13,24,0.92)",
          border: "1px solid rgba(167,139,250,0.3)",
          borderRadius: 12,
          padding: "12px 14px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          transition: OPACITY_TRANSFORM_TRANSITION,
          pointerEvents: "none",
          ...revealStyle,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <EventTypeBadge type={badgeType} />
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            }}
          >
            {new Date(dateSrc).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <p
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {star.entry.title}
        </p>
      </div>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left: cardX,
        top: cardY,
        width: CARD_WIDTH,
        background: "rgba(13,13,24,0.96)",
        border: "1px solid rgba(167,139,250,0.4)",
        borderRadius: 14,
        padding: "16px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1)",
        zIndex: 10,
        transition: OPACITY_TRANSFORM_TRANSITION,
        ...revealStyle,
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.3)",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        ✕
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          paddingRight: 28,
        }}
      >
        <EventTypeBadge type={badgeType} />
        <span
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 11,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          }}
        >
          {new Date(dateSrc).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      <p
        style={{
          color: "white",
          fontSize: 14,
          fontWeight: 600,
          margin: "0 0 8px",
        }}
      >
        {star.entry.title}
      </p>

      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 12,
          lineHeight: 1.6,
          margin: "0 0 14px",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {star.entry.summary}
      </p>

      <p
        style={{
          color: "rgba(124,58,237,0.7)",
          fontSize: 11,
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          margin: "0 0 14px",
        }}
      >
        {star.entry.repo}
      </p>

      <button
        type="button"
        onClick={() => onGeneratePost(star.entry.id)}
        style={{
          width: "100%",
          padding: "8px 0",
          borderRadius: 8,
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(124,58,237,0.15))",
          border: "1px solid rgba(124,58,237,0.4)",
          color: "#a78bfa",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
      >
        ✦ Generate post from this event
      </button>
    </div>
  );
}
