"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/**
 * If the user already has a session but somehow lands on /login (stale RSC
 * payload, soft-nav glitch, etc.), hard-navigate to the app so they aren't
 * stuck staring at the sign-in card.
 */
export function LoginSessionRedirect({
  callbackUrl,
}: {
  callbackUrl: string;
}) {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    const target =
      typeof callbackUrl === "string" && callbackUrl.startsWith("/")
        ? callbackUrl
        : "/dashboard";
    window.location.replace(target);
  }, [status, callbackUrl]);

  if (status === "authenticated") {
    return (
      <p className="mb-4 text-center text-xs text-zinc-500">
        You&apos;re already signed in — taking you to the app…
      </p>
    );
  }

  return null;
}
