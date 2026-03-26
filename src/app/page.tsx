import Link from "next/link";
import {
  GitBranch,
  Zap,
  BarChart3,
  ArrowRight,
  Github,
  CheckCircle2,
  FileText,
  CalendarDays,
  Lock,
  GitPullRequest,
} from "lucide-react";
import { PublishPlatformsSection } from "@/components/landing/PublishPlatformsSection";
import { LandingHero } from "@/components/ui/shape-landing-hero";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 h-14 border-b border-zinc-800/50 bg-zinc-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-violet-500">
              <span className="font-mono text-[11px] font-bold text-white">DL</span>
            </div>
            <span className="font-semibold tracking-tight text-zinc-100">Devlog</span>
          </div>

          <div className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <Link href="#features" className="transition-colors hover:text-zinc-100">
              Features
            </Link>
            <Link href="#how-it-works" className="transition-colors hover:text-zinc-100">
              How it works
            </Link>
            <Link href="#pricing" className="transition-colors hover:text-zinc-100">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-md bg-violet-500 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-400"
            >
              <Github className="h-3.5 w-3.5" />
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — animated with framer-motion shapes */}
      <LandingHero />

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Everything you need to build in public
            </h2>
            <p className="mx-auto max-w-xl text-zinc-400">
              Devlog handles the full pipeline from GitHub activity to published
              content — without exposing your core IP.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900/70"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 transition-colors group-hover:bg-zinc-700/60">
                  <feature.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="mb-2 font-semibold text-zinc-100">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-zinc-800 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Ship code. Devlog handles the rest.
            </h2>
            <p className="text-zinc-400">
              A three-step pipeline from commit to content.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 font-mono text-sm font-bold text-violet-400">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mt-3 hidden h-full w-px bg-zinc-800 md:block" />
                  )}
                </div>
                <div className="pb-4">
                  <h3 className="mb-1.5 font-semibold text-zinc-100">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublishPlatformsSection />

      {/* CTA / Pricing */}
      <section id="pricing" className="border-t border-zinc-800 px-6 py-28">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
          <div className="absolute inset-0 bg-hero-glow opacity-60" />
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs text-zinc-400">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              No auto-posting — always your review first
            </div>
            <h2 className="mb-4 text-4xl font-bold tracking-tight">
              Start building in public today.
            </h2>
            <p className="mb-8 text-zinc-400">
              Connect one repo for free. Devlog will start turning your commits
              into content immediately.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-6 py-3 font-medium text-white transition-colors hover:bg-violet-400"
            >
              <Github className="h-4 w-4" />
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-zinc-600">
              Free tier · 1 repo included · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-violet-500">
              <span className="font-mono text-[9px] font-bold text-white">DL</span>
            </div>
            <span className="text-sm text-zinc-500">Devlog</span>
          </div>
          <p className="text-xs text-zinc-700">
            Built by developers who believe distribution is as important as code.
          </p>
          <div className="flex items-center gap-5 text-xs text-zinc-600">
            <Link href="#" className="transition-colors hover:text-zinc-400">Privacy</Link>
            <Link href="#" className="transition-colors hover:text-zinc-400">Terms</Link>
            <Link href="https://github.com" className="transition-colors hover:text-zinc-400">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: GitBranch,
    title: "GitHub Activity Intelligence",
    description:
      "Monitors commits, PRs, releases, and milestones. Focuses on meaningful product progress so content tells outcomes, not implementation details.",
  },
  {
    icon: Zap,
    title: "AI Post Generator",
    description:
      "Each detected event generates platform-optimized posts with the right tone for X, LinkedIn, Reddit, Indie Hackers, and dev blogs.",
  },
  {
    icon: GitPullRequest,
    title: "Dev Timeline",
    description:
      "An interactive timeline of your entire build journey. Review progress, track milestones, and see your output — even if you never post publicly.",
  },
  {
    icon: FileText,
    title: "Content Editor",
    description:
      "Review and refine every post before it goes out. Rich editing, tone adjustment, AI regeneration, and thread splitting for X.",
  },
  {
    icon: CalendarDays,
    title: "Content Calendar",
    description:
      "Schedule posts with drag-and-drop. Multi-platform visibility, queue management, and recurring update templates.",
  },
  {
    icon: Lock,
    title: "Privacy Controls",
    description:
      "Per-repo privacy levels keep your core IP private. High, medium, or low — you control exactly what detail appears in generated content.",
  },
  {
    icon: BarChart3,
    title: "Growth Analytics",
    description:
      "Track content performance across platforms. Engagement, impressions, follower growth, and best-performing posts at a glance.",
  },
];

const steps = [
  {
    title: "Connect your GitHub repo",
    description:
      "OAuth with GitHub and select which repos Devlog should monitor. Set a privacy level per repo — high, medium, or low.",
  },
  {
    title: "AI analyzes your activity",
    description:
      "Devlog detects meaningful events — commits, PRs, releases — and generates outcome-focused summaries respecting your privacy settings.",
  },
  {
    title: "Review and publish",
    description:
      "Edit, schedule, or publish posts across X, LinkedIn, and more. Nothing goes out without your explicit approval.",
  },
];

