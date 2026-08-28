import type { GitHubCommit } from "@/lib/github/types";
import type { CommitEntry } from "@/features/timeline/types";

function formatDisplayTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today, ${time}`;

  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${dateStr}, ${time}`;
}

function firstLine(message: string): string {
  return message.split("\n")[0].trim();
}

export function mapCommitsToTimeline(
  commits: GitHubCommit[],
  repoFullName: string,
): CommitEntry[] {
  return commits.map((commit) => ({
    id: `gh-commit-${commit.sha}`,
    type: "commit" as const,
    title: firstLine(commit.commit.message),
    summary: commit.commit.message.length > firstLine(commit.commit.message).length
      ? commit.commit.message.slice(firstLine(commit.commit.message).length).trim()
      : `Commit by ${commit.commit.author.name}`,
    repo: repoFullName.split("/").pop() ?? repoFullName,
    branch: "main",
    dateIso: commit.commit.author.date,
    displayTime: formatDisplayTime(commit.commit.author.date),
    hash: commit.sha.slice(0, 7),
    filesChanged: commit.files?.length ?? 0,
    additions: commit.stats?.additions ?? 0,
    deletions: commit.stats?.deletions ?? 0,
    postStatus: null,
  }));
}
