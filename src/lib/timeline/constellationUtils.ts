import type { TimelineEntry } from "@/features/timeline/types";

export type StarSize = "small" | "medium" | "large";

export type StarColor = {
  core: string;
  glow: string;
  trail: string;
};

export type ConstellationStar = {
  entry: TimelineEntry;
  size: StarSize;
  color: StarColor;
  /** 0–100 percentage along the path */
  x: number;
  /** 0–100 vertical offset for the wave */
  y: number;
  /** ISO week string e.g. `"2026-W12"` */
  clusterId: string;
};

export type StarCluster = {
  id: string;
  label: string;
  stars: ConstellationStar[];
  centerX: number;
};

/**
 * Visual/event discriminator for constellation styling.
 *
 * `TimelineEntry` uses field `type` with `"pr"` for pull requests; constellation
 * keys match conventional GitHub-style `"pull_request"`. Use {@link toConstellationEventType}.
 */
export type TimelineEntryEventType =
  | "commit"
  | "pull_request"
  | "release"
  | "milestone";

export function toConstellationEventType(
  entry: TimelineEntry,
): Exclude<TimelineEntryEventType, "milestone"> {
  return entry.type === "pr" ? "pull_request" : entry.type;
}

/** Maps event type to color scheme */
export function getStarColor(eventType: TimelineEntryEventType): StarColor {
  switch (eventType) {
    case "commit":
      return {
        core: "#c4b5fd",
        glow: "rgba(196,181,253,0.4)",
        trail: "rgba(196,181,253,0.15)",
      };
    case "pull_request":
      return {
        core: "#a78bfa",
        glow: "rgba(167,139,250,0.5)",
        trail: "rgba(167,139,250,0.2)",
      };
    case "release":
      return {
        core: "#fbbf24",
        glow: "rgba(251,191,36,0.5)",
        trail: "rgba(251,191,36,0.2)",
      };
    case "milestone":
      return {
        core: "#34d399",
        glow: "rgba(52,211,153,0.5)",
        trail: "rgba(52,211,153,0.2)",
      };
    default:
      return {
        core: "#94a3b8",
        glow: "rgba(148,163,184,0.3)",
        trail: "rgba(148,163,184,0.1)",
      };
  }
}

/** Maps event type to star size */
export function getStarSize(eventType: TimelineEntryEventType): StarSize {
  if (eventType === "release" || eventType === "milestone") return "large";
  if (eventType === "pull_request") return "medium";
  return "small";
}

/** Maps StarSize to pixel radius */
export function getStarRadius(size: StarSize): number {
  if (size === "large") return 10;
  if (size === "medium") return 7;
  return 4.5;
}

function mondayOfISOWeekYear(isoWeekYear: number): Date {
  const jan4 = new Date(isoWeekYear, 0, 4);
  const offset = (jan4.getDay() + 6) % 7;
  const mondayWeek1 = new Date(jan4);
  mondayWeek1.setDate(jan4.getDate() - offset);
  return mondayWeek1;
}

/**
 * ISO 8601 week id `YYYY-Www` (Monday week start; week 1 contains Jan 4).
 * Uses the nearest-Thursday method (week-year may differ from calendar year near Jan 1).
 */
export function getISOWeek(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "1970-W01";

  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNr = (local.getDay() + 6) % 7;
  local.setDate(local.getDate() - dayNr + 3);

  const firstThursday = local.getTime();

  local.setMonth(0, 1);
  if (local.getDay() !== 4) {
    local.setMonth(0, 1 + ((4 - local.getDay() + 7) % 7));
  }
  const week1Thursday = local.getTime();

  let week = 1 + Math.round((firstThursday - week1Thursday) / 604800000);
  const isoWeekYear = new Date(firstThursday).getFullYear();

  if (week < 1) {
    return getISOWeek(new Date(isoWeekYear - 1, 11, 28).toISOString());
  }

  return `${isoWeekYear}-W${String(week).padStart(2, "0")}`;
}

/** Parses `YYYY-Www` and returns `"Week of Mon DD"` for the Monday of that ISO week-year */
export function formatClusterLabel(isoWeek: string): string {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeek.trim());
  if (!match) return isoWeek;

  const isoWeekYear = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  if (!Number.isFinite(isoWeekYear) || !Number.isFinite(week)) return isoWeek;

  const week1Monday = mondayOfISOWeekYear(isoWeekYear);
  const monday = new Date(week1Monday);
  monday.setDate(week1Monday.getDate() + (week - 1) * 7);

  return `Week of ${monday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}

export function buildConstellationStars(entries: TimelineEntry[]): {
  stars: ConstellationStar[];
  clusters: StarCluster[];
} {
  if (entries.length === 0) return { stars: [], clusters: [] };

  const sorted = [...entries].sort(
    (a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime(),
  );

  const t0 = new Date(sorted[0].dateIso).getTime();
  const t1 = new Date(sorted[sorted.length - 1].dateIso).getTime();
  const totalTimespan = t1 - t0 || 1;

  const stars: ConstellationStar[] = sorted.map((entry, i) => {
    const t = (new Date(entry.dateIso).getTime() - t0) / totalTimespan;
    const x = 5 + t * 90;
    const eventType = toConstellationEventType(entry);
    const y =
      50 +
      Math.sin(t * Math.PI * 2.5) * 22 +
      Math.sin(i * 1.7) * 8;

    return {
      entry,
      size: getStarSize(eventType),
      color: getStarColor(eventType),
      x,
      y: Math.max(15, Math.min(85, y)),
      clusterId: getISOWeek(entry.dateIso),
    };
  });

  const clusterMap = new Map<string, ConstellationStar[]>();
  for (const star of stars) {
    const bucket = clusterMap.get(star.clusterId);
    if (bucket) bucket.push(star);
    else clusterMap.set(star.clusterId, [star]);
  }

  const clusters: StarCluster[] = Array.from(clusterMap.entries()).map(
    ([id, clusterStars]) => ({
      id,
      label: formatClusterLabel(id),
      stars: clusterStars,
      centerX:
        clusterStars.reduce((sum, s) => sum + s.x, 0) / clusterStars.length,
    }),
  );

  return { stars, clusters };
}
