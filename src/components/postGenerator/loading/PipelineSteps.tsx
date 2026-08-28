"use client";

type Props = {
  activeStage: number; // 0, 1, or 2
};

const STEPS = [
  {
    id: "enriching",
    icon: "→",
    label: "commit detected",
    detail: "Reading your GitHub activity...",
    color: "#f59e0b",
  },
  {
    id: "generating",
    icon: "⚡",
    label: "AI analyzing",
    detail: "Crafting platform-optimized drafts...",
    color: "#7C3AED",
  },
  {
    id: "done",
    icon: "◎",
    label: "posts generated",
    detail: "Your content is ready.",
    color: "#10b981",
  },
];

export default function PipelineSteps({ activeStage }: Props) {
  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes step-in {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes typewriter {
          from { width: 0; }
          to   { width: 100%; }
        }
      `}</style>

      {STEPS.map((step, index) => {
        const isPast   = activeStage > index;
        const isActive = activeStage === index;
        const isFuture = activeStage < index;

        return (
          <div
            key={step.id}
            style={{
              opacity: isFuture ? 0.3 : 1,
              animation: `step-in 0.4s ease forwards`,
              animationDelay: `${index * 150}ms`,
              animationFillMode: "both",
              transition: "opacity 0.3s ease",
            }}
            className="relative flex items-start gap-3 pb-6 last:pb-0"
          >
            {/* Vertical connector line */}
            {index < STEPS.length - 1 && (
              <div
                className="absolute left-[9px] top-5 w-px"
                style={{
                  height: "calc(100% - 8px)",
                  backgroundColor: isPast ? step.color : "rgba(63,63,70,0.6)",
                  transition: "background-color 0.4s ease",
                }}
              />
            )}

            {/* Dot / icon */}
            <div
              className="relative z-10 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
              style={{
                backgroundColor: isActive || isPast
                  ? step.color
                  : "rgba(63,63,70,0.8)",
                color: isActive || isPast ? "#fff" : "rgba(161,161,170,0.6)",
                boxShadow: isActive
                  ? `0 0 10px 2px ${step.color}66`
                  : "none",
                transition: "background-color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              {step.icon}
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className="font-mono text-sm font-medium leading-none"
                style={{
                  color: isActive || isPast ? step.color : "rgba(113,113,122,0.7)",
                  transition: "color 0.3s ease",
                }}
              >
                {step.label}
              </p>

              {/* Detail — visible only for active and past steps */}
              {(isActive || isPast) && (
                <span
                  className="mt-1 block text-xs text-zinc-500"
                  style={{
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    width: isPast ? "100%" : undefined,
                    animation: isActive
                      ? "typewriter 0.8s steps(40) forwards"
                      : undefined,
                  }}
                >
                  {step.detail}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
