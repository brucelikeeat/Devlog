"use client";

import { useState, useEffect, useRef } from "react";

// ── useCycleLoop ──────────────────────────────────────────────────────────────
// Drives CSS-keyframe animations through repeating cycles.
//
// • cycleKey  — increments on every cycle; use as `key` on the animated
//               container so React remounts it and CSS animations restart.
// • visible   — controls an opacity fade-out between cycles.
//
// 200ms entrance delay prevents a jarring snap when the card scrolls in.
// When active→false everything resets instantly so the next in-view play
// starts clean.

function useCycleLoop(active: boolean, cycleDuration: number, fadeDuration = 400) {
  const [cycleKey, setCycleKey] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    function clearTimers() {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    }

    if (!active) {
      clearTimers();
      setVisible(false);
      setCycleKey(0);
      return;
    }

    function startCycle() {
      setVisible(true);
      setCycleKey((k) => k + 1);
      const t1 = setTimeout(() => setVisible(false), cycleDuration);
      const t2 = setTimeout(startCycle, cycleDuration + fadeDuration);
      timersRef.current = [t1, t2];
    }

    const entrance = setTimeout(startCycle, 200);
    timersRef.current = [entrance];
    return clearTimers;
  }, [active, cycleDuration, fadeDuration]);

  return { cycleKey, visible };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CommitGraphAnimation
//    Branch draws left → right; 4 commit dots pop in with 300ms stagger;
//    labels fade in above/below. Holds 2 s then restarts.
// ─────────────────────────────────────────────────────────────────────────────

const CG_COMMITS = [
  { pct: 10, label: "feat",    color: "#7C3AED", above: true,  delay: "400ms"  },
  { pct: 36, label: "fix",     color: "#f59e0b", above: false, delay: "700ms"  },
  { pct: 62, label: "perf",    color: "#10b981", above: true,  delay: "1000ms" },
  { pct: 87, label: "release", color: "#ffffff", above: false, delay: "1300ms" },
];
// Last label visible ≈ 1500ms  →  hold 2000ms  →  cycle = 3500ms

