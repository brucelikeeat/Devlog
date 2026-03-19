import { Topbar } from "@/components/layout/Topbar";
import {
  GitCommit,
  FileText,
  Share2,
  Flame,
  GitPullRequest,
  Tag,
  ArrowRight,
  Plus,
  Github,
  CalendarDays,
} from "lucide-react";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dashboard"
        description="Overview of your build activity and generated content"
      />

      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
            Good morning.
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Here&apos;s what&apos;s happening with your repos today.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800">
                  <stat.icon className="h-3.5 w-3.5 text-zinc-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-zinc-100 font-mono tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-zinc-600 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Main content row */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Recent activity */}
          <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-100">
                Recent Activity
              </h3>
              <a
                href="/timeline"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-violet-400 transition-colors"
              >
                View timeline
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>

            <div className="divide-y divide-zinc-800/60">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${item.iconBg}`}
                  >
                    <item.icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 leading-snug">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[11px] text-zinc-500">
                        {item.repo}
                      </span>
                      <span className="text-zinc-700">·</span>
                      <span className="text-[11px] text-zinc-500">{item.time}</span>
                    </div>
                  </div>
                  {item.hasPost && (
                    <span className="flex-shrink-0 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400">
                      post ready
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-100">
                Quick Actions
              </h3>
            </div>

            <div className="p-4 space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  disabled={action.disabled}
                  className="w-full flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-100 transition-colors disabled:opacity-35 disabled:cursor-not-allowed text-left"
                >
                  <action.icon className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  <span className="flex-1 text-xs">{action.label}</span>
                  {action.disabled && (
                    <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-700">
                      soon
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Connect repo prompt */}
            <div className="px-4 pb-4">
              <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-4 text-center">
                <Github className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
                <p className="mb-1 text-xs text-zinc-500">No repos connected</p>
                <p className="mb-3 text-[11px] text-zinc-600 leading-relaxed">
                  Connect a GitHub repo to start tracking activity.
                </p>
                <button className="inline-flex items-center gap-1.5 text-xs text-violet-400 transition-colors hover:text-violet-300">
                  <Plus className="h-3 w-3" />
                  Connect a repository
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const stats = [
  {
    label: "Commits this week",
    value: "0",
    change: "Connect a repo to start tracking",
    icon: GitCommit,
  },
  {
    label: "Posts generated",
    value: "0",
    change: "Waiting for GitHub activity",
    icon: FileText,
  },
  {
    label: "Platforms connected",
    value: "0",
    change: "Add publishing targets",
    icon: Share2,
  },
  {
    label: "Build streak",
    value: "—",
    change: "Start shipping to track",
    icon: Flame,
  },
];

const recentActivity = [
  {
    id: 1,
    type: "commit",
    title: "Set up base Next.js application structure",
    repo: "devlog",
    time: "just now",
    icon: GitCommit,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    hasPost: false,
  },
  {
    id: 2,
    type: "pr",
    title: "feature/dev-timeline-ui — opened",
    repo: "devlog",
    time: "2 days ago",
    icon: GitPullRequest,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    hasPost: false,
  },
  {
    id: 3,
    type: "release",
    title: "v0.1.0 · Project initialized",
    repo: "devlog",
    time: "3 days ago",
    icon: Tag,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    hasPost: false,
  },
];

const quickActions = [
  {
    label: "Generate post from latest commit",
    icon: FileText,
    disabled: true,
  },
  {
    label: "Connect a GitHub repository",
    icon: Github,
    disabled: false,
  },
  {
    label: "Schedule a post",
    icon: CalendarDays,
    disabled: true,
  },
];
