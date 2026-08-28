import type {
  CommitEntry,
  PrEntry,
  PrState,
  ReleaseEntry,
  TimelineEntry,
} from "@/features/timeline/types";
import type { GitHubCommit, GitHubPullRequest, GitHubRelease } from "./types";

/**
 * Maps raw GitHub API objects to the existing TimelineEntry shape so the
 * timeline UI can render them with no changes.
 *
 * Field-name reconciliation (task spec → actual TimelineEntry):
 * - `eventType`     → `type`
 * - `pull_request`  → `"pr"`     (existing discriminator value)
 * - `createdAt`     → `dateIso`
 * - `privacyLevel`  → no equivalent field on TimelineEntry; we set
 *                     `postStatus: null` (= "not yet posted") as the closest
 *                     existing analog. Privacy classification is a downstream
 *                     concern that should live on a separate field.
 */

const SUMMARY_MAX = 500;

function truncate(value: string | null | undefined, max = SUMMARY_MAX): string {
  if (!value) return "";
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1).trimEnd()}…` : trimmed;
}

function firstLine(value: string | null | undefined): string {
  if (!value) return "";
  const idx = value.indexOf("\n");
  return (idx === -1 ? value : value.slice(0, idx)).trim();
}

function formatDisplayTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toPrState(pr: GitHubPullRequest): PrState {
  if (pr.merged_at) return "merged";
  if (pr.state === "closed") return "closed";
  return "open";
}

export function normalizeCommit(
  commit: GitHubCommit,
  repoName: string,
): CommitEntry {
  const message = commit.commit?.message ?? "";
  const dateIso = commit.commit?.author?.date ?? new Date().toISOString();

  return {
    id: commit.sha,
    type: "commit",
    title: firstLine(message) || commit.sha.slice(0, 7),
    summary: truncate(message),
    repo: repoName,
    branch: "",
    dateIso,
    displayTime: formatDisplayTime(dateIso),
    hash: commit.sha.slice(0, 7),
    filesChanged: commit.files?.length ?? 0,
    additions: commit.stats?.additions ?? 0,
    deletions: commit.stats?.deletions ?? 0,
    postStatus: null,
  };
}

export function normalizePullRequest(
  pr: GitHubPullRequest,
  repoName: string,
): PrEntry {
  const dateIso = pr.updated_at ?? pr.created_at ?? new Date().toISOString();
  const labels = Array.isArray((pr as unknown as { labels?: { name: string }[] }).labels)
    ? ((pr as unknown as { labels: { name: string }[] }).labels.map((l) => l.name))
    : [];

  return {
    id: String(pr.id),
    type: "pr",
    title: pr.title || `PR #${pr.number}`,
    summary: truncate(pr.body),
    repo: repoName,
    branch: "",
    dateIso,
    displayTime: formatDisplayTime(dateIso),
    prNumber: pr.number,
    state: toPrState(pr),
    labels,
    commits: 0,
    filesChanged: 0,
    postStatus: null,
  };
}

export function normalizeRelease(
  release: GitHubRelease,
  repoName: string,
): ReleaseEntry {
  const dateIso =
    release.published_at ?? release.created_at ?? new Date().toISOString();

  return {
    id: String(release.id),
    type: "release",
    title: release.name?.trim() || release.tag_name,
    summary: truncate(release.body),
    repo: repoName,
    branch: "",
    dateIso,
    displayTime: formatDisplayTime(dateIso),
    version: release.tag_name,
    highlights: [],
    commits: 0,
    postStatus: null,
  };
}

export type NormalizedTimelineEntry = TimelineEntry;