export function CommitGraphAnimation({ active }: { active: boolean }) {
  const { cycleKey, visible } = useCycleLoop(active, 3500);

  return (
    <div
      style={{
        width: 280, height: 120, position: "relative", overflow: "hidden",
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease-in-out",
      }}
    >
      <style>{`
        @keyframes cg-line {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes cg-pop {
          0%   { opacity: 0; transform: translateX(-50%) scale(0); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        @keyframes cg-lbl {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {cycleKey > 0 && (
        <div key={cycleKey} style={{ position: "absolute", inset: 0 }}>
          {/* Branch line */}
          <div
            style={{
              position: "absolute",
              top: 59, left: 16, right: 16, height: 2,
              background: "rgba(124,58,237,0.45)",
              transformOrigin: "left center",
              animation: "cg-line 900ms cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          />
          {CG_COMMITS.map((c, i) => (
            <div key={i}>
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: `calc(16px + (100% - 32px) * ${c.pct / 100})`,
                  top: 51, width: 16, height: 16,
                  borderRadius: "50%",
                  background: c.color,
                  border: "2px solid #0D0D12",
                  opacity: 0,
                  animation: `cg-pop 300ms cubic-bezier(0.4,0,0.2,1) ${c.delay} forwards`,
                }}
              />
              {/* Label */}
              <span
                style={{
                  position: "absolute",
                  left: `calc(16px + (100% - 32px) * ${c.pct / 100})`,
                  top: c.above ? 22 : 84,
                  transform: "translateX(-50%)",
                  fontSize: 10, fontFamily: "monospace", color: c.color,
                  whiteSpace: "nowrap", opacity: 0,
                  animation: `cg-lbl 300ms cubic-bezier(0.4,0,0.2,1) calc(${c.delay} + 200ms) forwards`,
                }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PostGeneratorAnimation
//    Badge appears → text types at 40ms/char → cursor blinks 1800ms → restart.
// ─────────────────────────────────────────────────────────────────────────────

const PG_TEXT =
  "Just shipped scoring algorithm — evaluates startup ideas across market size & competition. Day 14. 🚀";

export function PostGeneratorAnimation({ active }: { active: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const [loopVisible, setLoopVisible] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function clearAll() {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    if (!active) {
      clearAll();
      setDisplayed("");
      setLoopVisible(false);
      return;
    }

    function runCycle() {
      setLoopVisible(true);
      setDisplayed("");
      let idx = 0;

      intervalRef.current = setInterval(() => {
        idx += 1;
        setDisplayed(PG_TEXT.slice(0, idx));

        if (idx >= PG_TEXT.length) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;

          // Hold cursor blink 1800ms, fade 400ms, then restart
          const t1 = setTimeout(() => setLoopVisible(false), 1800);
          const t2 = setTimeout(runCycle, 2300);
          timersRef.current.push(t1, t2);
        }
      }, 40);
    }

    const entrance = setTimeout(runCycle, 200);
    timersRef.current = [entrance];
    return clearAll;
  }, [active]);

  return (
    <div
      style={{
        width: 280, height: 120,
        padding: "10px 12px", boxSizing: "border-box", overflow: "hidden",
        opacity: loopVisible ? 1 : 0,
        transition: "opacity 400ms ease-in-out",
      }}
    >
      <style>{`
        @keyframes pg-badge {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pg-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>

      {/* Platform badge */}
      <div
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 4, padding: "2px 8px", marginBottom: 8,
          fontSize: 10, color: "#e5e7eb", fontFamily: "monospace",
          animation: "pg-badge 300ms cubic-bezier(0.4,0,0.2,1) forwards",
        }}
      >
        <span style={{ fontSize: 12 }}>𝕏</span> Twitter
      </div>

      {/* Typed text + blinking cursor */}
      <div style={{ fontSize: 11, color: "#d1d5db", fontFamily: "monospace", lineHeight: 1.55 }}>
        {displayed}
        <span
          style={{
            display: "inline-block", width: 1, height: "1em",
            background: "#7C3AED", marginLeft: 1, verticalAlign: "text-bottom",
            animation: "pg-blink 1s step-end infinite",
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TimelineAnimation
//    3 rows slide in from the left, staggered 300ms. Holds 2s then restarts.
// ─────────────────────────────────────────────────────────────────────────────

const TL_ROWS = [
  { dot: "#f59e0b", text: "feat: auth system", delay: "0ms"   },
  { dot: "#7C3AED", text: "fix: null pointer", delay: "300ms" },
  { dot: "#10b981", text: "release: v1.2.0",   delay: "600ms" },
];
// Last row done at 600 + 500 = 1100ms  →  hold 2000ms  →  cycle = 3100ms

export function TimelineAnimation({ active }: { active: boolean }) {
  const { cycleKey, visible } = useCycleLoop(active, 3100);

  return (
    <div
      style={{
        width: 280, height: 120,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "0 18px", boxSizing: "border-box", overflow: "hidden",
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease-in-out",
      }}
    >
      <style>{`
        @keyframes tl-in {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {cycleKey > 0 && (
        <div key={cycleKey} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {TL_ROWS.map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                opacity: 0,
                animation: `tl-in 500ms cubic-bezier(0.4,0,0.2,1) ${row.delay} forwards`,
              }}
            >
              <div
                style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: row.dot, flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, fontFamily: "monospace", color: "#d1d5db", whiteSpace: "nowrap" }}>
                {row.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ContentEditorAnimation
//    AI rewrites a sentence in 4 phases, 800ms apart. Holds 2s then loops.
// ─────────────────────────────────────────────────────────────────────────────

export function ContentEditorAnimation({ active }: { active: boolean }) {
  const [phase, setPhase] = useState(0);
  const [loopVisible, setLoopVisible] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    function clearTimers() {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    }

    if (!active) {
      clearTimers();
      setPhase(0);
      setLoopVisible(false);
      return;
    }

    function runCycle() {
      setLoopVisible(true);
      setPhase(1);

      const t1 = setTimeout(() => setPhase(2), 800);
      const t2 = setTimeout(() => setPhase(3), 1600);
      const t3 = setTimeout(() => setPhase(4), 2400);
      // Hold 2000ms after phase 4 → fade at 4400ms
      const t4 = setTimeout(() => setLoopVisible(false), 4400);
      // Reset state and restart after fade completes (400ms gap)
      const t5 = setTimeout(() => {
        setPhase(0);
        const restart = setTimeout(runCycle, 200);
        timersRef.current.push(restart);
      }, 4850);
      timersRef.current = [t1, t2, t3, t4, t5];
    }

    const entrance = setTimeout(runCycle, 200);
    timersRef.current = [entrance];
    return clearTimers;
  }, [active]);

  return (
    <div
      style={{
        width: 280, height: 120,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 18px", boxSizing: "border-box",
        opacity: loopVisible ? 1 : 0,
        transition: "opacity 400ms ease-in-out",
      }}
    >
      {phase >= 1 && (
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#e5e7eb", lineHeight: 2 }}>
          {"The "}
          <span
            style={
              phase >= 2
                ? { textDecoration: "line-through", color: "#6b7280", fontSize: 11 }
                : {}
            }
          >
            bug
          </span>
          {phase >= 3 && <span style={{ color: "#10b981" }}> critical issue</span>}
          {" is "}
          {phase < 4 ? (
            <span>fixed</span>
          ) : (
            <>
              <span style={{ textDecoration: "line-through", color: "#6b7280", fontSize: 11 }}>
                fixed
              </span>
              <span style={{ color: "#10b981" }}> resolved</span>
            </>
          )}
          {"."}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ContentCalendarAnimation
//    4×3 grid — colored platform overlays light up in an 80ms/cell wave.
//    Holds 1800ms then restarts.
// ─────────────────────────────────────────────────────────────────────────────

const CC_GRID: (string | null)[] = [
  "#7C3AED", null,      "#ffffff", null,
  null,      "#f97316", null,      "#7C3AED",
  "#ffffff", null,      "#f97316", null,
];
// 12 cells × 80ms + 300ms anim ≈ 1260ms  →  hold 1800ms  →  cycle = 3060ms

export function ContentCalendarAnimation({ active }: { active: boolean }) {
  const { cycleKey, visible } = useCycleLoop(active, 3060);

  return (
    <div
      style={{
        width: 280, height: 120,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease-in-out",
      }}
    >
      <style>{`
        @keyframes cc-cell {
          from { opacity: 0.08; }
          to   { opacity: 1; }
        }
        @keyframes cc-dot {
          from { opacity: 0; }
          to   { opacity: 0.7; }
        }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: 6, width: 212, height: 96,
        }}
      >
        {CC_GRID.map((color, i) => (
          <div
            key={i}
            style={{
              borderRadius: 4,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.08)",
              position: "relative", overflow: "hidden",
            }}
          >
            {cycleKey > 0 && color && (
              // Wrapper with key — remounts on each cycle to restart CSS anims
              <div key={`${i}-${cycleKey}`} style={{ position: "absolute", inset: 0 }}>
                {/* Platform color overlay */}
                <div
                  style={{
                    position: "absolute", inset: 0, borderRadius: 3,
                    background: color, opacity: 0.08,
                    animation: `cc-cell 300ms cubic-bezier(0.4,0,0.2,1) ${i * 80}ms forwards`,
                  }}
                />
                {/* Platform dot */}
                <div
                  style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0,
                    animation: `cc-dot 300ms cubic-bezier(0.4,0,0.2,1) ${i * 80 + 150}ms forwards`,
                  }}
                >
                  <div
                    style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: color === "#ffffff" ? "#0D0D12" : "#ffffff",
                      opacity: 0.6,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. PrivacyAnimation
//    Shield fills bottom-to-top (1200ms); scan line sweeps text; labels reveal.
//    Holds 2s then restarts.
// ─────────────────────────────────────────────────────────────────────────────

const PV_LINES = [
  { revealDelay: "950ms",  text: "████ redacted ████", muted: true  },
  { revealDelay: "1100ms", text: "████ redacted ████", muted: true  },
  { revealDelay: "1250ms", text: "outcome: shipped ✓", muted: false },
];
// Last reveal ≈ 1550ms  →  hold 2000ms  →  cycle = 3600ms

export function PrivacyAnimation({ active }: { active: boolean }) {
  const { cycleKey, visible } = useCycleLoop(active, 3600);
  // Stable unique ID per component instance for the SVG clipPath
  const clipId = useRef(`pv-${Math.random().toString(36).slice(2, 7)}`).current;

  return (
    <div
      style={{
        width: 280, height: 120,
        display: "flex", alignItems: "center", gap: 18,
        padding: "0 16px", boxSizing: "border-box",
        opacity: visible ? 1 : 0,
        transition: "opacity 400ms ease-in-out",
      }}
    >
      <style>{`
        @keyframes pv-fill {
          from { transform: translateY(68px); }
          to   { transform: translateY(0); }
        }
        @keyframes pv-scan {
          from { top: 0;    opacity: 0.85; }
          to   { top: 62px; opacity: 0;    }
        }
        @keyframes pv-reveal {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Shield SVG */}
      <div style={{ flexShrink: 0, width: 44, height: 60 }}>
        <svg viewBox="0 0 44 60" width={44} height={60} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id={clipId}>
              <path d="M22 2 L4 10 L4 30 C4 44 12 54 22 58 C32 54 40 44 40 30 L40 10 Z" />
            </clipPath>
          </defs>

          {/* Fill rect — remounts on each cycle via key, restarting the animation */}
          {cycleKey > 0 && (
            <rect
              key={cycleKey}
              x={0} y={0} width={44} height={68}
              fill="#7C3AED" opacity={0.38}
              clipPath={`url(#${clipId})`}
              style={{
                transform: "translateY(68px)",
                animation: "pv-fill 1200ms cubic-bezier(0.4,0,0.2,1) forwards",
              }}
            />
          )}

          {/* Outline always visible */}
          <path
            d="M22 2 L4 10 L4 30 C4 44 12 54 22 58 C32 54 40 44 40 30 L40 10 Z"
            stroke="#7C3AED" strokeWidth={2.4} fill="none"
          />
        </svg>
      </div>

      {/* Text lines + scanning line */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9, position: "relative" }}>
        {/* Scan line — remounts with cycleKey */}
        {cycleKey > 0 && (
          <div
            key={cycleKey}
            style={{
              position: "absolute", left: 0, right: 0, height: 2,
              background: "rgba(124,58,237,0.75)",
              animation: "pv-scan 700ms ease-in-out 200ms forwards",
            }}
          />
        )}

        {PV_LINES.map((line, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Gray bar */}
            <div
              style={{
                height: 7, borderRadius: 2,
                background: visible ? "rgba(124,58,237,0.22)" : "rgba(255,255,255,0.08)",
              }}
            />
            {/* Revealed label — remounts on each cycle */}
            {cycleKey > 0 && (
              <span
                key={cycleKey}
                style={{
                  fontSize: 9, fontFamily: "monospace",
                  color: line.muted ? "#6b7280" : "#10b981",
                  opacity: 0,
                  animation: `pv-reveal 300ms cubic-bezier(0.4,0,0.2,1) ${line.revealDelay} forwards`,
                }}
              >
                {line.text}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. AnalyticsAnimation
//    5 bars grow up (700ms, 120ms stagger), hold 2s, shrink back (500ms), restart.
//    Uses phase-based CSS transitions so the shrink-down is explicit.
// ─────────────────────────────────────────────────────────────────────────────

const AN_BARS = [
  { pct: 40, label: "Mon" },
  { pct: 65, label: "Tue" },
  { pct: 55, label: "Wed" },
  { pct: 80, label: "Thu" },
  { pct: 70, label: "Fri" },
];
const AN_MAX_H = 70; // max bar height px
const AN_TALLEST = 3; // index of Thu (80%)

// Timing:
// phase 0 → 1: entrance 200ms
// bars done:  last bar (i=4) at 4×120 + 700 = 1180ms → enter hold at 1300ms
// phase 1 → 2 at 1300ms (hold)
// phase 2 → 3 at 3300ms (shrink)
// phase 3 → 0 at 3850ms, restart after 100ms = 3950ms total cycle

export function AnalyticsAnimation({ active }: { active: boolean }) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    function clearTimers() {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    }

    if (!active) {
      clearTimers();
      setPhase(0);
      return;
    }

    function runCycle() {
      setPhase(1);
      const t1 = setTimeout(() => setPhase(2), 1300);
      const t2 = setTimeout(() => setPhase(3), 3300);
      const t3 = setTimeout(() => {
        setPhase(0);
        const restart = setTimeout(runCycle, 100);
        timersRef.current.push(restart);
      }, 3850);
      timersRef.current = [t1, t2, t3];
    }

    const entrance = setTimeout(runCycle, 200);
    timersRef.current = [entrance];
    return clearTimers;
  }, [active]);

  const isUp = phase === 1 || phase === 2;

  return (
    <div
      style={{
        width: 280, height: 120,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "flex-end", padding: "0 14px 8px", boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex", alignItems: "flex-end", gap: 8,
          height: AN_MAX_H + 24, width: "100%", maxWidth: 230,
          position: "relative",
        }}
      >
        {/* +24% label — fades in during hold phase */}
        <span
          style={{
            position: "absolute",
            bottom: 24 + Math.round((AN_BARS[AN_TALLEST].pct / 100) * AN_MAX_H) + 4,
            left: `calc(${((AN_TALLEST + 0.5) / AN_BARS.length) * 100}%)`,
            transform: "translateX(-50%)",
            fontSize: 10, fontFamily: "monospace", color: "#10b981",
            whiteSpace: "nowrap",
            opacity: phase === 2 ? 1 : 0,
            transition: "opacity 400ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          +24%
        </span>

        {AN_BARS.map((bar, i) => {
          const targetH = Math.round((bar.pct / 100) * AN_MAX_H);
          return (
            <div
              key={i}
              style={{
                flex: 1, display: "flex",
                flexDirection: "column", alignItems: "center", gap: 5,
              }}
            >
              <div
                style={{
                  width: "100%", height: AN_MAX_H,
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: isUp ? targetH : 0,
                    background: "linear-gradient(to top, #7C3AED, #a78bfa)",
                    borderRadius: "3px 3px 0 0",
                    position: "relative", overflow: "hidden",
                    // Growing: staggered per bar. Shrinking: all together.
                    transition:
                      phase === 1
                        ? `height 700ms cubic-bezier(0.4,0,0.2,1) ${i * 120}ms`
                        : phase === 3
                        ? "height 500ms ease-in-out"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 3,
                      background: "rgba(255,255,255,0.28)",
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                </div>
              </div>
              <span style={{ fontSize: 9, color: "#6b7280", fontFamily: "monospace" }}>
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
