import { GitBranch } from "lucide-react";
import { TimelineEntryCard } from "./TimelineEntryCard";
import type { TimelineEntry } from "@/features/timeline/types";

// ── Date grouping ──────────────────────────────────────────────────────────

interface DateGroup {
  key: string;
  label: string;
  entries: TimelineEntry[];
}

function buildDateGroups(entries: TimelineEntry[]): DateGroup[] {
  const map = new Map<string, TimelineEntry[]>();

  for (const entry of entries) {
    const key = entry.dateIso.slice(0, 10);
    const bucket = map.get(key) ?? [];
    bucket.push(entry);
    map.set(key, bucket);
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  return Array.from(map.entries()).map(([key, groupEntries]) => {
    let label: string;
    if (key === today) {
      label = "Today";
    } else if (key === yesterday) {
      label = "Yesterday";
    } else {
      const d = new Date(key + "T12:00:00Z");
      label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return { key, label, entries: groupEntries };
  });
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
        <GitBranch className="h-5 w-5 text-zinc-600" />
      </div>
      <p className="text-sm font-medium text-zinc-400">
        {hasSearch ? "No results found" : "No entries yet"}
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        {hasSearch
          ? "Try adjusting your search or changing the type filter."
          : "Connect a GitHub repo to populate your timeline."}
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface TimelineListProps {
  entries: TimelineEntry[];
  hasActiveFilter: boolean;
}

export function TimelineList({ entries, hasActiveFilter }: TimelineListProps) {
  if (entries.length === 0) {
    return <EmptyState hasSearch={hasActiveFilter} />;
  }

  const groups = buildDateGroups(entries);

  return (
    <div className="relative max-w-3xl">
      {/* Vertical spine — runs behind all nodes */}
      <div className="absolute bottom-6 left-5 top-5 w-px bg-zinc-800" />

      <div className="space-y-0">
        {groups.map((group) => (
          <div key={group.key}>
            {/* Date group header */}
            <div className="flex items-center gap-3 pb-3 pt-1">
              {/* Spacer matching the icon node width */}
              <div className="w-10 flex-shrink-0" />
              <div className="flex flex-1 items-center gap-3">
                <span className="text-[11px] font-semibold text-zinc-500">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-zinc-800/80" />
              </div>
            </div>

            {/* Entries in this group */}
            {group.entries.map((entry) => (
              <TimelineEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        ))}

        {/* Tail node — connect CTA */}
        <div className="relative flex gap-5 pt-1">
          <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-800">
            <div className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          </div>
          <div className="flex flex-1 items-center">
            <p className="text-xs text-zinc-600">
              Connect a GitHub repository to populate your full timeline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
