import { getServerSession } from "next-auth";
import { Topbar } from "@/components/layout/Topbar";
import { TimelineView } from "@/components/timeline";
import { TIMELINE_ENTRIES } from "@/features/timeline/data";
import { fetchRepoCommits } from "@/lib/github/api";
import { authOptions } from "@/lib/auth";
import { mapCommitsToTimeline } from "@/features/github/mapCommitsToTimeline";
import type { TimelineEntry } from "@/features/timeline/types";
import { Github } from "lucide-react";
import { getGithubAccessTokenForUser } from "@/server/github/getGithubAccessToken";

export const metadata = {
  title: "Timeline",
};

async function getTimelineEntries(): Promise<{
  entries: TimelineEntry[];
  source: "github" | "demo";
  repoName: string | null;
  error: string | null;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { entries: TIMELINE_ENTRIES, source: "demo", repoName: null, error: null };
  }

  const token = await getGithubAccessTokenForUser(session.user.id);
  const repo = session.user.selectedGithubRepo;

  if (!token || !repo) {
    return { entries: TIMELINE_ENTRIES, source: "demo", repoName: null, error: null };
  }

  const parts = repo.split("/");
  if (parts.length !== 2) {
    return { entries: TIMELINE_ENTRIES, source: "demo", repoName: null, error: null };
  }

  try {
    const commits = await fetchRepoCommits(token, parts[0], parts[1], {
      perPage: 20,
    });
    const entries = mapCommitsToTimeline(commits, repo);
    return { entries, source: "github", repoName: repo, error: null };
  } catch (err) {
    return {
      entries: TIMELINE_ENTRIES,
      source: "demo",
      repoName: repo,
      error: err instanceof Error ? err.message : "Failed to fetch commits",
    };
  }
}

export default async function TimelinePage() {
  const { entries, source, repoName, error } = await getTimelineEntries();

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dev Timeline"
        description="Your complete build journey, commit by commit"
      />
      <main className="flex-1 p-6 animate-fade-in">
        {source === "demo" && (
          <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
            {error ? (
              <div>
                <p className="text-sm text-amber-400">
                  Could not load commits from{" "}
                  <span className="font-mono">{repoName}</span>
                </p>
                <p className="mt-1 text-xs text-zinc-500">{error}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  Showing demo data instead. Check your connection in{" "}
                  <a href="/settings" className="text-violet-400 hover:text-violet-300">
                    Settings
                  </a>
                  .
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Github className="h-4 w-4 flex-shrink-0 text-zinc-600" />
                <div>
                  <p className="text-sm text-zinc-400">
                    Viewing demo data.{" "}
                    <a
                      href="/settings"
                      className="text-violet-400 transition-colors hover:text-violet-300"
                    >
                      Choose a GitHub repository
                    </a>{" "}
                    in Settings to see your real commits here.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {source === "github" && repoName && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <Github className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <p className="text-sm text-zinc-300">
              Showing recent commits from{" "}
              <span className="font-mono text-emerald-400">{repoName}</span>
            </p>
            <span className="ml-auto text-xs text-zinc-600">
              {entries.length} commit{entries.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-sm text-zinc-500">No commits found.</p>
            <p className="mt-1 text-xs text-zinc-600">
              This repo may be empty or there might be an issue with the
              connection.
            </p>
          </div>
        ) : (
          <TimelineView entries={entries} />
        )}
      </main>
    </div>
  );
}
