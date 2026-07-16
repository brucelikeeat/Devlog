"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  ChevronDown,
  Github,
  Loader2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { GitHubRepo } from "@/lib/github/types";

export function SidebarRepoSwitcher() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const repoName = session?.user?.selectedGithubRepo ?? null;
  const loadingSession = status === "loading";

  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const loadRepos = useCallback(async () => {
    setLoadingRepos(true);
    setError(null);
    try {
      const res = await fetch("/api/github/repos");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string" ? body.error : "Failed to load repos",
        );
      }
      const data: GitHubRepo[] = await res.json();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repos");
    } finally {
      setLoadingRepos(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (repos.length === 0 && !loadingRepos) {
      void loadRepos();
    }
  }, [open, repos.length, loadingRepos, loadRepos]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function selectRepo(fullName: string) {
    if (selecting) return;
    setSelecting(fullName);
    setError(null);
    try {
      const res = await fetch("/api/github/select-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: fullName }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          typeof body.error === "string" ? body.error : "Failed to select repo",
        );
      }
      await updateSession();
      setOpen(false);
      router.refresh();
      router.push("/timeline");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select repo");
    } finally {
      setSelecting(null);
    }
  }

  const filtered = repos.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    );
  });

  if (loadingSession) {
    return (
      <div className="flex w-full items-center gap-2 rounded-md border border-zinc-800 px-2 py-1.5 text-xs text-zinc-600">
        <span className="truncate">Loading…</span>
      </div>
    );
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors border",
          repoName
            ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30 hover:bg-zinc-800"
            : "text-violet-400 border-violet-500/20 bg-violet-500/5 hover:border-violet-500/30 hover:bg-zinc-800",
        )}
      >
        {repoName ? (
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <Github className="h-3.5 w-3.5 flex-shrink-0" />
        )}
        <span className="truncate font-mono">
          {repoName ? repoName.split("/").pop() : "Select a repo"}
        </span>
        <ChevronDown
          className={cn(
            "ml-auto h-3 w-3 flex-shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl shadow-black/40">
          <div className="border-b border-zinc-800 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search repos…"
                autoFocus
                className="w-full rounded-md border border-zinc-700 bg-zinc-800/80 py-1.5 pl-7 pr-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/40 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {loadingRepos ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading repositories…
              </div>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-zinc-600">
                {error ? error : "No repositories found"}
              </p>
            ) : (
              filtered.map((repo) => {
                const selected = repo.full_name === repoName;
                const busy = selecting === repo.full_name;
                return (
                  <button
                    key={repo.id}
                    type="button"
                    disabled={!!selecting}
                    onClick={() => selectRepo(repo.full_name)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                      selected
                        ? "bg-violet-500/15 text-violet-300"
                        : "text-zinc-300 hover:bg-zinc-800",
                      selecting && !busy && "opacity-50",
                    )}
                  >
                    {busy ? (
                      <Loader2 className="h-3 w-3 flex-shrink-0 animate-spin" />
                    ) : (
                      <Github className="h-3 w-3 flex-shrink-0 text-zinc-500" />
                    )}
                    <span className="truncate font-mono">{repo.full_name}</span>
                  </button>
                );
              })
            )}
          </div>

          {error && !loadingRepos && filtered.length > 0 && (
            <p className="border-t border-zinc-800 px-2 py-1.5 text-[10px] text-red-400">
              {error}
            </p>
          )}

          <div className="border-t border-zinc-800 p-1">
            <Link
              href="/settings#github"
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-1.5 text-center text-[11px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            >
              Manage in Settings →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
