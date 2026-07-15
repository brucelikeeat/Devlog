"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Github,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RepoList } from "./RepoList";
import type { GitHubRepo } from "@/lib/github/types";
import type { GitHubConnectionStatus } from "@/lib/github/types";

interface GitHubSettingsSectionProps {
  initialStatus: GitHubConnectionStatus;
}

export function GitHubSettingsSection({
  initialStatus,
}: GitHubSettingsSectionProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [status, setStatus] = useState<GitHubConnectionStatus>(initialStatus);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repoError, setRepoError] = useState<string | null>(null);
  const [selectingRepo, setSelectingRepo] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const fetchRepos = useCallback(async () => {
    setLoadingRepos(true);
    setRepoError(null);
    try {
      const res = await fetch("/api/github/repos");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string" ? body.error : "Failed to load repositories",
        );
      }
      const data: GitHubRepo[] = await res.json();
      setRepos(data);
    } catch (err) {
      setRepoError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  useEffect(() => {
    if (status.connected) {
      fetchRepos();
    }
  }, [status.connected, fetchRepos]);

  async function handleSelectRepo(repoFullName: string) {
    setSelectingRepo(true);
    try {
      await fetch("/api/github/select-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repoFullName }),
      });
      setStatus((prev) => ({ ...prev, selectedRepo: repoFullName }));
      await updateSession();
      router.refresh();
    } finally {
      setSelectingRepo(false);
    }
  }

  async function handleStopTracking() {
    await fetch("/api/github/disconnect", { method: "POST" });
    setStatus((prev) => ({ ...prev, selectedRepo: null }));
    await updateSession();
    router.refresh();
  }

  // Signed in but GitHub token missing (expired / revoked)
  if (!status.connected) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-700 p-6 text-center">
        <Github className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
        <p className="mb-1 text-sm text-zinc-400">GitHub access needed</p>
        <p className="mx-auto mb-4 max-w-xs text-xs leading-relaxed text-zinc-600">
          Sign in with GitHub again so Devlog can list your repositories and load
          commits. Each user connects their own account.
        </p>
        <button
          type="button"
          disabled={reconnecting}
          onClick={() => {
            setReconnecting(true);
            signIn("github", { callbackUrl: "/settings" }).catch(() =>
              setReconnecting(false),
            );
          }}
          className="inline-flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {reconnecting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Redirecting…
            </>
          ) : (
            <>
              <Github className="h-3.5 w-3.5" />
              Reconnect GitHub
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-zinc-200">
              Signed in as{" "}
              <span className="text-emerald-400">{status.user?.login}</span>
            </p>
            {status.selectedRepo && (
              <p className="mt-0.5 text-xs text-zinc-500">
                Tracking:{" "}
                <span className="font-mono text-zinc-400">
                  {status.selectedRepo}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status.selectedRepo && (
            <button
              type="button"
              onClick={handleStopTracking}
              className="rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
            >
              Stop tracking repo
            </button>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-red-500/30 hover:text-red-400"
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-zinc-400">
            Select a repository to track
          </p>
          <button
            type="button"
            onClick={fetchRepos}
            disabled={loadingRepos}
            className="flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-50"
          >
            <RefreshCw
              className={cn("h-3 w-3", loadingRepos && "animate-spin")}
            />
            Refresh
          </button>
        </div>

        {repoError && (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-2">
            <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-400" />
            <p className="text-xs text-red-400">{repoError}</p>
          </div>
        )}

        {selectingRepo && (
          <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
            <Loader2 className="h-3 w-3 animate-spin" />
            Selecting repository...
          </div>
        )}

        <RepoList
          repos={repos}
          selectedRepo={status.selectedRepo}
          onSelect={handleSelectRepo}
          loading={loadingRepos}
        />
      </div>

      {status.selectedRepo && (
        <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-zinc-500" />
            <span className="font-mono text-sm text-zinc-300">
              {status.selectedRepo}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${status.selectedRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              <ExternalLink className="h-3 w-3" />
              Open
            </a>
            <a
              href="/timeline"
              className="text-xs text-violet-400 transition-colors hover:text-violet-300"
            >
              View timeline →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
