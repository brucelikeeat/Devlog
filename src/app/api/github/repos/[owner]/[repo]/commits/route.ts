import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchRepoCommits } from "@/lib/github/api";
import { getGithubAccessTokenForUser } from "@/server/github/getGithubAccessToken";

export async function GET(
  _request: Request,
  { params }: { params: { owner: string; repo: string } },
) {
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

    const commits = await fetchRepoCommits(token, params.owner, params.repo, {
      perPage: 20,
    });
    return NextResponse.json(commits);
  } catch (err) {
    console.error("[github/commits] error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch commits";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
