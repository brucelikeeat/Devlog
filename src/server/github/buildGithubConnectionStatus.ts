import type { Session } from "next-auth";
import type { GitHubConnectionStatus } from "@/lib/github/types";
import { prisma } from "@/lib/prisma";
import { getGithubAccessTokenForUser } from "./getGithubAccessToken";

export async function buildGithubConnectionStatus(
  session: Session,
): Promise<GitHubConnectionStatus> {
  const userId = session.user?.id;
  if (!userId) {
    return { connected: false, user: null, selectedRepo: null };
  }

  const token = await getGithubAccessTokenForUser(userId);
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { providerAccountId: true },
  });

  return {
    connected: !!token,
    user: account
      ? {
          login: account.providerAccountId,
          avatarUrl: session.user?.image ?? "",
        }
      : null,
    selectedRepo: session.user?.selectedGithubRepo ?? null,
  };
}
