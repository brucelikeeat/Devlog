"use client";

import { useState } from "react";

const PLATFORMS = [
  { name: "X (Twitter)",   icon: "𝕏",   color: "#ffffff" },
  { name: "LinkedIn",      icon: "in",  color: "#0A66C2" },
  { name: "Reddit",        icon: "👾",  color: "#FF4500" },
  { name: "Indie Hackers", icon: "⚡",  color: "#0049ff" },
  { name: "Dev.to",        icon: "DEV", color: "#ffffff" },
  { name: "Hashnode",      icon: "◈",   color: "#2962FF" },
  { name: "Product Hunt",  icon: "🐱",  color: "#DA552F" },
];

const DOUBLED = [...PLATFORMS, ...PLATFORMS];

type Platform = (typeof PLATFORMS)[number];

function PillCard({ platform }: { platform: Platform }) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
      <span
        style={{
          color: platform.color,
          fontFamily: "monospace",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        {platform.icon}
      </span>
      <span className="whitespace-nowrap text-sm font-medium text-white/80">
        {platform.name}
      </span>
    </div>
  );
}

export default function PlatformMarquee() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="w-full py-16">
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/30">
        Publish to
      </p>

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          style={{
            overflow: "hidden",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              width: "max-content",
              animation: "marquee 28s linear infinite",
              animationPlayState: isHovered ? "paused" : "running",
            }}
          >
            {DOUBLED.map((platform, i) => (
              <PillCard key={i} platform={platform} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
