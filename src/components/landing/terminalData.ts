export type TerminalScenario = {
  commit: {
    repo: string;
    message: string;
    branch: string;
  };
  platform: "X (Twitter)" | "LinkedIn" | "Reddit";
  generatedPost: string;
};

export const TERMINAL_SCENARIOS: TerminalScenario[] = [
  {
    commit: {
      repo: "startup-validator",
      message: "feat: implement scoring algorithm for market size analysis",
      branch: "main",
    },
    platform: "X (Twitter)",
    generatedPost:
      "Day 14 building my AI startup validator. Just shipped the scoring engine — it now evaluates ideas across market size, competition & founder fit. First real signal that this thing works.",
  },
  {
    commit: {
      repo: "portfolio-site",
      message: "fix: resolve hydration mismatch on dark mode toggle",
      branch: "main",
    },
    platform: "LinkedIn",
    generatedPost:
      "Spent 3 hours debugging a Next.js hydration issue today — the kind that only shows up in production. Turned out dark mode state was being read differently on server vs client. The fix was a single line. The lesson was worth the 3 hours.",
  },
  {
    commit: {
      repo: "devlog-app",
      message: "feat: add GitHub OAuth and per-user repo selection",
      branch: "feature/github-integration",
    },
    platform: "Reddit",
    generatedPost:
      "Built GitHub OAuth into my side project this weekend. Went down a rabbit hole with NextAuth adapter sessions vs JWT — database sessions are way more reliable for storing access tokens. Sharing in case anyone else hits the same wall.",
  },
  {
    commit: {
      repo: "ml-classifier",
      message: "perf: reduce inference time by 40% with model quantization",
      branch: "main",
    },
    platform: "X (Twitter)",
    generatedPost:
      "Cut ML inference time by 40% today using INT8 quantization. Same accuracy, fraction of the compute. If you're running models in prod and haven't tried this yet — worth an afternoon.",
  },
  {
    commit: {
      repo: "saas-boilerplate",
      message: "feat: stripe webhook handling + subscription tier enforcement",
      branch: "main",
    },
    platform: "LinkedIn",
    generatedPost:
      "Finally wired up Stripe webhooks properly. Not glamorous work — but subscription tier enforcement is the difference between a demo and a real product. Crossed that line today.",
  },
];
