import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/github/oauth";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "GITHUB_CLIENT_ID is not configured" },
      { status: 500 },
    );
  }

  const callbackUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/github/callback`;
  const authUrl = buildAuthUrl(clientId, callbackUrl);

  return NextResponse.redirect(authUrl);
}
