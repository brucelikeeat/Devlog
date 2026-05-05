// Full wordmark — infinitely scalable SVG. No Nunito loaded; uses GeistSans
// (already loaded globally via --font-geist-sans).

interface DevlogLogoProps {
  width?: number;
  color?: string;
  className?: string;
}

export default function DevlogLogo({
  width = 280,
  color = "#6B35D9",
  className = "",
}: DevlogLogoProps) {
  const height = Math.round(width * (110 / 480));

  return (
    <svg
      viewBox="0 0 480 110"
      width={width}
      height={height}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Devlog"
      role="img"
      fill="none"
    >
      {/* ── ICON ─────────────────────────────────────────── */}

      {/* Outer circle */}
      <circle cx="55" cy="55" r="49" stroke={color} strokeWidth="3.8" fill="none" />

      {/* Left commit tail */}
      <line x1="10" y1="55" x2="34" y2="55" stroke={color} strokeWidth="3.8" strokeLinecap="round" />

      {/* Commit dot */}
      <circle cx="41" cy="55" r="8" fill={color} />

      {/* Arc 1 — small, closest */}
      <path d="M 51 45 A 13 13 0 0 1 51 65" stroke={color} strokeWidth="3.5" strokeLinecap="round" />

      {/* Arc 2 — medium */}
      <path d="M 58 37 A 21 21 0 0 1 58 73" stroke={color} strokeWidth="3.5" strokeLinecap="round" />

      {/* Arc 3 — large, outermost */}
      <path d="M 65 29 A 29 29 0 0 1 65 81" stroke={color} strokeWidth="3.5" strokeLinecap="round" />

      {/* ── WORDMARK ─────────────────────────────────────── */}
      {/* Uses GeistSans (--font-geist-sans) loaded globally in layout.tsx */}
      <text
        x="122"
        y="77"
        fontFamily="var(--font-geist-sans), 'Geist', 'Inter', system-ui, sans-serif"
        fontWeight="800"
        fontSize="60"
        letterSpacing="-1"
        fill={color}
      >
        Devlog
      </text>
    </svg>
  );
}
