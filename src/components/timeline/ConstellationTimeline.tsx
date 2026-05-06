"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TimelineEntry } from "@/features/timeline/types";
import { buildConstellationStars } from "@/lib/timeline/constellationUtils";
import ConstellationLayer from "./ConstellationLayer";
import StarDetailCard from "./StarDetailCard";
import StarFieldBackground from "./StarFieldBackground";

const CONSTELLATION_H = 480;

type Props = {
  entries: TimelineEntry[];
};

export default function ConstellationTimeline({ entries }: Props) {
  const [hoveredStarId, setHoveredStarId] = useState<string | null>(null);
  const [selectedStarId, setSelectedStarId] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: CONSTELLATION_H });
  const containerRef = useRef<HTMLDivElement>(null);

  const { stars, clusters } = useMemo(
    () => buildConstellationStars(entries),
    [entries],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = Math.floor(el.clientWidth);
      setDimensions((d) =>
        w !== d.width ? { ...d, width: w } : d,
      );
    };

    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleGeneratePost = (entryId: string) => {
    window.location.href = `/generate?eventId=${encodeURIComponent(entryId)}`;
  };

  const commitCount = entries.filter((e) => e.type === "commit").length;
  const prCount = entries.filter((e) => e.type === "pr").length;
  const releaseCount = entries.filter((e) => e.type === "release").length;

  const activeCardId = selectedStarId || hoveredStarId;
  const cardStar =
    activeCardId == null
      ? null
      : (stars.find((s) => s.entry.id === activeCardId) ?? null);

  return (
    <div
      ref={containerRef}
      role="presentation"
      onClick={() => setSelectedStarId(null)}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 560,
        background: "#080810",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: 24,
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        {[
          {
            label: "commits",
            value: commitCount,
            color: "#c4b5fd",
          },
          {
            label: "PRs",
            value: prCount,
            color: "#a78bfa",
          },
          {
            label: "releases",
            value: releaseCount,
            color: "#fbbf24",
          },
          {
            label: "clusters",
            value: clusters.length,
            color: "#34d399",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{ display: "flex", alignItems: "baseline", gap: 6 }}
          >
            <span
              style={{
                color: stat.color,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 11,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
        <div
          style={{
            marginLeft: "auto",
            color: "rgba(255,255,255,0.2)",
            fontSize: 11,
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            alignSelf: "center",
          }}
        >
          click any star to explore
        </div>
      </div>

      {/* Constellation canvas */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: CONSTELLATION_H,
        }}
      >
        {entries.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: CONSTELLATION_H,
              gap: 16,
            }}
          >
            <div style={{ fontSize: 48, opacity: 0.2 }}>✦</div>
            <p
              style={{
                color: "rgba(255,255,255,0.25)",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 13,
              }}
            >
              No events yet. Connect a GitHub repo in Settings.
            </p>
          </div>
        ) : (
          <>
            <StarFieldBackground />

            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
              }}
            >
              <ConstellationLayer
                stars={stars}
                clusters={clusters}
                selectedStarId={selectedStarId}
                hoveredStarId={hoveredStarId}
                onStarHover={setHoveredStarId}
                onStarClick={(id) =>
                  setSelectedStarId((prev) => (prev === id ? null : id))
                }
                width={dimensions.width}
                height={CONSTELLATION_H}
              />
            </div>

            {(hoveredStarId || selectedStarId) && (
              <StarDetailCard
                star={cardStar}
                isLocked={!!selectedStarId}
                containerWidth={dimensions.width}
                containerHeight={dimensions.height}
                onClose={() => setSelectedStarId(null)}
                onGeneratePost={handleGeneratePost}
              />
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "10px 20px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.2)",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "commit", color: "#c4b5fd" },
          { label: "pull request", color: "#a78bfa" },
          { label: "release", color: "#fbbf24" },
          { label: "milestone", color: "#34d399" },
        ].map((item) => (
          <div
            key={item.label}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: item.color,
                boxShadow: `0 0 6px ${item.color}`,
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 11,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
