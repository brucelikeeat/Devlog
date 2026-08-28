"use client";

type Props = {
  stage: "idle" | "enriching" | "generating" | "done";
};

export default function PulsingOrb({ stage }: Props) {
  const isActive = stage !== "idle";

  // Flash to a brighter violet when stage changes
  const innerColor = isActive ? "#a78bfa" : "#7C3AED";

  return (
    <div
      style={{ width: 200, height: 200 }}
      className="relative flex items-center justify-center"
    >
      <style>{`
        @keyframes orb-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.15); opacity: 0.05; }
        }
      `}</style>

      {/* Outer ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          backgroundColor: "rgba(124, 58, 237, 0.10)",
          animation: "ring-pulse 3s ease-in-out infinite",
        }}
      />

      {/* Middle ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 140,
          height: 140,
          backgroundColor: "rgba(124, 58, 237, 0.20)",
          animation: "ring-pulse 2s ease-in-out infinite",
        }}
      />

      {/* Inner orb */}
      <div
        className="absolute rounded-full"
        style={{
          width: 80,
          height: 80,
          backgroundColor: innerColor,
          transition: "background-color 300ms ease",
          boxShadow:
            "0 0 40px 8px rgba(124, 58, 237, 0.6), 0 0 80px 20px rgba(124, 58, 237, 0.2)",
          animation: "orb-pulse 2s ease-in-out infinite",
        }}
      />
    </div>
  );
}
