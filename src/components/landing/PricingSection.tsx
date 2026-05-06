"use client";

import { useState } from "react";

const FREE_FEATURES = [
  { text: "1 connected GitHub repo",          included: true  },
  { text: "10 AI post generations / month",   included: true  },
  { text: "X (Twitter) and LinkedIn",         included: true  },
  { text: "Casual and professional tone",     included: true  },
  { text: "7-day timeline history",           included: true  },
  { text: "All platforms (Reddit, IH, Dev.to…)", included: false },
  { text: "Unlimited generations",            included: false },
  { text: "Privacy controls",                 included: false },
  { text: "Content calendar & scheduling",    included: false },
  { text: "Analytics dashboard",              included: false },
];

const PRO_FEATURES = [
  "Unlimited GitHub repos",
  "Unlimited AI post generations",
  "All platforms — X, LinkedIn, Reddit, Indie Hackers, Dev.to, Hashnode, Product Hunt",
  "All tone modes including feedback-seeking & educational",
  "Full timeline history",
  "Privacy controls — High / Medium / Low per repo",
  "Content calendar & scheduling",
  "Analytics dashboard",
  "Priority generation speed",
];

function CheckIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path
        d="M1 4l2 2 4-4"
        stroke="#a78bfa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path
        d="M2 2l4 4M6 2l-4 4"
        stroke="#ffffff30"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      {/* Heading */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-4xl font-bold text-white reveal reveal-up">
          Simple, honest pricing
        </h2>
        <p className="mx-auto max-w-md text-lg text-white/50 reveal reveal-up delay-1">
          Start free. Upgrade when Devlog becomes part of your workflow.
        </p>

        {/* Annual / Monthly toggle */}
        <div className="mt-8 flex items-center justify-center gap-3 reveal reveal-fade delay-2">
          <span
            className={`text-sm ${!annual ? "text-white" : "text-white/40"}`}
            style={{ transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            Monthly
          </span>
          <button
            onClick={() => setAnnual((a) => !a)}
            aria-label="Toggle billing period"
            className="relative h-6 w-12 rounded-full"
            style={{
              background: annual ? "#7C3AED" : "rgba(255,255,255,0.1)",
              transition: "background 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              className="absolute top-1 h-4 w-4 rounded-full bg-white"
              style={{
                left: annual ? "28px" : "4px",
                transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </button>
          <span
            className={`text-sm ${annual ? "text-white" : "text-white/40"}`}
            style={{ transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            Annual
            <span className="ml-2 rounded-full border border-green-400/20 bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-400">
              Save 28%
            </span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">

        {/* ── FREE CARD ─────────────────────────────────────── */}
        <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 reveal reveal-left delay-2">
          {/* Plan label + price */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-white/50">
              Free
            </p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-white">$0</span>
              <span className="mb-2 text-white/40">/ forever</span>
            </div>
            <p className="mt-2 text-sm text-white/30">No credit card required</p>
          </div>

          {/* CTA */}
          <a
            href="/login"
            className="mb-8 w-full rounded-xl border border-white/15 py-3 text-center text-sm font-medium text-white/80 hover:border-white/30 hover:text-white"
            style={{ transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            Get started free
          </a>

          {/* Divider */}
          <div className="mb-6 border-t border-white/5" />

          {/* Feature list */}
          <ul className="flex flex-1 flex-col gap-3">
            {FREE_FEATURES.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${
                    item.included ? "bg-purple-500/20" : "bg-white/5"
                  }`}
                >
                  {item.included ? <CheckIcon /> : <CrossIcon />}
                </span>
                <span
                  className={`text-sm ${
                    item.included
                      ? "text-white/70"
                      : "text-white/25 line-through decoration-white/15"
                  }`}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── PRO CARD ──────────────────────────────────────── */}
        <div
          className="relative flex flex-col overflow-hidden rounded-2xl p-8 reveal reveal-right delay-3"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.05) 100%)",
            border: "1px solid rgba(124,58,237,0.4)",
            boxShadow:
              "0 0 60px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Corner glow */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
              transform: "translate(30%, -30%)",
            }}
          />

          {/* Popular badge */}
          <div className="absolute right-6 top-6">
            <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
              Most popular
            </span>
          </div>

          {/* Plan label + price */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-purple-400">
              Pro
            </p>
            <div className="flex items-end gap-2">
              <span
                key={annual ? "annual" : "monthly"}
                className="text-5xl font-bold text-white"
                style={{ animation: "fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) both" }}
              >
                {annual ? "$10" : "$14"}
              </span>
              <span className="mb-2 text-white/40">/ month</span>
            </div>
            <p className="mt-2 text-sm text-white/30">
              {annual
                ? "Billed $120 annually — you save $48"
                : "Or $10/mo billed annually — save 28%"}
            </p>
          </div>

          {/* CTA */}
          <a
            href="/login"
            className="relative mb-8 w-full rounded-xl py-3 text-center text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 28px rgba(124,58,237,0.6)";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 20px rgba(124,58,237,0.4)";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
          >
            Start Pro free for 7 days →
          </a>

          {/* Divider */}
          <div className="mb-6 border-t border-purple-500/15" />

          {/* Feature list */}
          <ul className="flex flex-1 flex-col gap-3">
            {PRO_FEATURES.map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/25">
                  <CheckIcon />
                </span>
                <span className="text-sm text-white/75">{text}</span>
              </li>
            ))}
          </ul>

          {/* Trust note */}
          <p className="mt-6 text-center text-xs text-white/25">
            7-day free trial · Cancel anytime · No questions asked
          </p>
        </div>
      </div>

      {/* Bottom reassurance */}
      <p className="mt-10 text-center text-sm text-white/25">
        Already used by developers building in public. No lock-in, no surprises.
      </p>
    </section>
  );
}
