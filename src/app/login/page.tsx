import Link from "next/link";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  describeHostMismatch,
  getAuthConfigIssues,
} from "@/lib/auth-config-health";
import { LoginWithGithub } from "./LoginWithGithub";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string | string[]; error?: string | string[] };
}) {
  const session = await getServerSession(authOptions);
  const rawCb = searchParams.callbackUrl;
  const callbackUrl =
    typeof rawCb === "string" && rawCb.startsWith("/") ? rawCb : "/dashboard";

  if (session) {
    redirect(callbackUrl);
  }

  const rawError = searchParams.error;
  const error = typeof rawError === "string" ? rawError : undefined;

  const configIssues = getAuthConfigIssues();
  const headerHost =
    headers().get("x-forwarded-host") ?? headers().get("host") ?? "";
  const hostMismatch = describeHostMismatch(headerHost);

  const oauthSigninHint =
    error === "OAuthSignin"
      ? "NextAuth could not start the GitHub OAuth request. The checklist below fixes almost all cases."
      : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/40 p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-violet-500">
            <span className="font-mono text-sm font-bold text-white">DL</span>
          </div>
          <h1 className="text-lg font-semibold text-zinc-100">Sign in to Devlog</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Use your GitHub account. We request repo access so you can pick a
            repository and load commits into your timeline.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-left text-xs text-red-200">
            <p className="font-medium">Sign-in error: {error}</p>
            {oauthSigninHint && (
              <p className="mt-2 text-red-300/90">{oauthSigninHint}</p>
            )}
          </div>
        )}

        {hostMismatch && (
          <div className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-left text-xs text-amber-100">
            <p className="font-medium text-amber-200">URL / port mismatch</p>
            <p className="mt-2 whitespace-pre-wrap text-amber-100/90">
              {hostMismatch}
            </p>
          </div>
        )}

        {configIssues.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-left">
            <p className="text-xs font-medium text-amber-200">
              Fix your <span className="font-mono">.env.local</span> (then restart{" "}
              <span className="font-mono">npm run dev</span>):
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-xs text-amber-100/90">
              {configIssues.map((issue) => (
                <li key={issue.code}>{issue.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-left text-[11px] leading-relaxed text-zinc-500">
          <p className="font-medium text-zinc-400">GitHub OAuth App</p>
          <p className="mt-1">
            Authorization callback URL must be exactly:
          </p>
          <p className="mt-1 font-mono text-zinc-400 break-all">
            {(process.env.NEXTAUTH_URL?.trim() || "http://localhost:3000").replace(
              /\/$/,
              "",
            )}
            /api/auth/callback/github
          </p>
        </div>

        <LoginWithGithub callbackUrl={callbackUrl} />

        <p className="mt-6 text-center text-xs text-zinc-600">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
