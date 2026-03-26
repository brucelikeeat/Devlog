"use client";

import { useState } from "react";
import { Github, Star, Lock, Globe, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { GitHubRepo } from "@/lib/github/types";

interface RepoListProps {
  repos: GitHubRepo[];
  selectedRepo: string | null;
  onSelect: (repoFullName: string) => void;
  loading?: boolean;
}

export function RepoList({
  repos,
  selectedRepo,
  onSelect,
  loading,
}: RepoListProps) {
  const [search, setSearch] = useState("");

  const filtered = repos.filter((repo) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      repo.full_name.toLowerCase().includes(q) ||
      repo.description?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        <span className="ml-2 text-sm text-zinc-500">Loading repositories...</span>
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div className="py-6 text-center">
        <Github className="mx-auto mb-2 h-6 w-6 text-zinc-600" />
        <p className="text-sm text-zinc-500">No repositories found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repositories..."
          className="w-full rounded-md border border-zinc-700 bg-zinc-800/60 py-1.5 pl-8 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
        />
      </div>

      <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
        {filtered.map((repo) => {
          const isSelected = selectedRepo === repo.full_name;
          return (
            <button
              key={repo.id}
              onClick={() => onSelect(repo.full_name)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all duration-150",
                isSelected
                  ? "border-violet-500/40 bg-violet-500/5"
                  : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40",
              )}
            >
              <div className="mt-0.5 flex-shrink-0">
                {repo.private ? (
                  <Lock className="h-3.5 w-3.5 text-amber-500/70" />
                ) : (
                  <Globe className="h-3.5 w-3.5 text-zinc-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {repo.full_name}
                  </p>
                  {isSelected && (
                    <span className="flex-shrink-0 rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-400">
                      Selected
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {repo.description}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-zinc-600">
                  {repo.language && <span>{repo.language}</span>}
                  {repo.stargazers_count > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3" />
                      {repo.stargazers_count}
                    </span>
                  )}
                  {repo.pushed_at && (
                    <span>
                      pushed{" "}
                      {new Date(repo.pushed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-zinc-600">
            No repos match &ldquo;{search}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
