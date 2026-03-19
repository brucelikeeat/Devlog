import { Topbar } from "@/components/layout/Topbar";

const STATS = [
  { label: "Timeline entries", value: "42", note: "Across commits, PRs, and releases" },
  { label: "Draft posts", value: "9", note: "Ready to review and refine" },
  { label: "Published", value: "14", note: "Shared across social platforms" },
];

const RECENT_ACTIVITY = [
  "Refined the timeline card layout and metadata hierarchy.",
  "Restored the root Tailwind + Next.js scaffold so the app can boot cleanly.",
  "Documented architecture decisions and branch coordination rules.",
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar
        title="Dashboard"
        description="High-level view of your build journey and publishing workflow"
      />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
              >
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold text-zinc-100">{stat.value}</p>
                <p className="mt-2 text-sm text-zinc-400">{stat.note}</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <p className="text-sm font-medium text-zinc-200">Recent activity</p>
            <div className="mt-4 space-y-3">
              {RECENT_ACTIVITY.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-400"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
