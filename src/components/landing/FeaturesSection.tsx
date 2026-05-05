"use client";

import { useState, useEffect } from "react";
import {
  GitBranch,
  Zap,
  GitPullRequest,
  FileText,
  CalendarDays,
  Lock,
  BarChart3,
} from "lucide-react";
import FeatureCard from "@/components/landing/FeatureCard";
import {
  CommitGraphAnimation,
  PostGeneratorAnimation,
  TimelineAnimation,
  ContentEditorAnimation,
  ContentCalendarAnimation,
  PrivacyAnimation,
  AnalyticsAnimation,
} from "@/components/landing/featureAnimations";
import { useInView } from "@/hooks/useInView";

// ── Feature definitions ───────────────────────────────────────────────────────

const FEATURES: {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  animation: (active: boolean) => React.ReactNode;
  colSpan: "1" | "2";
}[] = [
  {
    id: "github",
    icon: <GitBranch className="h-4 w-4" />,
    title: "GitHub Activity Intelligence",
    description:
      "Monitors commits, PRs, releases, and milestones. Focuses on meaningful product progress so content tells outcomes, not implementation details.",
    animation: (active) => <CommitGraphAnimation active={active} />,
    colSpan: "1",
  },
  {
    id: "ai-post",
    icon: <Zap className="h-4 w-4" />,
    title: "AI Post Generator",
    description:
      "Each detected event generates platform-optimized posts with the right tone for X, LinkedIn, Reddit, Indie Hackers, and dev blogs.",
    animation: (active) => <PostGeneratorAnimation active={active} />,
    colSpan: "2",
  },
  {
    id: "timeline",
    icon: <GitPullRequest className="h-4 w-4" />,
    title: "Dev Timeline",
    description:
      "An interactive timeline of your entire build journey. Review progress, track milestones, and see your output — even if you never post publicly.",
    animation: (active) => <TimelineAnimation active={active} />,
    colSpan: "1",
  },
  {
    id: "editor",
    icon: <FileText className="h-4 w-4" />,
    title: "Content Editor",
    description:
      "Review and refine every post before it goes out. Rich editing, tone adjustment, AI regeneration, and thread splitting for X.",
    animation: (active) => <ContentEditorAnimation active={active} />,
    colSpan: "1",
  },
  {
    id: "calendar",
    icon: <CalendarDays className="h-4 w-4" />,
    title: "Content Calendar",
    description:
      "Schedule posts with drag-and-drop. Multi-platform visibility, queue management, and recurring update templates.",
    animation: (active) => <ContentCalendarAnimation active={active} />,
    colSpan: "1",
  },
  {
    id: "privacy",
    icon: <Lock className="h-4 w-4" />,
    title: "Privacy Controls",
    description:
      "Per-repo privacy levels keep your core IP private. High, medium, or low — you control exactly what detail appears in generated content.",
    animation: (active) => <PrivacyAnimation active={active} />,
    colSpan: "1",
  },
  {
    id: "analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    title: "Growth Analytics",
    description:
      "Track content performance across platforms. Engagement, impressions, follower growth, and best-performing posts at a glance.",
    animation: (active) => <AnalyticsAnimation active={active} />,
    colSpan: "1",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function FeaturesSection() {
  // Auto-cycle controls which card gets the purple border highlight.
  // It always runs — hover only redirects which card is highlighted.
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % FEATURES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Scroll-reveal for the heading
  const { ref: headingRef, inView: headingInView } = useInView({ threshold: 0.2 });

  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Heading — scroll-reveal */}
        <div
          ref={headingRef}
          style={{
            opacity: headingInView ? 1 : 0,
            transform: headingInView ? "translateY(0)" : "translateY(12px)",
            transition:
              "opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-white">
            Everything you need to build in public
          </h2>
          <p className="mx-auto max-w-xl text-white/50">
            Devlog handles the full pipeline from GitHub activity to published
            content — without exposing your core IP.
          </p>
        </div>

        {/* Bento grid — cards cascade in via staggered transitionDelay */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.id}
              className={
                feature.colSpan === "2" ? "md:col-span-2" : "md:col-span-1"
              }
              // Redirect the highlight to the hovered card instantly
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                // Cascade: each card delays its inView transition by 80ms × index
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                animation={feature.animation}
                colSpan={feature.colSpan}
                isAutoActive={activeIndex === i}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
