import { NextResponse } from "next/server";
import { exchangeCodeForToken, fetchAuthenticatedUser } from "@/lib/github/oauth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/settings?github_error=${encodeURIComponent(error)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/settings?github_error=no_code`,
    );
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/settings?github_error=missing_config`,
    );
  }

  try {
    const tokenData = await exchangeCodeForToken(code, clientId, clientSecret);
    const user = await fetchAuthenticatedUser(tokenData.access_token);

    const response = NextResponse.redirect(`${baseUrl}/settings?github_connected=true`);

    response.cookies.set("github_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set(
      "github_user",
      JSON.stringify({ login: user.login, avatarUrl: user.avatar_url }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      },
    );

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(
      `${baseUrl}/settings?github_error=${encodeURIComponent(message)}`,
    );
  }
}
