import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import type { GitHubConnectionStatus } from "@/lib/github/types";
import { buildGithubConnectionStatus } from "@/server/github/buildGithubConnectionStatus";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    const status: GitHubConnectionStatus = {
      connected: false,
      user: null,
      selectedRepo: null,
    };
    return NextResponse.json(status);
  }

  const status = await buildGithubConnectionStatus(session);
  return NextResponse.json(status);
}
