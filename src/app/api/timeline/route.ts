import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { fetchTimelineEntries } from "@/server/timeline/fetchTimelineEntries";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await fetchTimelineEntries(session.user.id);

  if (!result.ok) {
    const status = result.reason === "unauthenticated" ? 401 : result.reason === "no_repo" ? 400 : 500;
    return NextResponse.json({ error: result.message }, { status });
  }

  return NextResponse.json(result.entries);
}
