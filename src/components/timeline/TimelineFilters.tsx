import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TimelineFilterType } from "@/features/timeline/types";
import type { TimelineFilterCounts } from "@/features/timeline/useTimelineFilter";

interface Tab {
  id: TimelineFilterType;
  label: string;
}

const TABS: Tab[] = [
  { id: "all", label: "All" },
  { id: "commit", label: "Commits" },
  { id: "pr", label: "PRs" },
  { id: "release", label: "Releases" },
];

interface TimelineFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: TimelineFilterType;
  onTypeFilterChange: (value: TimelineFilterType) => void;
  counts: TimelineFilterCounts;
}

export function TimelineFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  counts,
}: TimelineFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search timeline..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-4 text-sm text-zinc-300 placeholder:text-zinc-600 transition-colors focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-zinc-600 transition-colors hover:text-zinc-400"
          >
            clear
          </button>
        )}
      </div>

      {/* Filter button (placeholder for future advanced filters) */}
      <button className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filter
      </button>

      {/* Type filter tabs */}
      <div className="flex overflow-hidden rounded-lg border border-zinc-800 text-xs">
        {TABS.map((tab) => {
          const isActive = typeFilter === tab.id;
          const count = counts[tab.id];
          return (
            <button
              key={tab.id}
              onClick={() => onTypeFilterChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 transition-colors",
                isActive
                  ? "bg-zinc-800 text-zinc-100"
                  : "bg-zinc-900 text-zinc-500 hover:text-zinc-300",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "font-mono text-[10px]",
                  isActive ? "text-zinc-400" : "text-zinc-700",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
