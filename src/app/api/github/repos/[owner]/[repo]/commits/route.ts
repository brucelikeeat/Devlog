import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fetchRepoCommits } from "@/lib/github/api";

export async function GET(
  _request: Request,
  { params }: { params: { owner: string; repo: string } },
) {
  const token = cookies().get("github_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not connected to GitHub" },
      { status: 401 },
    );
  }

  try {
    const commits = await fetchRepoCommits(token, params.owner, params.repo, {
      perPage: 20,
    });
    return NextResponse.json(commits);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch commits";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
