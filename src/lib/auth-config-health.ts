import "server-only";

export type AuthConfigIssue = { code: string; message: string };

const PLACEHOLDER_SECRETS = new Set([
  "replace-with-openssl-rand-base64-32",
  "",
]);

export function getAuthConfigIssues(): AuthConfigIssue[] {
  const issues: AuthConfigIssue[] = [];
  const id = process.env.GITHUB_CLIENT_ID?.trim();
  const ghSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  const nsecret = process.env.NEXTAUTH_SECRET?.trim();
  const url = process.env.NEXTAUTH_URL?.trim();

  if (!id) {
    issues.push({
      code: "missing_client_id",
      message:
        "GITHUB_CLIENT_ID is empty. Add it from GitHub → Settings → Developer settings → OAuth Apps → your app.",
    });
  }
  if (!ghSecret) {
    issues.push({
      code: "missing_client_secret",
      message: "GITHUB_CLIENT_SECRET is empty. Generate a client secret on the same GitHub OAuth App page.",
    });
  }
  if (!nsecret || PLACEHOLDER_SECRETS.has(nsecret)) {
    issues.push({
      code: "nextauth_secret",
      message:
        "NEXTAUTH_SECRET must be a strong random value (run: openssl rand -base64 32). Do not use the placeholder text.",
    });
  }
  if (!url) {
    issues.push({
      code: "missing_nextauth_url",
      message: "NEXTAUTH_URL is missing. Example: http://localhost:3000",
    });
  }

  return issues;
}

export function describeHostMismatch(requestHost: string): string | null {
  const url = process.env.NEXTAUTH_URL?.trim();
  if (!url || !requestHost) return null;
  try {
    const expectedHost = new URL(url).host;
    if (expectedHost !== requestHost) {
      return `You are on http://${requestHost} but NEXTAUTH_URL is ${url}. They must match (including port). Either open the app on that URL, or set NEXTAUTH_URL to http://${requestHost} and add this GitHub callback: http://${requestHost}/api/auth/callback/github`;
    }
  } catch {
    return "NEXTAUTH_URL is not a valid URL. Fix it in .env.local.";
  }
  return null;
}
