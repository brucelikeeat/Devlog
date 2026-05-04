import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
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
import { prisma } from "@/lib/prisma";
import { getGithubAccessTokenForUser } from "@/server/github/getGithubAccessToken";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getGithubAccessTokenForUser(session.user.id);
    if (!token) {
      return NextResponse.json(
        { error: "No GitHub token on file. Sign in again with GitHub." },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { selectedGithubRepo: true },
    });

    const selected = user?.selectedGithubRepo ?? null;
    if (!selected) {
      return NextResponse.json([] as TimelineEntry[]);
    }

    const [owner, repo] = selected.split("/", 2);
    if (!owner || !repo) {
      return NextResponse.json(
        { error: `Invalid selectedGithubRepo: "${selected}". Expected "owner/repo".` },
        { status: 400 },
      );
    }

    const [commits, pulls, releases] = await Promise.all([
      fetchRepoCommits(token, owner, repo),
      fetchRepoPullRequests(token, owner, repo),
      fetchRepoReleases(token, owner, repo),
    ]);

    const repoName = `${owner}/${repo}`;
    const combined: TimelineEntry[] = [
      ...commits.map((c) => normalizeCommit(c, repoName)),
      ...pulls.map((p) => normalizePullRequest(p, repoName)),
      ...releases.map((r) => normalizeRelease(r, repoName)),
    ].sort((a, b) => b.dateIso.localeCompare(a.dateIso));

    return NextResponse.json(combined);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[GET /api/timeline] failed:", message);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 },
    );
  }
}
