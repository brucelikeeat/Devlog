import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { repo } = body as { repo: string | null };

  const response = NextResponse.json({ ok: true });

  if (repo) {
    response.cookies.set("github_repo", repo, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    response.cookies.set("github_repo", "", { maxAge: 0, path: "/" });
  }

  return response;
}
