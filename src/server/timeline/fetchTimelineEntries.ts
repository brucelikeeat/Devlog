/**
 * Shared server-side function used by both the /timeline page (direct call)
 * and the GET /api/timeline route handler.
 *
 * Calling this directly from the page avoids the Next.js App Router
 * self-fetch deadlock, where a server component fetch() to its own route
 * handler hangs indefinitely during SSR.
 */

import { prisma } from "@/lib/prisma";
import { getGithubAccessTokenForUser } from "@/server/github/getGithubAccessToken";
import {
  fetchRepoCommits,
  fetchRepoPullRequests,
  fetchRepoReleases,
} from "@/lib/github/api";
import {
  normalizeCommit,
  normalizePullRequest,
  normalizeRelease,
} from "@/lib/github/normalizeEvents";
import type { TimelineEntry } from "@/features/timeline/types";

export type FetchTimelineResult =
  | { ok: true; entries: TimelineEntry[] }
  | { ok: false; reason: "unauthenticated" | "no_token" | "no_repo" | "fetch_error"; message: string };

export async function fetchTimelineEntries(
  userId: string,
): Promise<FetchTimelineResult> {
  const token = await getGithubAccessTokenForUser(userId);
  if (!token) {
    return {
      ok: false,
      reason: "no_token",
      message: "No GitHub token on file. Sign in again with GitHub.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { selectedGithubRepo: true },
  });

  const selected = user?.selectedGithubRepo ?? null;
  if (!selected) {
    return { ok: true, entries: [] };
  }

  const [owner, repo] = selected.split("/", 2);
  if (!owner || !repo) {
    return {
      ok: false,
      reason: "no_repo",
      message: `Invalid repo format: "${selected}". Expected "owner/repo".`,
    };
  }

  try {
    const [commits, pulls, releases] = await Promise.all([
      fetchRepoCommits(token, owner, repo),
      fetchRepoPullRequests(token, owner, repo),
      fetchRepoReleases(token, owner, repo),
    ]);

    const repoName = `${owner}/${repo}`;
    const entries: TimelineEntry[] = [
      ...commits.map((c) => normalizeCommit(c, repoName)),
      ...pulls.map((p) => normalizePullRequest(p, repoName)),
      ...releases.map((r) => normalizeRelease(r, repoName)),
    ].sort((a, b) => b.dateIso.localeCompare(a.dateIso));

    return { ok: true, entries };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: "fetch_error", message };
  }
}
