"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 20;
const PARTICLE_COLOR = "124, 58, 237"; // #7C3AED as RGB components
const CONNECTION_DISTANCE = 120;
const CONNECTION_OPACITY = 0.12;
const MIN_RADIUS = 2;
const MAX_RADIUS = 4;
const MIN_SPEED = 0.15;
const MAX_SPEED = 0.30;
const OPACITIES = [0.4, 0.7, 1.0];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
};

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function initParticles(width: number, height: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => {
    const speed = rand(MIN_SPEED, MAX_SPEED);
    const angle = Math.random() * Math.PI * 2;
    return {
      x: rand(0, width),
      y: rand(0, height),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: rand(MIN_RADIUS, MAX_RADIUS),
      opacity: OPACITIES[Math.floor(Math.random() * OPACITIES.length)],
    };
  });
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let particles: Particle[] = [];

    function setSize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      canvas!.width = width;
      canvas!.height = height;
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;

      ctx!.clearRect(0, 0, w, h);

      // Update and draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x - p.radius < 0) { p.x = p.radius; p.vx = Math.abs(p.vx); }
        if (p.x + p.radius > w) { p.x = w - p.radius; p.vx = -Math.abs(p.vx); }
        if (p.y - p.radius < 0) { p.y = p.radius; p.vy = Math.abs(p.vy); }
        if (p.y + p.radius > h) { p.y = h - p.radius; p.vy = -Math.abs(p.vy); }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            // Fade line as distance increases
            const alpha = CONNECTION_OPACITY * (1 - dist / CONNECTION_DISTANCE);
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.strokeStyle = `rgba(${PARTICLE_COLOR}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        }
      }

      // Draw particles on top of lines
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${PARTICLE_COLOR}, ${p.opacity})`;
        ctx!.fill();
      }

      rafId = requestAnimationFrame(draw);
    }

    // Init
    setSize();
    particles = initParticles(canvas.width, canvas.height);

    // Handle container resize
    const observer = new ResizeObserver(() => {
      setSize();
      // Re-clamp all particles to the new bounds
      for (const p of particles) {
        p.x = Math.min(p.x, canvas!.width - p.radius);
        p.y = Math.min(p.y, canvas!.height - p.radius);
      }
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
