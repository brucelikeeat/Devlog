"use client";

import { useTimelineFilter } from "@/features/timeline/useTimelineFilter";
import { TimelineFilters } from "./TimelineFilters";
import { DevlogTimeline } from "@/components/ui/timeline";
import type { TimelineEntry } from "@/features/timeline/types";

interface TimelineViewProps {
  entries: TimelineEntry[];
}

export function TimelineView({ entries }: TimelineViewProps) {
  const { search, setSearch, typeFilter, setTypeFilter, filtered, counts } =
    useTimelineFilter(entries);

  return (
    <>
      <TimelineFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        counts={counts}
      />
      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-zinc-500">No entries match your filter.</p>
          <p className="mt-1 text-xs text-zinc-600">Try clearing the search or selecting a different type.</p>
        </div>
      ) : (
        <DevlogTimeline entries={filtered} initialCount={6} />
      )}
    </>
  );
}
