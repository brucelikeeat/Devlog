"use client";

import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";
import AnimatedTerminal from "@/components/landing/AnimatedTerminal";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.08]",
            "shadow-[0_8px_32px_0_rgba(139,92,246,0.08)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.12),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-36">
      {/* Dot grid */}
      <div className="absolute inset-0 bg-dot-grid opacity-25" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-hero-glow" />

      {/* Multi-point gradient — drifts very slowly for life */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(124,58,237,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(59,130,246,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 50% 60% at 50% 100%, rgba(139,92,246,0.08) 0%, transparent 50%)
          `,
          animation: "shimmer-drift 18s ease-in-out infinite",
        }}
      />

      {/* Floating shapes — Devlog palette: violet, indigo, cyan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape
          delay={0.3}
          width={580}
          height={130}
          rotate={12}
          gradient="from-violet-500/[0.13]"
          className="left-[-12%] md:left-[-6%] top-[18%] md:top-[22%]"
        />
        <ElegantShape
          delay={0.5}
          width={480}
          height={110}
          rotate={-14}
          gradient="from-indigo-500/[0.11]"
          className="right-[-6%] md:right-[-2%] top-[65%] md:top-[70%]"
        />
        <ElegantShape
          delay={0.4}
          width={280}
          height={72}
          rotate={-8}
          gradient="from-cyan-500/[0.10]"
          className="left-[4%] md:left-[8%] bottom-[8%] md:bottom-[12%]"
        />
        <ElegantShape
          delay={0.6}
          width={190}
          height={54}
          rotate={20}
          gradient="from-violet-400/[0.10]"
          className="right-[14%] md:right-[18%] top-[10%] md:top-[14%]"
        />
        <ElegantShape
          delay={0.7}
          width={140}
          height={38}
          rotate={-22}
          gradient="from-indigo-400/[0.09]"
          className="left-[22%] md:left-[26%] top-[6%] md:top-[10%]"
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Eyebrow badge */}
        <FadeUp delay={0.3} className="mb-8">
          <div
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(59,130,246,0.1))",
              border: "1px solid rgba(167,139,250,0.35)",
              borderRadius: 999,
              padding: "6px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <div
              className="animate-pulse"
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#a78bfa",
                boxShadow: "0 0 8px rgba(167,139,250,0.8)",
                flexShrink: 0,
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
              AI-powered developer growth engine
            </span>
          </div>
        </FadeUp>

        {/* Headline */}
        <FadeUp delay={0.48}>
          <h1 className="mb-6 text-balance text-5xl font-bold leading-[1.07] tracking-tight md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
              Turn your commits
            </span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 40%, #6d28d9 70%, #c4b5fd 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              into content.
            </span>
          </h1>
        </FadeUp>

        {/* Subheadline */}
        <FadeUp delay={0.66}>
          <p className="mx-auto mb-10 max-w-2xl text-balance text-base leading-relaxed text-white/40 sm:text-lg md:text-xl">
            Devlog monitors your GitHub activity and generates platform-optimized
            posts for X, LinkedIn, and beyond — so you can build in public without
            the overhead.
          </p>
        </FadeUp>

        {/* CTAs */}
        <FadeUp delay={0.84} className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)",
              boxShadow: "0 4px 24px rgba(124,58,237,0.45), 0 1px 0 rgba(255,255,255,0.1) inset",
              borderRadius: 12,
              padding: "12px 24px",
              fontSize: 15,
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 6px 32px rgba(124,58,237,0.65), 0 1px 0 rgba(255,255,255,0.1) inset";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 24px rgba(124,58,237,0.45), 0 1px 0 rgba(255,255,255,0.1) inset";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <Github className="h-4 w-4" />
            Connect GitHub — it&apos;s free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/timeline"
            className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.03] px-5 py-2.5 font-medium text-white/70 transition-colors hover:border-white/20 hover:text-white"
          >
            See the timeline
          </Link>
        </FadeUp>

        {/* Terminal mockup */}
        <FadeUp delay={1.02} className="mx-auto mt-16 max-w-2xl">
          <AnimatedTerminal />
        </FadeUp>
      </div>

      {/* Bottom fade-out */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
    </section>
  );
}
