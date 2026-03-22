import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { GitHubConnectionStatus } from "@/lib/github/types";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("github_token")?.value;
  const userRaw = cookieStore.get("github_user")?.value;
  const selectedRepo = cookieStore.get("github_repo")?.value ?? null;

  if (!token || !userRaw) {
    const status: GitHubConnectionStatus = {
      connected: false,
      user: null,
      selectedRepo: null,
    };
    return NextResponse.json(status);
  }

  let user: { login: string; avatarUrl: string } | null = null;
  try {
    user = JSON.parse(userRaw);
  } catch {
    user = null;
  }

  const status: GitHubConnectionStatus = {
    connected: true,
    user,
    selectedRepo,
  };

  return NextResponse.json(status);
}
