import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fetchUserRepos } from "@/lib/github/api";

export async function GET() {
  const token = cookies().get("github_token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not connected to GitHub" },
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
