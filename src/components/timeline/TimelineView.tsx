"use client";

import { useTimelineFilter } from "@/features/timeline/useTimelineFilter";
import { TimelineFilters } from "./TimelineFilters";
import { TimelineList } from "./TimelineList";
import type { TimelineEntry } from "@/features/timeline/types";

interface TimelineViewProps {
  entries: TimelineEntry[];
}

export function TimelineView({ entries }: TimelineViewProps) {
  const { search, setSearch, typeFilter, setTypeFilter, filtered, counts } =
    useTimelineFilter(entries);

  const hasActiveFilter = search.trim().length > 0 || typeFilter !== "all";

  return (
    <>
      <TimelineFilters
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        counts={counts}
      />
      <TimelineList entries={filtered} hasActiveFilter={hasActiveFilter} />
    </>
  );
}
