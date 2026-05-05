"use client";

import { GitCommit, GitMerge, GitPullRequest, Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TimelineEntry } from "@/features/timeline/types";

type Props = {
  entries: TimelineEntry[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

// ── Badge config — mirrors TimelineEntryCard colour palette ────────────────

type BadgeCfg = {
  icon: React.ElementType;
  badge: string;
  iconColor: string;
  label: string;
};

function getBadgeCfg(entry: TimelineEntry): BadgeCfg {
  if (entry.type === "commit") {
    return {
      icon: GitCommit,
      badge: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      iconColor: "text-amber-400",
      label: "commit",
    };
  }
  if (entry.type === "pr") {
    if (entry.state === "merged") {
      return {
        icon: GitMerge,
        badge: "border-violet-500/20 bg-violet-500/10 text-violet-400",
        iconColor: "text-violet-400",
        label: `PR #${entry.prNumber}`,
      };
    }
    return {
      icon: GitPullRequest,
      badge: "border-blue-500/20 bg-blue-500/10 text-blue-400",
      iconColor: "text-blue-400",
      label: `PR #${entry.prNumber}`,
    };
  }
  // release
  return {
    icon: Tag,
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    iconColor: "text-emerald-400",
    label: entry.version,
  };
}

// ── Date formatting ─────────────────────────────────────────────────────────

function formatShortDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Card ───────────────────────────────────────────────────────────────────

type CardProps = {
  entry: TimelineEntry;
  selected: boolean;
  onToggle: () => void;
};

function EventCard({ entry, selected, onToggle }: CardProps) {
  const cfg = getBadgeCfg(entry);
  const Icon = cfg.icon;
  const summary =
    entry.summary.length > 100
      ? entry.summary.slice(0, 100).trimEnd() + "…"
      : entry.summary;

  return (
    <div
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "flex cursor-pointer select-none items-start gap-3 rounded-xl border p-3.5 transition-all duration-150",
        selected
          ? "border-violet-500/50 bg-violet-500/5 hover:border-violet-400/60"
          : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/70",
      )}
    >
      {/* Left: icon */}
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800",
          selected ? "border-violet-500/30 bg-violet-500/10" : "bg-zinc-800/60",
        )}
      >
        <Icon className={cn("h-3.5 w-3.5", cfg.iconColor)} />
      </div>

      {/* Middle: content */}
      <div className="min-w-0 flex-1">
        {/* Badge + date */}
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
              cfg.badge,
            )}
          >
            {cfg.label}
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            {formatShortDate(entry.dateIso)}
          </span>
        </div>

        {/* Title */}
        <p className="text-sm font-medium leading-snug text-zinc-100">
          {entry.title}
        </p>

        {/* Summary */}
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{summary}</p>
      </div>

      {/* Right: checkbox */}
      <div className="mt-0.5 flex-shrink-0">
        <div
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded border transition-colors",
            selected
              ? "border-violet-500 bg-violet-500"
              : "border-zinc-600 bg-transparent",
          )}
        >
          {selected && (
            <svg
              viewBox="0 0 12 12"
              fill="none"
              className="h-2.5 w-2.5"
              aria-hidden
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

// ── EventSelector ──────────────────────────────────────────────────────────

export function EventSelector({ entries, selectedIds, onChange }: Props) {
  const selectedSet = new Set(selectedIds);
  const allSelected =
    entries.length > 0 && entries.every((e) => selectedSet.has(e.id));

  function toggle(id: string) {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function toggleAll() {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(entries.map((e) => e.id));
    }
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No timeline events found. Select a GitHub repo in{" "}
        <a href="/settings" className="text-violet-400 hover:text-violet-300 underline">
          Settings
        </a>{" "}
        to populate your timeline.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Select all / Deselect all */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {selectedIds.length} of {entries.length} selected
        </span>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs text-violet-400 transition-colors hover:text-violet-300"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {entries.map((entry) => (
          <EventCard
            key={entry.id}
            entry={entry}
            selected={selectedSet.has(entry.id)}
            onToggle={() => toggle(entry.id)}
          />
        ))}
      </div>
    </div>
  );
}
