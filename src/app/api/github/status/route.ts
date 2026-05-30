import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import type { GitHubConnectionStatus } from "@/lib/github/types";
import { prisma } from "@/lib/prisma";
import { getGithubAccessTokenForUser } from "@/server/github/getGithubAccessToken";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      const status: GitHubConnectionStatus = {
        connected: false,
        user: null,
        selectedRepo: null,
      };
      return NextResponse.json(status);
    }

    const token = await getGithubAccessTokenForUser(session.user.id);
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { providerAccountId: true },
    });

    const status: GitHubConnectionStatus = {
      connected: !!token,
      user: account
        ? {
            login: account.providerAccountId,
            avatarUrl: session.user.image ?? "",
          }
        : null,
      selectedRepo: session.user.selectedGithubRepo,
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error("[github/status] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
