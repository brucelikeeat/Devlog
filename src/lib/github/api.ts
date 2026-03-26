import type { GitHubRepo, GitHubCommit } from "./types";

const GITHUB_API_BASE = "https://api.github.com";

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
  };
}

export async function fetchUserRepos(
  token: string,
  options: { sort?: string; perPage?: number } = {},
): Promise<GitHubRepo[]> {
  const { sort = "pushed", perPage = 30 } = options;
  const params = new URLSearchParams({
    sort,
    per_page: String(perPage),
    direction: "desc",
  });

  const res = await fetch(`${GITHUB_API_BASE}/user/repos?${params}`, {
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch repos: ${res.status}`);
  }

  return res.json();
}

export async function fetchRepoCommits(
  token: string,
  owner: string,
  repo: string,
  options: { perPage?: number; sha?: string } = {},
): Promise<GitHubCommit[]> {
  const { perPage = 20, sha } = options;
  const params = new URLSearchParams({ per_page: String(perPage) });
  if (sha) params.set("sha", sha);

  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${params}`,
    { headers: authHeaders(token) },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch commits: ${res.status}`);
  }

  return res.json();
}
