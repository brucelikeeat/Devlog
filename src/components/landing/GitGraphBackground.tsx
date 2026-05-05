"use client";

import { useEffect, useRef } from "react";

type Node = {
  id: number;
  x: number;
  y: number;
  vx: number;
  lane: number;
  opacity: number;
  radius: number;
  isPulsing: boolean;
  pulsePhase: number;
  age: number;
  maxAge: number;
};

type Edge = {
  fromId: number;
  toId: number;
  opacity: number;
  color: string;
};

let nextId = 0;

function spawnNode(canvasHeight: number, lane: number): Node {
  const laneCount = 6;
  const laneY = (canvasHeight / (laneCount + 1)) * (lane + 1);
  const jitter = (Math.random() - 0.5) * (canvasHeight / laneCount) * 0.35;

  return {
    id: nextId++,
    x: -20,
    y: laneY + jitter,
    vx: 0.28 + Math.random() * 0.17,
    lane,
    opacity: 0,
    radius: 3 + Math.random() * 3,
    isPulsing: Math.random() < 0.15,
    pulsePhase: Math.random() * Math.PI * 2,
    age: 0,
    maxAge: 280 + Math.floor(Math.random() * 101),
  };
}

export default function GitGraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const rafRef = useRef<number>(0);
  const edgeCountRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(document.documentElement);

    function tryAddEdge(newNode: Node) {
      const maxEdgesPerNode = 2;
      if ((edgeCountRef.current.get(newNode.id) ?? 0) >= maxEdgesPerNode) return;

      for (const existing of nodesRef.current) {
        if (existing.id === newNode.id) continue;
        if ((edgeCountRef.current.get(existing.id) ?? 0) >= maxEdgesPerNode) continue;

        const laneDiff = Math.abs(existing.lane - newNode.lane);
        if (laneDiff > 1) continue;

        const dx = existing.x - newNode.x;
        const dy = existing.y - newNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 180) continue;

        edgesRef.current.push({
          fromId: newNode.id,
          toId: existing.id,
          opacity: 0,
          color: "rgba(124, 58, 237, 0.25)",
        });

        edgeCountRef.current.set(newNode.id, (edgeCountRef.current.get(newNode.id) ?? 0) + 1);
        edgeCountRef.current.set(existing.id, (edgeCountRef.current.get(existing.id) ?? 0) + 1);
        break;
      }
    }

    function maintainNodes() {
      const target = 28 + Math.floor(Math.random() * 8);
      while (nodesRef.current.length < target) {
        const lane = Math.floor(Math.random() * 6);
        const node = spawnNode(height, lane);
        nodesRef.current.push(node);
        tryAddEdge(node);
      }
    }

    function frame() {
      ctx.clearRect(0, 0, width, height);

      // Update nodes
      nodesRef.current = nodesRef.current.filter((n) => {
        n.x += n.vx;
        n.age += 1;
        n.pulsePhase += 0.04;

        if (n.age < 60) n.opacity = n.age / 60;
        else if (n.age > n.maxAge - 60) n.opacity = Math.max(0, (n.maxAge - n.age) / 60);
        else n.opacity = 1;

        if (n.x > width + 40) {
          edgeCountRef.current.delete(n.id);
          return false;
        }
        return true;
      });

      // Prune edges whose nodes are gone
      const liveIds = new Set(nodesRef.current.map((n) => n.id));
      edgesRef.current = edgesRef.current.filter(
        (e) => liveIds.has(e.fromId) && liveIds.has(e.toId)
      );

      const nodeMap = new Map(nodesRef.current.map((n) => [n.id, n]));

      // Draw edges
      let edgeFrames = 0;
      for (const edge of edgesRef.current) {
        const a = nodeMap.get(edge.fromId);
        const b = nodeMap.get(edge.toId);
        if (!a || !b) continue;

        const minOpacity = Math.min(a.opacity, b.opacity);
        edge.opacity = Math.min(edge.opacity + 1 / 40, minOpacity);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(124, 58, 237, ${edge.opacity * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        edgeFrames++;
      }

      // Draw nodes
      for (const n of nodesRef.current) {
        if (n.isPulsing) {
          // Outer glow
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * (2.5 + Math.sin(n.pulsePhase) * 0.8), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124, 58, 237, ${n.opacity * 0.08})`;
          ctx.fill();

          // Middle ring
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124, 58, 237, ${n.opacity * 0.2})`;
          ctx.fill();

          // Inner filled
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(167, 139, 250, ${n.opacity * 0.9})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124, 58, 237, ${n.opacity * 0.55})`;
          ctx.fill();
        }
      }

      // Occasional branch arc — 0.3% chance
      if (Math.random() < 0.003 && nodesRef.current.length > 0) {
        const src = nodesRef.current[Math.floor(Math.random() * nodesRef.current.length)];
        const dir = Math.random() < 0.5 ? -1 : 1;
        const len = 80 + Math.random() * 60;
        const bend = dir * (40 + Math.random() * 20);

        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.bezierCurveTo(
          src.x + len * 0.4, src.y + bend * 0.6,
          src.x + len * 0.7, src.y + bend,
          src.x + len, src.y + bend
        );
        ctx.strokeStyle = "rgba(124, 58, 237, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Spawn to maintain node count
      maintainNodes();

      // Radial gradient overlay — darkens edges, keeps focus center
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width * 0.7
      );
      gradient.addColorStop(0, "rgba(13, 13, 18, 0)");
      gradient.addColorStop(1, "rgba(13, 13, 18, 0.4)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
