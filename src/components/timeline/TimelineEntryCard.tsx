import {
  GitCommit,
  GitPullRequest,
  GitMerge,
  Tag,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TimelineEntry, CommitEntry, PrEntry, ReleaseEntry } from "@/features/timeline/types";

// ── Type / state config ────────────────────────────────────────────────────

const COMMIT_CONFIG = {
  icon: GitCommit,
  nodeBg: "bg-amber-500/10",
  nodeIcon: "text-amber-400",
  typeLabel: "Commit",
  typeLabelColor: "text-amber-500",
};

const PR_CONFIG = {
  open: {
    icon: GitPullRequest,
    nodeBg: "bg-blue-500/10",
    nodeIcon: "text-blue-400",
    typeLabel: "PR",
    typeLabelColor: "text-blue-400",
    stateBadge: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    stateLabel: "open",
  },
  merged: {
    icon: GitMerge,
    nodeBg: "bg-violet-500/10",
    nodeIcon: "text-violet-400",
    typeLabel: "PR",
    typeLabelColor: "text-violet-400",
    stateBadge: "border-violet-500/20 bg-violet-500/10 text-violet-400",
    stateLabel: "merged",
  },
  closed: {
    icon: GitPullRequest,
    nodeBg: "bg-zinc-800",
    nodeIcon: "text-zinc-500",
    typeLabel: "PR",
    typeLabelColor: "text-zinc-500",
    stateBadge: "border-zinc-700/40 bg-zinc-800 text-zinc-500",
    stateLabel: "closed",
  },
};

const RELEASE_CONFIG = {
  icon: Tag,
  nodeBg: "bg-emerald-500/10",
  nodeIcon: "text-emerald-400",
  typeLabel: "Release",
  typeLabelColor: "text-emerald-500",
};

const POST_STATUS_CONFIG = {
  published: {
    label: "✓ published",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  draft: {
    label: "draft",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────

function CommitMeta({ entry }: { entry: CommitEntry }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="font-mono text-[11px] text-zinc-600">{entry.hash}</span>
      <span className="text-zinc-800">·</span>
      <span className="font-mono text-[11px]">
        <span className="text-emerald-600">+{entry.additions}</span>
        <span className="mx-0.5 text-zinc-700">/</span>
        <span className="text-red-600">−{entry.deletions}</span>
      </span>
      <span className="text-zinc-800">·</span>
      <span className="font-mono text-[11px] text-zinc-600">
        {entry.filesChanged} files
      </span>
    </div>
  );
}

function PrMeta({ entry }: { entry: PrEntry }) {
  const cfg = PR_CONFIG[entry.state];
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span
        className={cn(
          "rounded border px-1.5 py-0.5 text-[10px] font-medium",
          cfg.stateBadge,
        )}
      >
        {cfg.stateLabel}
      </span>
      {entry.labels.map((label) => (
        <span
          key={label}
          className="rounded border border-zinc-700/40 bg-zinc-800/60 px-1.5 py-0.5 text-[10px] text-zinc-500"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function ReleaseHighlights({ entry }: { entry: ReleaseEntry }) {
  return (
    <ul className="mt-3 space-y-1 border-l border-zinc-800 pl-3">
      {entry.highlights.map((h) => (
        <li key={h} className="text-[11px] leading-relaxed text-zinc-500">
          {h}
        </li>
      ))}
    </ul>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function TimelineEntryCard({ entry }: { entry: TimelineEntry }) {
  let nodeIcon: React.ElementType;
  let nodeBg: string;
  let nodeIconColor: string;
  let typeLabel: string;
  let typeLabelColor: string;
  let footerMeta: string;

  if (entry.type === "commit") {
    nodeIcon = COMMIT_CONFIG.icon;
    nodeBg = COMMIT_CONFIG.nodeBg;
    nodeIconColor = COMMIT_CONFIG.nodeIcon;
    typeLabel = COMMIT_CONFIG.typeLabel;
    typeLabelColor = COMMIT_CONFIG.typeLabelColor;
    footerMeta = `${entry.hash} · ${entry.filesChanged} files`;
  } else if (entry.type === "pr") {
    const cfg = PR_CONFIG[entry.state];
    nodeIcon = cfg.icon;
    nodeBg = cfg.nodeBg;
    nodeIconColor = cfg.nodeIcon;
    typeLabel = `PR #${entry.prNumber}`;
    typeLabelColor = cfg.typeLabelColor;
    footerMeta = `${entry.commits} commits · ${entry.filesChanged} files`;
  } else {
    nodeIcon = RELEASE_CONFIG.icon;
    nodeBg = RELEASE_CONFIG.nodeBg;
    nodeIconColor = RELEASE_CONFIG.nodeIcon;
    typeLabel = entry.version;
    typeLabelColor = RELEASE_CONFIG.typeLabelColor;
    footerMeta = `${entry.commits} commits`;
  }

  const NodeIcon = nodeIcon;
  const postStatusCfg = entry.postStatus
    ? POST_STATUS_CONFIG[entry.postStatus]
    : null;

  return (
    <div className="relative flex gap-5 pb-4">
      {/* Icon node on the spine */}
      <div
        className={cn(
          "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-zinc-800",
          nodeBg,
        )}
      >
        <NodeIcon className={cn("h-4 w-4", nodeIconColor)} />
      </div>

      {/* Card */}
      <div className="group flex-1 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-900/70">
        {/* Top meta row */}
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              "font-mono text-[10px] font-semibold uppercase tracking-wider",
              typeLabelColor,
            )}
          >
            {typeLabel}
          </span>
          <span className="text-zinc-700">·</span>
          <span className="font-mono text-[11px] text-zinc-500">
            {entry.repo}
          </span>
          <span className="text-zinc-700">·</span>
          <span className="max-w-[200px] truncate font-mono text-[11px] text-zinc-600">
            {entry.branch}
          </span>
        </div>

        {/* Title + timestamp + post badge */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-medium leading-snug text-zinc-100">
            {entry.title}
          </h4>
          <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
            <span className="whitespace-nowrap text-[11px] text-zinc-500">
              {entry.displayTime}
            </span>
            {postStatusCfg && (
              <span
                className={cn(
                  "rounded border px-1.5 py-0.5 text-[10px]",
                  postStatusCfg.className,
                )}
              >
                {postStatusCfg.label}
              </span>
            )}
          </div>
        </div>

        {/* Type-specific metadata */}
        {entry.type === "commit" && <CommitMeta entry={entry} />}
        {entry.type === "pr" && <PrMeta entry={entry} />}
        {entry.type === "release" && <ReleaseHighlights entry={entry} />}

        {/* Summary */}
        <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">
          {entry.summary}
        </p>

        {/* Hover action bar */}
        <div className="mt-3 hidden items-center justify-between border-t border-zinc-800 pt-3 group-hover:flex">
          <span className="text-[11px] text-zinc-600">
            {footerMeta}
          </span>
          <button className="flex items-center gap-1 text-[11px] text-violet-400 transition-colors hover:text-violet-300">
            <Sparkles className="h-3 w-3" />
            {entry.postStatus ? "Edit post" : "Generate post"}
          </button>
        </div>
      </div>
    </div>
  );
}
