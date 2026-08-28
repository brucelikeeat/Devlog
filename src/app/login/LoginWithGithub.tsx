"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Github, Loader2 } from "lucide-react";

export function LoginWithGithub({ callbackUrl }: { callbackUrl: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    // Guard against double-clicks kicking off two OAuth handshakes.
    if (loading) return;
    setLoading(true);
    try {
      await signIn("github", { callbackUrl });
    } catch {
      // signIn normally redirects; if it throws we re-enable the button so the
      // user can retry instead of being stuck on a dead spinner.
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignIn}
      disabled={loading}
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
