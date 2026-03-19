export type EntryType = "commit" | "pr" | "release";
export type PostStatus = "published" | "draft" | null;
export type PrState = "open" | "merged" | "closed";
export type TimelineFilterType = "all" | "commit" | "pr" | "release";

interface BaseEntry {
  id: string;
  title: string;
  summary: string;
  repo: string;
  branch: string;
  /** ISO 8601 date string — used for grouping and sorting. */
  dateIso: string;
  /** Human-readable label shown inside the card (e.g. "Today, 9:41 AM"). */
  displayTime: string;
  postStatus: PostStatus;
}

export interface CommitEntry extends BaseEntry {
  type: "commit";
  hash: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}

export interface PrEntry extends BaseEntry {
  type: "pr";
  prNumber: number;
  state: PrState;
  labels: string[];
  commits: number;
  filesChanged: number;
}

export interface ReleaseEntry extends BaseEntry {
  type: "release";
  version: string;
  highlights: string[];
  commits: number;
}

export type TimelineEntry = CommitEntry | PrEntry | ReleaseEntry;
