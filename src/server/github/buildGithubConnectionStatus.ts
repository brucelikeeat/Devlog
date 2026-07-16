import type { Session } from "next-auth";
import type { GitHubConnectionStatus } from "@/lib/github/types";
import { fetchAuthenticatedUser } from "@/lib/github/api";
import { getGithubAccessTokenForUser } from "./getGithubAccessToken";

export async function buildGithubConnectionStatus(
  session: Session,
): Promise<GitHubConnectionStatus> {
  const userId = session.user?.id;
  if (!userId) {
    return { connected: false, user: null, selectedRepo: null };
  }

  const token = await getGithubAccessTokenForUser(userId);
  if (!token) {
    return {
      connected: false,
      user: null,
      selectedRepo: session.user?.selectedGithubRepo ?? null,
    };
  }

  // Prefer the live GitHub login over providerAccountId (which is a numeric id).
  let login = session.user?.name ?? "github-user";
  let avatarUrl = session.user?.image ?? "";
  try {
    const ghUser = await fetchAuthenticatedUser(token);
    login = ghUser.login;
    avatarUrl = ghUser.avatar_url || avatarUrl;
  } catch {
    // Keep session fallbacks if the /user call fails.
  }

  return {
    connected: true,
    user: { login, avatarUrl },
    selectedRepo: session.user?.selectedGithubRepo ?? null,
  };
}
