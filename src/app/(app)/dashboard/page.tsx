import Link from "next/link";
import { getServerSession } from "next-auth";
import { Topbar } from "@/components/layout/Topbar";
import { authOptions } from "@/lib/auth";
import { fetchTimelineEntries } from "@/server/timeline/fetchTimelineEntries";
import type { TimelineEntry } from "@/features/timeline/types";
import {
  GitCommit,
  FileText,
  GitPullRequest,
  Tag,
  ArrowRight,
  Plus,
  Github,
  Activity,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const sec = Math.max(0, Math.round(diff / 1000));
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.round(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.round(mo / 12)}y ago`;
}

const ACTIVITY_STYLES: Record<
  TimelineEntry["type"],
  { icon: LucideIcon; iconBg: string; iconColor: string; verb: string }
> = {
  commit: {
    icon: GitCommit,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    verb: "commit",
  },
  pr: {
    icon: GitPullRequest,
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-400",
    verb: "pull request",
  },
  release: {
    icon: Tag,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-400",
    verb: "release",
  },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const repoName = session?.user?.selectedGithubRepo ?? null;

  const result = userId
    ? await fetchTimelineEntries(userId)
    : ({ ok: true, entries: [] } as const);

  const entries = result.ok ? result.entries : [];
  const noToken = !result.ok && result.reason === "no_token";
  const fetchError = !result.ok && result.reason === "fetch_error";
  const fetchErrorMessage =
    !result.ok && result.reason === "fetch_error" ? result.message : null;

  const now = Date.now();
  const commitsThisWeek = entries.filter(
    (e) => e.type === "commit" && now - new Date(e.dateIso).getTime() <= WEEK_MS,
  ).length;
  const prCount = entries.filter((e) => e.type === "pr").length;
  const releaseCount = entries.filter((e) => e.type === "release").length;
  const totalEvents = entries.length;

  const stats = [
    {
      label: "Commits this week",
      value: String(commitsThisWeek),
      change: repoName ? `on ${repoName}` : "Connect a repo to start tracking",
      icon: GitCommit,
    },
    {
      label: "Pull requests",
      value: String(prCount),
      change: prCount > 0 ? "tracked from GitHub" : "None tracked yet",
      icon: GitPullRequest,
    },
    {
      label: "Releases",
      value: String(releaseCount),
      change: releaseCount > 0 ? "tracked from GitHub" : "None published yet",
      icon: Tag,
    },
    {
      label: "Events tracked",
      value: String(totalEvents),
      change: totalEvents > 0 ? "across your repo" : "Waiting for activity",
      icon: Activity,
    },
  ];

  const recentActivity = entries.slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dashboard"
        description="Overview of your build activity and generated content"
      />

      <main className="flex-1 p-6 space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">
            {session?.user?.name
              ? `Welcome back, ${session.user.name.split(" ")[0]}.`
              : "Welcome back."}
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            {repoName ? (
              <>
                Tracking{" "}
                <span className="font-mono text-zinc-400">{repoName}</span>.
              </>
            ) : (
              "Connect a GitHub repo to start tracking your activity."
            )}
          </p>
        </div>

        {noToken && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3">
            <Github className="h-4 w-4 flex-shrink-0 text-amber-400" />
            <p className="text-sm text-zinc-300">
              Your GitHub connection needs a refresh.
            </p>
            <Link
              href="/settings"
              className="ml-auto text-xs text-amber-400 transition-colors hover:text-amber-300"
            >
              Reconnect →
            </Link>
          </div>
        )}

        {fetchError && (
          <div className="flex flex-col gap-2 rounded-lg border border-red-500/25 bg-red-500/5 px-4 py-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <RefreshCw className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" />
              <div className="min-w-0">
                <p className="text-sm text-zinc-300">
                  Could not load activity from GitHub.
                </p>
                {fetchErrorMessage && (
                  <p className="mt-0.5 truncate font-mono text-[11px] text-red-300/80">
                    {fetchErrorMessage}
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/settings"
              className="flex-shrink-0 text-xs text-red-300 transition-colors hover:text-red-200"
            >
              Open Settings →
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-zinc-500">{stat.label}</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800">
                  <stat.icon className="h-3.5 w-3.5 text-zinc-400" />
                </div>
              </div>
              <p className="font-mono text-2xl font-bold tracking-tight text-zinc-100">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-zinc-600">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
              <h3 className="text-sm font-medium text-zinc-100">Recent Activity</h3>
              <Link
                href="/timeline"
                className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-violet-400"
              >
                View timeline
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentActivity.length > 0 ? (
              <div className="divide-y divide-zinc-800/60">
                {recentActivity.map((item) => {
                  const style = ACTIVITY_STYLES[item.type];
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="flex items-start gap-3 px-5 py-3.5"
                    >
                      <div
                        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${style.iconBg}`}
                      >
                        <style.icon className={`h-3.5 w-3.5 ${style.iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm leading-snug text-zinc-200">
                          {item.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-[11px] text-zinc-500">
                            {item.repo.split("/").pop()}
                          </span>
                          <span className="text-zinc-700">·</span>
                          <span className="text-[11px] text-zinc-500">
                            {relativeTime(item.dateIso)}
                          </span>
                        </div>
                      </div>
                      <span className="flex-shrink-0 rounded border border-zinc-700/60 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] capitalize text-zinc-400">
                        {style.verb}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-12 text-center">
                <Activity className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
                <p className="text-sm text-zinc-500">
                  {repoName
                    ? "No activity found yet for this repo."
                    : "No activity to show."}
                </p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  {repoName
                    ? "New commits, PRs, and releases will appear here."
                    : "Connect a repository to start tracking activity."}
                </p>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
            <div className="border-b border-zinc-800 px-5 py-3.5">
              <h3 className="text-sm font-medium text-zinc-100">Quick Actions</h3>
            </div>

            <div className="space-y-2 p-4">
              <Link
                href="/generate"
                className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                  <span className="flex-1 text-xs">Generate a post</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
              <Link
                href="/timeline"
                className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                  <span className="flex-1 text-xs">View your timeline</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
              <Link
                href="/settings"
                className="block w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-left text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
              >
                <div className="flex items-center gap-3">
                  <Github className="h-4 w-4 flex-shrink-0 text-zinc-500" />
                  <span className="flex-1 text-xs">Manage GitHub connection</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </div>

            <div className="px-4 pb-4">
              {repoName ? (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <Github className="mx-auto mb-2 h-6 w-6 text-emerald-400/70" />
                  <p className="mb-1 text-xs text-zinc-400">Connected repo</p>
                  <p className="mb-3 font-mono text-[11px] leading-relaxed text-emerald-400">
                    {repoName}
                  </p>
                  <Link
                    href="/settings#github"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 transition-colors hover:text-violet-300"
                  >
                    Change repository
                  </Link>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 p-4 text-center">
                  <Github className="mx-auto mb-2 h-6 w-6 text-zinc-700" />
                  <p className="mb-1 text-xs text-zinc-500">No repo connected</p>
                  <p className="mb-3 text-[11px] leading-relaxed text-zinc-600">
                    Connect a GitHub repo to start tracking activity.
                  </p>
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 transition-colors hover:text-violet-300"
                  >
                    <Plus className="h-3 w-3" />
                    Connect a repository
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
