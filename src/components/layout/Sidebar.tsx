"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronDown,
  Github,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/types/nav";

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Timeline", href: "/timeline", icon: GitBranch },
  { label: "Content", href: "/content", icon: FileText, disabled: true, soon: true },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, disabled: true, soon: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3, disabled: true, soon: true },
];

const bottomNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800 px-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          title="Back to home"
        >
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-violet-500 transition-colors group-hover:bg-violet-400">
            <span className="font-mono text-[11px] font-bold text-white tracking-tight">DL</span>
          </div>
          <span className="font-semibold text-zinc-100 tracking-tight group-hover:text-violet-300 transition-colors">
            Devlog
          </span>
        </Link>
        <button className="ml-auto text-zinc-600 hover:text-zinc-400 transition-colors">
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Repo selector */}
      <div className="px-3 pt-3">
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors border border-dashed border-zinc-800 hover:border-zinc-700">
          <Github className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">No repo connected</span>
          <ChevronDown className="ml-auto h-3 w-3 flex-shrink-0" />
        </button>
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
            <SidebarNavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-800 px-2 py-2 space-y-0.5">
        {bottomNavItems.map((item) => (
          <SidebarNavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {/* Back to landing */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-all duration-150 group"
        >
          <ArrowLeft className="h-4 w-4 flex-shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to site</span>
        </Link>

        {/* User profile */}
        <button className="mt-1 flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm hover:bg-zinc-800 transition-colors group">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-300">
            BL
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-xs font-medium text-zinc-300 truncate">bruceliu</div>
            <div className="text-[10px] text-zinc-600 truncate">Free plan</div>
          </div>
          <ChevronDown className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
        </button>
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
    pathname === item.href || pathname.startsWith(item.href + "/");

  if (item.disabled) {
    return (
      <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-700 cursor-not-allowed select-none">
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
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
      )}
    >
      <item.icon
        className={cn(
          "h-4 w-4 flex-shrink-0 transition-colors",
          isActive ? "text-violet-400" : "text-zinc-600"
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
