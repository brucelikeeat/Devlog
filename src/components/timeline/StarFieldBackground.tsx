"use client";

import { useEffect, useRef } from "react";

type BgStar = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  speed: number;
  angle: number;
  twinkleOffset: number;
};

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createBgStars(width: number, height: number): BgStar[] {
  const stars: BgStar[] = [];
  for (let i = 0; i < 180; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: randomBetween(0.3, 1.2),
      opacity: randomBetween(0.1, 0.5),
      speed: randomBetween(0.02, 0.08),
      angle: randomBetween(0, Math.PI * 2),
      twinkleOffset: randomBetween(0, Math.PI * 2),
    });
  }
  return stars;
}

export default function StarFieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<BgStar[]>([]);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const lastSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const { w: lw, h: lh } = lastSizeRef.current;
      if (starsRef.current.length === 0 || lw !== w || lh !== h) {
        starsRef.current = createBgStars(w, h);
        lastSizeRef.current = { w, h };
      }
    };

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(container);
    resize();

    startRef.current = performance.now();

    const tick = (now: number) => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsedSec = (now - startRef.current) / 1000;
      const stars = starsRef.current;

      ctx.fillStyle = "#080810";
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        if (s.x < 0) s.x += w;
        else if (s.x >= w) s.x -= w;
        if (s.y < 0) s.y += h;
        else if (s.y >= h) s.y -= h;

        const twinkle =
          s.opacity +
          Math.sin(elapsedSec * 0.8 + s.twinkleOffset) * 0.15;
        const alpha = Math.max(0.05, Math.min(0.85, twinkle));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      }

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.max(w, h) * 0.55;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, "rgba(124,58,237,0.04)");
      grad.addColorStop(1, "rgba(124,58,237,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 block h-full w-full"
      />
    </div>
  );
}
