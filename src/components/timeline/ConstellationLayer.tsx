"use client";

import { useCallback, useRef, useState } from "react";
import type { ConstellationStar, StarCluster } from "@/lib/timeline/constellationUtils";
import {
  getStarRadius,
  toConstellationEventType,
} from "@/lib/timeline/constellationUtils";

type Props = {
  stars: ConstellationStar[];
  clusters: StarCluster[];
  selectedStarId: string | null;
  hoveredStarId: string | null;
  onStarHover: (id: string | null) => void;
  onStarClick: (id: string) => void;
  width: number;
  height: number;
};

const toPixel = (star: ConstellationStar, width: number, height: number) => ({
  px: (star.x / 100) * width,
  py: (star.y / 100) * height,
});

function buildClusterTrailPathSorted(
  sortedStars: ConstellationStar[],
  width: number,
  height: number,
): string {
  const pts = sortedStars.map((s) => toPixel(s, width, height));
  if (pts.length < 2) return "";

  let d = `M ${pts[0].px} ${pts[0].py}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const p2 = pts[i + 2];
    const c1x = (p0.px + p1.px) / 2;
    const c1y = (p0.py + p1.py) / 2;
    const c2x = p2 ? (p1.px + p2.px) / 2 : c1x;
    const c2y = p2 ? (p1.py + p2.py) / 2 : c1y;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p1.px} ${p1.py}`;
  }
  return d;
}

function gradientFillUrl(entryType: ReturnType<typeof toConstellationEventType>): string {
  return `url(#star-glow-${entryType})`;
}

type Ripple = { key: number; px: number; py: number };

const STAR_TRANSITION = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
const DIM_OPACITY = 0.25;

