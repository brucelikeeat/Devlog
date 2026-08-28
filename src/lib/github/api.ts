import type {
  GitHubRepo,
  GitHubCommit,
  GitHubPullRequest,
  GitHubRelease,
} from "./types";

const GITHUB_API_BASE = "https://api.github.com";

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    // GitHub rejects requests with no User-Agent.
    "User-Agent": "Devlog-App",
  };
}

async function githubFetch<T>(
  token: string,
  path: string,
  label: string,
): Promise<T> {
  if (!token) {
    throw new Error(`${label}: GitHub access token is missing.`);
  }

  const res = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: authHeaders(token),
    // Next.js caches fetch() by default — never cache authenticated GitHub calls.
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { message?: string };
      if (body?.message) detail = `: ${body.message}`;
    } catch {
      // ignore non-JSON error bodies
    }

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `${label} failed (${res.status})${detail}. Reconnect GitHub in Settings.`,
      );
    }

    throw new Error(`${label} failed (${res.status})${detail}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchUserRepos(
  token: string,
  options: { sort?: string; perPage?: number } = {},
): Promise<GitHubRepo[]> {
  const { sort = "pushed", perPage = 50 } = options;
  const params = new URLSearchParams({
    sort,
    per_page: String(perPage),
    direction: "desc",
  });

  return githubFetch<GitHubRepo[]>(
    token,
    `/user/repos?${params}`,
    "Failed to fetch repos",
  );
}

export async function fetchRepoCommits(
  token: string,
  owner: string,
  repo: string,
  options: { perPage?: number; sha?: string } = {},
): Promise<GitHubCommit[]> {
  const { perPage = 30, sha } = options;
  const params = new URLSearchParams({ per_page: String(perPage) });
  if (sha) params.set("sha", sha);

  try {
    return await githubFetch<GitHubCommit[]>(
      token,
      `/repos/${owner}/${repo}/commits?${params}`,
      "Failed to fetch commits",
    );
  } catch (err) {
    // GitHub returns 409 when the repository has no commits yet.
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("(409)")) return [];
    throw err;
  }
}

export async function fetchRepoPullRequests(
  token: string,
  owner: string,
  repo: string,
  options: { perPage?: number } = {},
): Promise<GitHubPullRequest[]> {
  const { perPage = 30 } = options;
  const params = new URLSearchParams({
    state: "all",
    sort: "updated",
    direction: "desc",
    per_page: String(perPage),
  });

  return githubFetch<GitHubPullRequest[]>(
    token,
    `/repos/${owner}/${repo}/pulls?${params}`,
    "Failed to fetch pull requests",
  );
}

export async function fetchRepoReleases(
  token: string,
  owner: string,
  repo: string,
  options: { perPage?: number } = {},
): Promise<GitHubRelease[]> {
  const { perPage = 20 } = options;
  const params = new URLSearchParams({
    per_page: String(perPage),
  });

  return githubFetch<GitHubRelease[]>(
    token,
    `/repos/${owner}/${repo}/releases?${params}`,
    "Failed to fetch releases",
  );
}
