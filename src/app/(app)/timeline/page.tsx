import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { Github } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { TimelineView } from "@/components/timeline";
import { authOptions } from "@/lib/auth";
import type { TimelineEntry } from "@/features/timeline/types";

export const metadata = {
  title: "Timeline",
};

export default async function TimelinePage() {
  const session = await getServerSession(authOptions);
  const repoName = session?.user?.selectedGithubRepo ?? null;

  // Forward cookies so /api/timeline can read the session.
  const cookieHeader = headers().get("cookie") ?? "";
  const baseUrl = process.env.NEXTAUTH_URL?.trim() ?? "http://localhost:3000";

  let entries: TimelineEntry[] = [];
  let fetchError = false;

  try {
    const res = await fetch(`${baseUrl}/api/timeline`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) {
      const data: unknown = await res.json();
      entries = Array.isArray(data) ? (data as TimelineEntry[]) : [];
    }
  } catch {
    fetchError = true;
  }

  const isEmpty = entries.length === 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dev Timeline"
        description="Your complete build journey, commit by commit"
      />
      <main className="flex-1 p-6 animate-fade-in">
        {repoName && !isEmpty && (
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

        {isEmpty ? (
          <div className="mt-24 text-center">
            <p className="text-sm text-zinc-500">
              {fetchError
                ? "Could not load events. Check your GitHub connection in Settings."
                : "No events yet. Connect a GitHub repo in Settings to get started."}
            </p>
            {!fetchError && (
              <p className="mt-2">
                <a
                  href="/settings"
                  className="text-sm text-violet-400 transition-colors hover:text-violet-300"
                >
                  Go to Settings →
                </a>
              </p>
            )}
          </div>
        ) : (
          <TimelineView entries={entries} />
        )}
      </main>
    </div>
  );
}
