"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";

export function LoginWithGithub({ callbackUrl }: { callbackUrl: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn("github", { callbackUrl })}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
    >
      <Github className="h-4 w-4" />
      Continue with GitHub
    </button>
  );
}
