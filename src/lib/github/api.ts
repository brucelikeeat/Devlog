import type { GitHubRepo, GitHubCommit, GitHubPullRequest, GitHubRelease } from "./types";

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
  if (!token) {
    throw new Error("fetchUserRepos: GitHub access token is missing.");
  }

  const { sort = "pushed", perPage = 50 } = options;
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
  if (!token) {
    throw new Error("fetchRepoCommits: GitHub access token is missing.");
  }

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

export async function fetchRepoPullRequests(
  token: string,
  owner: string,
  repo: string,
  options: { perPage?: number } = {},
): Promise<GitHubPullRequest[]> {
  if (!token) {
    throw new Error("fetchRepoPullRequests: GitHub access token is missing.");
  }

  const { perPage = 20 } = options;
  const params = new URLSearchParams({
    state: "closed",
    sort: "updated",
    per_page: String(perPage),
  });

  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?${params}`,
    { headers: authHeaders(token) },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch pull requests: ${res.status}`);
  }

  return res.json();
}

export async function fetchRepoReleases(
  token: string,
  owner: string,
  repo: string,
  options: { perPage?: number } = {},
): Promise<GitHubRelease[]> {
  if (!token) {
    throw new Error("fetchRepoReleases: GitHub access token is missing.");
  }

  const { perPage = 10 } = options;
  const params = new URLSearchParams({
    per_page: String(perPage),
  });

  const res = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases?${params}`,
    { headers: authHeaders(token) },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch releases: ${res.status}`);
  }

  return res.json();
}
