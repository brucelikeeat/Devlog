const MONTHLY_FEATURES = [
  "1 connected GitHub repo",
  "Unlimited AI post generations",
  "X, LinkedIn, and Reddit",
  "All tone modes",
  "Full timeline history",
  "Privacy controls — High / Medium / Low",
  "Cancel anytime",
];

const LIFETIME_FEATURES = [
  "Everything in Monthly",
  "Unlimited GitHub repos",
  "All platforms — X, LinkedIn, Reddit, Indie Hackers, Dev.to, Hashnode, Product Hunt",
  "All future updates included",
  "Priority generation speed",
  "Early access to new features",
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

export default function PricingSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      {/* Heading */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-4xl font-bold text-white reveal reveal-up">
          Simple, honest pricing
        </h2>
        <p className="mx-auto max-w-md text-lg text-white/50 reveal reveal-up delay-1">
          Pay monthly, or once and own it forever. No hidden fees.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">

        {/* ── MONTHLY CARD ──────────────────────────────────── */}
        <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 reveal reveal-left delay-2">
          {/* Plan label + price */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-white/50">
              Monthly
            </p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-white">$4.99</span>
              <span className="mb-2 text-white/40">/ month</span>
            </div>
            <p className="mt-2 text-sm text-white/30">Cancel anytime</p>
          </div>

          {/* CTA */}
          <a
            href="/login"
            className="mb-8 w-full rounded-xl border border-white/15 py-3 text-center text-sm font-medium text-white/80 hover:border-white/30 hover:text-white"
            style={{ transition: "all 0.28s cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            Get started
          </a>

          {/* Divider */}
          <div className="mb-6 border-t border-white/5" />

          {/* Feature list */}
          <ul className="flex flex-1 flex-col gap-3">
            {MONTHLY_FEATURES.map((text, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                  <CheckIcon />
                </span>
                <span className="text-sm text-white/70">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── LIFETIME CARD ─────────────────────────────────── */}
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

          {/* Best value badge */}
          <div className="absolute right-6 top-6">
            <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
              Best value
            </span>
          </div>

          {/* Plan label + price */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-purple-400">
              Lifetime
            </p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-white">$79.99</span>
              <span className="mb-2 text-white/40">/ once</span>
            </div>
            <p className="mt-2 text-sm text-white/30">
              Pay once — yours forever. Just ~16 months of Monthly.
            </p>
          </div>

          {/* CTA */}
          <a
            href="/login"
            className="relative mb-8 w-full rounded-xl py-3 text-center text-sm font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            }}
          >
            Get Lifetime access →
          </a>

          {/* Divider */}
          <div className="mb-6 border-t border-purple-500/15" />

          {/* Feature list */}
          <ul className="flex flex-1 flex-col gap-3">
            {LIFETIME_FEATURES.map((text, i) => (
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
            One-time payment · All updates included · No subscription
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
