import { getServerSession } from "next-auth";
import { Github } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import ConstellationTimeline from "@/components/timeline/ConstellationTimeline";
import { authOptions } from "@/lib/auth";
import { fetchTimelineEntries } from "@/server/timeline/fetchTimelineEntries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Timeline",
};

export default async function TimelinePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar
          title="Dev Timeline"
          description="Your complete build journey, commit by commit"
        />
        <main className="flex-1 p-6">
          <div className="mt-24 text-center">
            <p className="text-sm text-zinc-500">Sign in to view your timeline.</p>
          </div>
        </main>
      </div>
    );
  }

  const result = await fetchTimelineEntries(session.user.id);

  const entries = result.ok ? result.entries : [];
  const fetchError = !result.ok && result.reason === "fetch_error";
  const fetchErrorMessage =
    !result.ok && result.reason === "fetch_error" ? result.message : null;
  const noToken = !result.ok && result.reason === "no_token";
  const repoName = session.user.selectedGithubRepo ?? null;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dev Timeline"
        description="Your complete build journey, commit by commit"
      />
      <main className="flex-1 p-6 animate-fade-in">
        {repoName && entries.length > 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <Github className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <p className="text-sm text-zinc-300">
              Showing events from{" "}
              <span className="font-mono text-emerald-400">{repoName}</span>
            </p>
            <span className="ml-auto text-xs text-zinc-600">
              {entries.length} event{entries.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {fetchError || noToken ? (
          <div className="mt-24 text-center">
            <p className="text-sm text-zinc-400">
              {noToken
                ? "No GitHub token on file. Reconnect GitHub in Settings."
                : "Could not load events from GitHub."}
            </p>
            {fetchErrorMessage && (
              <p className="mx-auto mt-2 max-w-lg font-mono text-[11px] text-red-300/80">
                {fetchErrorMessage}
              </p>
            )}
            <a
              href="/settings"
              className="mt-4 inline-block text-xs text-violet-400 hover:text-violet-300"
            >
              Open Settings →
            </a>
          </div>
        ) : (
          <ConstellationTimeline entries={entries} />
        )}
      </main>
    </div>
  );
}
