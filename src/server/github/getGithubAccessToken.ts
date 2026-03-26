import { prisma } from "@/lib/prisma";

export async function getGithubAccessTokenForUser(
  userId: string,
): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  });
  return account?.access_token ?? null;
}
