import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DevlogLogo from "@/components/brand/DevlogLogo";
import { LoginWithGithub } from "./LoginWithGithub";
import { LoginSessionRedirect } from "./LoginSessionRedirect";

export const dynamic = "force-dynamic";

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
    typeof rawCb === "string" && rawCb.startsWith("/") && !rawCb.startsWith("//")
      ? rawCb
      : "/dashboard";

  if (session) {
    redirect(callbackUrl);
  }

  const rawError = searchParams.error;
  const error = typeof rawError === "string" ? rawError : undefined;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/40 p-8">
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <DevlogLogo width={150} color="#a78bfa" />
          </div>
          <h1 className="text-lg font-semibold text-zinc-100">Sign in to Devlog</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Use your GitHub account. We request repo access so you can pick a
            repository and load commits into your timeline.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-center text-xs text-red-300">
            Sign-in failed ({error}). Check your environment variables and try
            again.
          </div>
        )}

        <LoginSessionRedirect callbackUrl={callbackUrl} />
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
