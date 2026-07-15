import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID?.trim() ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim() ?? "",
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        // With the database session strategy, `user` is the full adapter
        // record, so `selectedGithubRepo` is already present — no extra query
        // needed on every request. Fall back to a lookup only if it's absent,
        // and never let a transient DB error tear down the whole session.
        const repoFromUser = (
          user as { selectedGithubRepo?: string | null }
        ).selectedGithubRepo;

        if (typeof repoFromUser !== "undefined") {
          session.user.selectedGithubRepo = repoFromUser ?? null;
        } else {
          try {
            const row = await prisma.user.findUnique({
              where: { id: user.id },
              select: { selectedGithubRepo: true },
            });
            session.user.selectedGithubRepo = row?.selectedGithubRepo ?? null;
          } catch (err) {
            console.error("[auth] failed to load selectedGithubRepo", err);
            session.user.selectedGithubRepo = null;
          }
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET?.trim(),
  logger: {
    error(code, metadata) {
      console.error("[NextAuth Error]", code, metadata);
    },
  },
  events: {
    async signIn(message) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[NextAuth signIn]", message);
      }
    },
  },
};
