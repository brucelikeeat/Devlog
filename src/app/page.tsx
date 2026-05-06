import Link from "next/link";
import PlatformMarquee from "@/components/landing/PlatformMarquee";
import GitGraphBackground from "@/components/landing/GitGraphBackground";
import DevlogLogo from "@/components/brand/DevlogLogo";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingSection from "@/components/landing/PricingSection";
import ScrollRevealInit from "@/components/landing/ScrollRevealInit";
import { Github } from "lucide-react";
import { LandingHero } from "@/components/ui/shape-landing-hero";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0D0D12] text-zinc-100">
      <ScrollRevealInit />
      <GitGraphBackground />

      {/* Navbar */}
      <nav className="fixed inset-x-0 top-0 z-50 h-14 border-b border-zinc-800/50 bg-[#0D0D12]/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center">
            <DevlogLogo width={140} color="#6B35D9" />
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
      <div className="relative z-10">
        <LandingHero />
      </div>

      {/* Features */}
      <div id="features" className="relative z-10">
        <FeaturesSection />
      </div>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 border-t border-zinc-800 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight reveal reveal-up">
              Ship code. Devlog handles the rest.
            </h2>
            <p className="text-zinc-400 reveal reveal-up delay-1">
              A three-step pipeline from commit to content.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3 md:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className={`flex gap-4 reveal ${
                  i === 0
                    ? "reveal-left delay-1"
                    : i === 1
                    ? "reveal-up delay-2"
                    : "reveal-right delay-3"
                }`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-mono text-sm font-bold border ${
                      i === 0
                        ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                        : i === 1
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
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

      {/* Platforms */}
      <div className="relative z-10">
        <PlatformMarquee />
      </div>

      {/* CTA / Pricing */}
      <section id="pricing" className="relative z-10 border-t border-white/5">
        <PricingSection />
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center opacity-50">
            <DevlogLogo width={100} color="#6B35D9" />
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

const platforms = [
  "X (Twitter)",
  "LinkedIn",
  "Reddit",
  "Indie Hackers",
  "Dev.to",
  "Hashnode",
  "Product Hunt",
];
