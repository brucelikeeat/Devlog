import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

if (process.env.NODE_ENV !== "production") {
  console.log("[ENV CHECK]", {
    hasClientId: !!process.env.GITHUB_CLIENT_ID,
    hasClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
  });
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
