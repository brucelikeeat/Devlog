// Icon only — no wordmark. Use for: favicon, mobile nav, small avatar, tab icon.

interface DevlogIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function DevlogIcon({
  size = 48,
  color = "#6B35D9",
  className = "",
}: DevlogIconProps) {
  return (
    <svg
      viewBox="0 0 110 110"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Devlog icon"
      role="img"
      fill="none"
    >
      {/* Outer circle */}
      <circle cx="55" cy="55" r="49" stroke={color} strokeWidth="4" fill="none" />

      {/* Left commit tail */}
      <line x1="10" y1="55" x2="35" y2="55" stroke={color} strokeWidth="4" strokeLinecap="round" />

      {/* Commit dot */}
      <circle cx="42" cy="55" r="8.5" fill={color} />

      {/* Arc 1 — small */}
      <path d="M 53 45 A 13 13 0 0 1 53 65" stroke={color} strokeWidth="4" strokeLinecap="round" />

      {/* Arc 2 — medium */}
      <path d="M 61 37 A 21 21 0 0 1 61 73" stroke={color} strokeWidth="4" strokeLinecap="round" />

      {/* Arc 3 — large */}
      <path d="M 69 29 A 29 29 0 0 1 69 81" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
