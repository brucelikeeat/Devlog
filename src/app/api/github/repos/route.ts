import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchUserRepos } from "@/lib/github/api";
import { getGithubAccessTokenForUser } from "@/server/github/getGithubAccessToken";

export async function GET() {
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

  try {
    const repos = await fetchUserRepos(token, { perPage: 50 });
    return NextResponse.json(repos);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch repos";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
