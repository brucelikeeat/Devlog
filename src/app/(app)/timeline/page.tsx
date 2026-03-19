import { Topbar } from "@/components/layout/Topbar";
import {
  GitCommit,
  GitPullRequest,
  Tag,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Timeline",
};

const timelineEntries = [
  {
    id: 1,
    type: "commit" as const,
    title: "Set up base Next.js application structure",
    summary:
      "Initialized the Next.js app with TypeScript, Tailwind CSS, and core layout components including the sidebar, topbar, and dashboard shell.",
    repo: "devlog",
    branch: "feature/base-app-structure",
    time: "Today, 9:41 AM",
    icon: GitCommit,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    postStatus: "draft" as const,
  },
  {
    id: 2,
    type: "pr" as const,
    title: "feature/dev-timeline-ui — opened",
    summary:
      "Opened pull request for the developer timeline UI feature. Includes timeline component architecture, event type definitions, and activity feed layout.",
    repo: "devlog",
    branch: "feature/dev-timeline-ui",
    time: "Mar 16, 2026",
    icon: GitPullRequest,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    postStatus: null,
  },
  {
    id: 3,
    type: "release" as const,
    title: "v0.1.0 — Project scaffolded",
    summary:
      "Initial project structure established. Documentation, architecture decisions, and folder layout defined. The foundation for Devlog's single-app Next.js structure is in place.",
    repo: "devlog",
    branch: "main",
    time: "Mar 15, 2026",
    icon: Tag,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    postStatus: null,
  },
];

const typeFilters = ["All", "Commits", "PRs", "Releases"];

export default function TimelinePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dev Timeline"
        description="Your complete build journey, commit by commit"
      />

      <main className="flex-1 p-6 animate-fade-in">
        {/* Controls bar */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search timeline..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 transition-colors focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          <button className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>

          <div className="flex overflow-hidden rounded-lg border border-zinc-800 text-xs">
            {typeFilters.map((filter, i) => (
              <button
                key={filter}
                className={`px-3 py-2 transition-colors ${
                  i === 0
                    ? "bg-zinc-800 text-zinc-100"
                    : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative max-w-3xl">
          {/* Vertical spine */}
          <div className="absolute left-5 top-5 bottom-6 w-px bg-zinc-800" />

          <div className="space-y-1">
            {timelineEntries.map((entry) => (
              <div key={entry.id} className="relative flex gap-5 pb-5">
                {/* Icon node */}
                <div
                  className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800 ${entry.iconBg}`}
                >
                  <entry.icon className={`h-4 w-4 ${entry.iconColor}`} />
                </div>

                {/* Entry card */}
                <div className="group flex-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/70">
                  {/* Meta */}
                  <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      {entry.type}
                    </span>
                    <span className="text-zinc-700">·</span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {entry.repo}
                    </span>
                    <span className="text-zinc-700">·</span>
                    <span className="max-w-[180px] truncate font-mono text-[11px] text-zinc-600">
                      {entry.branch}
                    </span>
                  </div>

                  {/* Title + timestamp */}
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-medium text-zinc-100 leading-snug">
                      {entry.title}
                    </h4>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                      <span className="whitespace-nowrap text-[11px] text-zinc-500">
                        {entry.time}
                      </span>
                      {entry.postStatus === "draft" && (
                        <span className="rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
                          draft post
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
                    {entry.summary}
                  </p>

                  {/* Hover action bar */}
                  <div className="mt-3 hidden items-center justify-between border-t border-zinc-800 pt-3 group-hover:flex">
                    <span className="text-[11px] text-zinc-600">
                      {entry.postStatus ? "1 draft post" : "No post generated"}
                    </span>
                    <button className="flex items-center gap-1 text-[11px] text-violet-400 transition-colors hover:text-violet-300">
                      <Sparkles className="h-3 w-3" />
                      {entry.postStatus ? "Edit post" : "Generate post"}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Tail / connect prompt */}
            <div className="relative flex gap-5">
              <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-800">
                <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
              </div>
              <div className="flex flex-1 items-center">
                <p className="text-xs text-zinc-600">
                  Connect a GitHub repo to populate your full timeline
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
