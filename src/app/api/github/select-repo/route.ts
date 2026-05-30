import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { repo } = body as { repo: string | null };

    const value =
      typeof repo === "string" && repo.trim().length > 0 ? repo.trim() : null;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { selectedGithubRepo: value },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[github/select-repo] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
