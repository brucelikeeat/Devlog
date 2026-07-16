"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DevlogLogo from "@/components/brand/DevlogLogo";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  GitBranch,
  Sparkles,
  FileText,
  CalendarDays,
  BarChart3,
  Settings,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/types/nav";
import { SidebarRepoSwitcher } from "./SidebarRepoSwitcher";

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Timeline", href: "/timeline", icon: GitBranch },
  { label: "Generate", href: "/generate", icon: Sparkles },
  { label: "Content", href: "/content", icon: FileText, disabled: true, soon: true },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, disabled: true, soon: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3, disabled: true, soon: true },
];

const bottomNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const displayName =
    session?.user?.name ?? session?.user?.email ?? "Signed in";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          title="Back to home"
        >
          <DevlogLogo
            width={120}
            color="#6B35D9"
            className="transition-opacity group-hover:opacity-80"
          />
        </Link>
      </div>

      {/* Repo switcher — click to open list of all GitHub repos */}
      <div className="px-3 pt-3">
        <SidebarRepoSwitcher />
      </div>

      {/* Section label */}
      <div className="px-4 pt-5 pb-1">
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">
          Workspace
        </p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        <div className="space-y-0.5">
          {mainNavItems.map((item) => (
            <SidebarNavLink key={item.label} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-800 px-2 py-2 space-y-0.5">
        {bottomNavItems.map((item) => (
          <SidebarNavLink key={item.label} item={item} pathname={pathname} />
        ))}

        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-all duration-150 group"
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to site</span>
        </Link>

        <div className="mt-1 space-y-1 rounded-md px-2 py-2 hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-500/20 text-xs font-semibold text-violet-300">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-xs font-medium text-zinc-300">
                {displayName}
              </div>
              <div className="truncate text-[10px] text-zinc-600">GitHub account</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <LogOut className="h-3 w-3" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarNavLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const isActive =
    !item.disabled &&
    (pathname === item.href || pathname.startsWith(item.href + "/"));

  if (item.disabled) {
    return (
      <div
        title="Coming soon"
        className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-700 cursor-not-allowed select-none"
      >
        <item.icon className="h-4 w-4 flex-shrink-0 text-zinc-700" />
        <span className="flex-1">{item.label}</span>
        {item.soon && (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-700 bg-zinc-800/60 rounded px-1.5 py-0.5">
            soon
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-all duration-150",
        isActive
          ? "bg-violet-500/10 text-violet-300 font-medium"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
      )}
    >
      <item.icon
        className={cn(
          "h-4 w-4 flex-shrink-0 transition-colors",
          isActive ? "text-violet-400" : "text-zinc-600",
        )}
      />
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && (
        <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-800 rounded px-1.5 py-0.5">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
