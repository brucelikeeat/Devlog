import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    const path = headers().get("x-pathname") ?? "/dashboard";
    const callback =
      path.startsWith("/") && !path.startsWith("//") && path !== "/login"
        ? path
        : "/dashboard";
    redirect(`/login?callbackUrl=${encodeURIComponent(callback)}`);
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <div className="relative z-0 flex min-h-screen flex-1 flex-col pl-60">
        {children}
      </div>
    </div>
  );
}