export default function ConstellationLayer({
  stars,
  clusters,
  selectedStarId,
  hoveredStarId,
  onStarHover,
  onStarClick,
  width,
  height,
}: Props) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleKeyRef = useRef(0);

  const triggerRipple = useCallback((px: number, py: number) => {
    const key = ++rippleKeyRef.current;
    setRipples((prev) => [...prev, { key, px, py }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.key !== key));
    }, 800);
  }, []);

  const handleStarClick = useCallback(
    (id: string, px: number, py: number) => {
      triggerRipple(px, py);
      onStarClick(id);
    },
    [onStarClick, triggerRipple],
  );

  if (width <= 0 || height <= 0) {
    return null;
  }

  return (
    <svg
      width={width}
      height={height}
      className="relative z-[1] block overflow-visible"
      style={{ pointerEvents: "auto" }}
    >
      <defs>
        <radialGradient id="star-glow-commit" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#c4b5fd" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="star-glow-pull_request" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#a78bfa" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="star-glow-release" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#fbbf24" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="star-glow-milestone" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#34d399" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>

        <filter id="constellation-selected-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <style>
          {`
            @keyframes trail-flow {
              from { stroke-dashoffset: 0; }
              to { stroke-dashoffset: -48; }
            }
            @keyframes mid-glow-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.3); }
            }
            @keyframes click-ripple {
              from {
                transform: scale(1);
                opacity: 0.55;
              }
              to {
                transform: scale(15);
                opacity: 0;
              }
            }
          `}
        </style>
      </defs>

      {/* Trails */}
      <g style={{ pointerEvents: "none" }}>
        {clusters.map((cluster) => {
          if (cluster.stars.length < 2) return null;
          const sorted = [...cluster.stars].sort((a, b) => a.x - b.x);
          const d = buildClusterTrailPathSorted(sorted, width, height);
          if (!d) return null;
          const trailColor = sorted[0]?.color.trail ?? "rgba(148,163,184,0.1)";
          return (
            <path
              key={`trail-${cluster.id}`}
              d={d}
              fill="none"
              stroke={trailColor}
              strokeWidth={1}
              strokeOpacity={0.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 8"
              style={{
                animation: "trail-flow 4s linear infinite",
              }}
            />
          );
        })}
      </g>

      {/* Cluster labels */}
      <g style={{ pointerEvents: "none" }}>
        {clusters.map((cluster) => {
          const ys = cluster.stars.map((s) => toPixel(s, width, height).py);
          const minY = ys.length ? Math.min(...ys) : 0;
          const cx = (cluster.centerX / 100) * width;
          const ty = minY - 20;
          return (
            <text
              key={`label-${cluster.id}`}
              x={cx}
              y={ty}
              textAnchor="middle"
              fill="rgba(255,255,255,0.2)"
              fontSize={11}
              fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
              letterSpacing="0.05em"
            >
              {cluster.label}
              <tspan fill="rgba(124,58,237,0.6)" dx={6}>
                {cluster.stars.length}★
              </tspan>
            </text>
          );
        })}
      </g>

      {/* Stars */}
      <g>
        {stars.map((star, starIndex) => {
          const { px, py } = toPixel(star, width, height);
          const id = star.entry.id;
          const isHovered = hoveredStarId === id;
          const isSelected = selectedStarId === id;
          const dimOthers = selectedStarId !== null && !isSelected;
          const baseR = getStarRadius(star.size);

          const outerBaseR = baseR * 3.5;
          const outerR = outerBaseR + (isHovered ? 4 : 0);
          let outerOpacity = 0.15;
          if (isSelected) outerOpacity = 0.5;
          else if (isHovered) outerOpacity = 0.35;

          const midR = baseR * 2;
          const coreR =
            baseR + (isHovered ? 2 : 0) + (isSelected ? 3 : 0);

          const hitR = Math.max(24, baseR * 4);

          const entryType = toConstellationEventType(star.entry);
          const fillUrl = gradientFillUrl(entryType);

          const groupOpacity = dimOthers ? DIM_OPACITY : 1;

          return (
            <g
              key={id}
              style={{
                opacity: groupOpacity,
                transition: "opacity 0.4s ease",
              }}
            >
              {/* Outer glow */}
              <circle
                cx={px}
                cy={py}
                r={outerR}
                fill={star.color.glow}
                fillOpacity={outerOpacity}
                style={{ transition: STAR_TRANSITION }}
              />

              {/* Mid glow pulse */}
              <g transform={`translate(${px}, ${py})`}>
                <g
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    animation: `mid-glow-pulse 3s ease-in-out infinite`,
                    animationDelay: `${(starIndex % 12) * 0.15}s`,
                  }}
                >
                  <circle
                    cx={0}
                    cy={0}
                    r={midR}
                    fill={star.color.glow}
                    fillOpacity={0.3}
                  />
                </g>
              </g>

              {/* Core */}
              <circle
                cx={px}
                cy={py}
                r={coreR}
                fill={fillUrl}
                opacity={isHovered ? 1 : 0.92}
                stroke={
                  isSelected
                    ? "rgba(196,181,253,0.85)"
                    : isHovered
                      ? "rgba(255,255,255,0.45)"
                      : "none"
                }
                strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0}
                filter={isSelected ? "url(#constellation-selected-glow)" : undefined}
                style={{ transition: STAR_TRANSITION }}
              />

              {/* Hit target */}
              <circle
                cx={px}
                cy={py}
                r={hitR}
                fill="transparent"
                style={{ cursor: "pointer", transition: STAR_TRANSITION }}
                onMouseEnter={() => onStarHover(id)}
                onMouseLeave={() => onStarHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarClick(id, px, py);
                }}
              />
            </g>
          );
        })}
      </g>

      {/* Ripples */}
      <g style={{ pointerEvents: "none" }}>
        {ripples.map((r) => (
          <g key={r.key} transform={`translate(${r.px}, ${r.py})`}>
            <circle
              r={4}
              fill="rgba(167,139,250,0.35)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={1}
              style={{
                animation: "click-ripple 800ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
                transformBox: "fill-box",
                transformOrigin: "center",
              }}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
