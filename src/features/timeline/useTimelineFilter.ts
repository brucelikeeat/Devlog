"use client";

import { useState, useMemo } from "react";
import type { TimelineEntry, TimelineFilterType } from "./types";

export interface TimelineFilterCounts {
  all: number;
  commit: number;
  pr: number;
  release: number;
}

export function useTimelineFilter(entries: TimelineEntry[]) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TimelineFilterType>("all");

  const counts: TimelineFilterCounts = useMemo(
    () => ({
      all: entries.length,
      commit: entries.filter((e) => e.type === "commit").length,
      pr: entries.filter((e) => e.type === "pr").length,
      release: entries.filter((e) => e.type === "release").length,
    }),
    [entries],
  );

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const matchesType =
        typeFilter === "all" || entry.type === typeFilter;

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        [entry.title, entry.summary, entry.repo, entry.branch].some((s) =>
          s.toLowerCase().includes(q),
        );

      return matchesType && matchesSearch;
    });
  }, [entries, search, typeFilter]);

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    filtered,
    counts,
  };
}
