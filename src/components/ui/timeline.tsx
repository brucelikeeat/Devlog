"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  GitCommit,
  GitPullRequest,
  GitMerge,
  Tag,
  ChevronDown,
  Sparkles,
  FileCode,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type {
  TimelineEntry,
  CommitEntry,
  PrEntry,
  ReleaseEntry,
} from "@/features/timeline/types";

// ── Config maps ───────────────────────────────────────────────────────────

const ENTRY_CONFIG = {
  commit: {
    icon: GitCommit,
    nodeBg: "bg-amber-500/10 border-amber-500/20",
    nodeIcon: "text-amber-400",
    label: "Commit",
    labelColor: "text-amber-500",
    dotColor: "bg-amber-500",
  },
  pr: {
    open: {
      icon: GitPullRequest,
      nodeBg: "bg-blue-500/10 border-blue-500/20",
      nodeIcon: "text-blue-400",
      label: "PR",
      labelColor: "text-blue-400",
      dotColor: "bg-blue-500",
      badgeCls: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    },
    merged: {
      icon: GitMerge,
      nodeBg: "bg-violet-500/10 border-violet-500/20",
      nodeIcon: "text-violet-400",
      label: "PR",
      labelColor: "text-violet-400",
      dotColor: "bg-violet-500",
      badgeCls: "border-violet-500/20 bg-violet-500/10 text-violet-400",
    },
    closed: {
      icon: GitPullRequest,
      nodeBg: "bg-zinc-800 border-zinc-700",
      nodeIcon: "text-zinc-500",
      label: "PR",
      labelColor: "text-zinc-500",
      dotColor: "bg-zinc-600",
      badgeCls: "border-zinc-700 bg-zinc-800 text-zinc-500",
    },
  },
  release: {
    icon: Tag,
    nodeBg: "bg-emerald-500/10 border-emerald-500/20",
    nodeIcon: "text-emerald-400",
    label: "Release",
    labelColor: "text-emerald-500",
    dotColor: "bg-emerald-500",
  },
};

const POST_STATUS = {
  published: {
    label: "✓ published",
    cls: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  draft: {
    label: "draft",
    cls: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function getConfig(entry: TimelineEntry) {
  if (entry.type === "commit") return ENTRY_CONFIG.commit;
  if (entry.type === "pr") return ENTRY_CONFIG.pr[entry.state];
  return ENTRY_CONFIG.release;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── Expanded detail panels ────────────────────────────────────────────────

function CommitDetail({ entry }: { entry: CommitEntry }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <Stat label="Hash" value={entry.hash} mono />
        <Stat label="Files" value={String(entry.filesChanged)} />
        <Stat
          label="Changes"
          value={`+${entry.additions} / −${entry.deletions}`}
          valueClass="text-emerald-400"
        />
      </div>
      <MetaRow icon={GitBranch} text={entry.branch} />
    </div>
  );
}

function PrDetail({ entry }: { entry: PrEntry }) {
  const cfg = ENTRY_CONFIG.pr[entry.state];
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <Stat label="PR" value={`#${entry.prNumber}`} mono />
        <Stat label="Commits" value={String(entry.commits)} />
        <Stat label="Files" value={String(entry.filesChanged)} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            cfg.badgeCls
          )}
        >
          {entry.state}
        </span>
        {entry.labels.map((l) => (
          <span
            key={l}
            className="rounded border border-zinc-700/50 bg-zinc-800/60 px-2 py-0.5 text-[10px] text-zinc-500"
          >
            {l}
          </span>
        ))}
      </div>
      <MetaRow icon={GitBranch} text={entry.branch} />
    </div>
  );
}

function ReleaseDetail({ entry }: { entry: ReleaseEntry }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        <Stat label="Version" value={entry.version} mono />
        <Stat label="Commits" value={String(entry.commits)} />
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Highlights
        </p>
        <ul className="space-y-1.5">
          {entry.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-xs text-zinc-400">
              <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-violet-500" />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Small reusable stat chip ──────────────────────────────────────────────

function Stat({
  label,
  value,
  mono,
  valueClass,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-600">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xs font-medium text-zinc-300",
          mono && "font-mono",
          valueClass
        )}
      >
        {value}
      </p>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span className="font-mono truncate">{text}</span>
    </div>
  );
}

// ── Single entry (shared content) ─────────────────────────────────────────

