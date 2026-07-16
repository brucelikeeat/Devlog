"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Github, Loader2 } from "lucide-react";

export function LoginWithGithub({ callbackUrl }: { callbackUrl: string }) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (loading) return;

    // Already signed in — leave /login immediately.
    if (status === "authenticated") {
      window.location.replace(callbackUrl);
      return;
    }

    setLoading(true);

    // Safety valve: if the OAuth redirect never happens, re-enable the button.
    const timeout = window.setTimeout(() => setLoading(false), 12000);

    try {
      await signIn("github", { callbackUrl, redirect: true });
    } catch {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={loading || status === "loading"}
      aria-busy={loading}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecting to GitHub…
        </>
      ) : (
        <>
          <Github className="h-4 w-4" />
          Continue with GitHub
        </>
      )}
    </button>
  );
}
