"use client";

import { useState } from "react";
import { useInView } from "@/hooks/useInView";

// `animation` is a render function so the card can inject `active` at render
// time — a plain ReactNode cannot receive new props after creation.
type Props = {
  icon: React.ReactNode;
  title: string;
  description: string;
  animation: (active: boolean) => React.ReactNode;
  isAutoActive?: boolean; // controls border highlight only (not animation)
  colSpan?: "1" | "2";
};

export default function FeatureCard({
  icon,
  title,
  description,
  animation,
  isAutoActive = false,
  colSpan = "1",
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.25 });

  // Animation plays whenever the card is in the viewport.
  // Hover + auto-cycle only influence the visual border/glow enhancement.
  const isHighlighted = isHovered || isAutoActive;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // Scroll-reveal + hover lift (combined into a single transform)
        opacity: inView ? 1 : 0,
        // Hover glow & lift
        border: isHighlighted
          ? "1px solid rgba(124,58,237,0.45)"
          : "1px solid rgba(255,255,255,0.07)",
        background: isHighlighted
          ? "rgba(124,58,237,0.06)"
          : "rgba(255,255,255,0.02)",
        boxShadow: isHighlighted
          ? "0 0 28px rgba(124,58,237,0.07)"
          : "none",
        transform: inView
          ? isHighlighted
            ? "translateY(-2px)"
            : "translateY(0)"
          : "translateY(16px)",
        transition:
          "opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1), border 0.35s cubic-bezier(0.4,0,0.2,1), background 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s cubic-bezier(0.4,0,0.2,1)",
        borderRadius: 16,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        cursor: "pointer",
        gridColumn: colSpan === "2" ? "span 2" : undefined,
      }}
    >
      {/* Top row: icon badge + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "rgba(124,58,237,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#a78bfa",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <h3 style={{ color: "#ffffff", fontWeight: 600, fontSize: 15, margin: 0 }}>
          {title}
        </h3>
      </div>

      {/* Animation area — always rendered; plays when inView=true */}
      <div
        style={{
          height: 120,
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(12px)",
          transition:
            "opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {animation(inView)}
      </div>

      {/* Description — always visible below the animation, staggered reveal */}
      <p
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(8px)",
          transition:
            "opacity 0.6s cubic-bezier(0.4,0,0.2,1) 0.15s, transform 0.6s cubic-bezier(0.4,0,0.2,1) 0.15s",
          fontSize: 14,
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.5)",
          margin: 0,
        }}
      >
        {description}
      </p>
    </div>
  );
}
