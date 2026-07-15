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
  | {
      ok: false;
      reason: "unauthenticated" | "no_token" | "no_repo" | "fetch_error";
      message: string;
    };

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
    // Don't let one failing endpoint (e.g. releases) wipe out commits/PRs.
    const [commitsResult, pullsResult, releasesResult] = await Promise.allSettled([
      fetchRepoCommits(token, owner, repo),
      fetchRepoPullRequests(token, owner, repo),
      fetchRepoReleases(token, owner, repo),
    ]);

    const failures: string[] = [];
    const commits =
      commitsResult.status === "fulfilled" ? commitsResult.value : [];
    const pulls =
      pullsResult.status === "fulfilled" ? pullsResult.value : [];
    const releases =
      releasesResult.status === "fulfilled" ? releasesResult.value : [];

    if (commitsResult.status === "rejected") {
      failures.push(
        commitsResult.reason instanceof Error
          ? commitsResult.reason.message
          : String(commitsResult.reason),
      );
    }
    if (pullsResult.status === "rejected") {
      failures.push(
        pullsResult.reason instanceof Error
          ? pullsResult.reason.message
          : String(pullsResult.reason),
      );
    }
    if (releasesResult.status === "rejected") {
      failures.push(
        releasesResult.reason instanceof Error
          ? releasesResult.reason.message
          : String(releasesResult.reason),
      );
    }

    // If every source failed, surface the error so the UI can prompt reconnect.
    if (failures.length === 3) {
      return {
        ok: false,
        reason: "fetch_error",
        message: failures[0] ?? "Failed to load GitHub activity.",
      };
    }

    const repoName = `${owner}/${repo}`;
    const entries: TimelineEntry[] = [
      ...commits.map((c) => normalizeCommit(c, repoName)),
      ...pulls.map((p) => normalizePullRequest(p, repoName)),
      ...releases.map((r) => normalizeRelease(r, repoName)),
    ].sort((a, b) => b.dateIso.localeCompare(a.dateIso));

    return { ok: true, entries };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[fetchTimelineEntries]", message);
    return { ok: false, reason: "fetch_error", message };
  }
}