function EntryContent({
  entry,
  isOpen,
}: {
  entry: TimelineEntry;
  isOpen: boolean;
}) {
  const cfg = getConfig(entry);
  const postCfg = entry.postStatus ? POST_STATUS[entry.postStatus] : null;

  return (
    <>
      {/* Top meta */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
        <span className={cn("font-mono text-[10px] font-semibold uppercase tracking-wider", cfg.labelColor)}>
          {"label" in cfg ? cfg.label : ""}
          {entry.type === "pr" && ` #${(entry as PrEntry).prNumber}`}
          {entry.type === "release" && ` ${(entry as ReleaseEntry).version}`}
        </span>
        <span className="text-zinc-700">·</span>
        <span className="font-mono text-[11px] text-zinc-500">{entry.repo}</span>
        {postCfg && (
          <>
            <span className="text-zinc-700">·</span>
            <span className={cn("rounded border px-1.5 py-0.5 text-[10px]", postCfg.cls)}>
              {postCfg.label}
            </span>
          </>
        )}
      </div>

      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-snug text-zinc-100 transition-colors group-hover:text-white">
          {entry.title}
        </h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="mt-0.5 flex-shrink-0 text-zinc-600"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </div>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            {/* Summary */}
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              {entry.summary}
            </p>

            {/* Type-specific detail */}
            {entry.type === "commit" && <CommitDetail entry={entry as CommitEntry} />}
            {entry.type === "pr" && <PrDetail entry={entry as PrEntry} />}
            {entry.type === "release" && <ReleaseDetail entry={entry as ReleaseEntry} />}

            {/* CTA row */}
            <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                <FileCode className="h-3 w-3" />
                <span className="font-mono">{entry.displayTime}</span>
              </div>
              <button className="flex items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/8 px-2.5 py-1 text-[11px] font-medium text-violet-400 transition-colors hover:border-violet-500/40 hover:text-violet-300">
                <Sparkles className="h-3 w-3" />
                {entry.postStatus ? "Edit post" : "Generate post"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Desktop entry (date-left, spine-center, card-right) ───────────────────

function DesktopEntry({
  entry,
  isOpen,
  onToggle,
}: {
  entry: TimelineEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const cfg = getConfig(entry);
  const NodeIcon = cfg.icon;

  return (
    <li className="hidden md:grid grid-cols-[9rem_2.5rem_1fr] gap-x-4 items-start">
      {/* Date */}
      <div className="pt-3 text-right">
        <time
          dateTime={entry.dateIso}
          className="text-xs font-medium text-zinc-500 transition-colors group-hover:text-zinc-300"
        >
          {formatDate(entry.dateIso)}
        </time>
        <p className="mt-0.5 font-mono text-[10px] text-zinc-700">
          {entry.displayTime.includes(",")
            ? entry.displayTime.split(",")[1].trim()
            : ""}
        </p>
      </div>

      {/* Spine + node */}
      <div className="relative flex flex-col items-center">
        <div
          className={cn(
            "z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border",
            cfg.nodeBg
          )}
        >
          <NodeIcon className={cn("h-4 w-4", cfg.nodeIcon)} />
        </div>
        <div className="mt-1 flex-1 w-px bg-zinc-800" />
      </div>

      {/* Card */}
      <button
        onClick={onToggle}
        className="group w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-left transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-900/70 mb-2"
      >
        <EntryContent entry={entry} isOpen={isOpen} />
      </button>
    </li>
  );
}

// ── Mobile entry ──────────────────────────────────────────────────────────

function MobileEntry({
  entry,
  isOpen,
  onToggle,
}: {
  entry: TimelineEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const cfg = getConfig(entry);
  const NodeIcon = cfg.icon;

  return (
    <li className="md:hidden flex gap-3">
      {/* Spine + node column */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border",
            cfg.nodeBg
          )}
        >
          <NodeIcon className={cn("h-3.5 w-3.5", cfg.nodeIcon)} />
        </div>
        <div className="mt-1 flex-1 w-px bg-zinc-800" />
      </div>

      {/* Card */}
      <button
        onClick={onToggle}
        className="group mb-3 flex-1 cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 text-left transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-900/70"
      >
        <time className="mb-1.5 block font-mono text-[10px] text-zinc-600">
          {formatDate(entry.dateIso)}
        </time>
        <EntryContent entry={entry} isOpen={isOpen} />
      </button>
    </li>
  );
}

// ── Main DevlogTimeline export ────────────────────────────────────────────

interface DevlogTimelineProps {
  entries: TimelineEntry[];
  initialCount?: number;
  showMoreText?: string;
  showLessText?: string;
  className?: string;
}

export function DevlogTimeline({
  entries,
  initialCount = 6,
  showMoreText = "Load more",
  showLessText = "Show less",
  className,
}: DevlogTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const sorted = [...entries].sort(
    (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime()
  );

  const visible = showAll ? sorted : sorted.slice(0, initialCount);
  const remaining = sorted.slice(initialCount);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className={cn("w-full", className)}>
      <ul className="space-y-1">
        {visible.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: i * 0.06,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            <DesktopEntry
              entry={entry}
              isOpen={openIds.has(entry.id)}
              onToggle={() => toggle(entry.id)}
            />
            <MobileEntry
              entry={entry}
              isOpen={openIds.has(entry.id)}
              onToggle={() => toggle(entry.id)}
            />
          </motion.div>
        ))}

        <AnimatePresence>
          {showAll &&
            sorted.slice(initialCount).map((entry, i) => (
              <motion.div
                key={entry.id + "-extra"}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <DesktopEntry
                  entry={entry}
                  isOpen={openIds.has(entry.id)}
                  onToggle={() => toggle(entry.id)}
                />
                <MobileEntry
                  entry={entry}
                  isOpen={openIds.has(entry.id)}
                  onToggle={() => toggle(entry.id)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </ul>

      {remaining.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex justify-center"
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-zinc-500 hover:text-zinc-200"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? showLessText : `${showMoreText} (${remaining.length})`}
            <motion.span
              animate={{ rotate: showAll ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}
