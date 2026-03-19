"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, GitBranch, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview",
  },
  {
    href: "/timeline",
    label: "Timeline",
    icon: GitBranch,
    description: "Build journey",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    description: "Preferences",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-zinc-800 lg:bg-zinc-950/95 lg:backdrop-blur">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-100">Devlog</p>
              <p className="text-xs text-zinc-500">Turn your code into content</p>
            </div>
          </Link>
        </div>

        <div className="mb-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
            Workspace
          </p>
          <p className="mt-3 text-sm font-medium text-zinc-200">devlog</p>
          <p className="mt-1 text-sm text-zinc-500">
            Private build journal and content engine
          </p>
        </div>

        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors",
                  isActive
                    ? "border-violet-500/20 bg-violet-500/10 text-zinc-100"
                    : "border-transparent text-zinc-400 hover:border-zinc-800 hover:bg-zinc-900/60 hover:text-zinc-200",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border",
                    isActive
                      ? "border-violet-500/20 bg-violet-500/10 text-violet-400"
                      : "border-zinc-800 bg-zinc-900 text-zinc-500",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
            Plan
          </p>
          <p className="mt-2 text-sm font-medium text-zinc-200">Builder</p>
          <p className="mt-1 text-sm text-zinc-500">
            Timeline, drafts, and privacy controls
          </p>
        </div>
      </div>
    </aside>
  );
}
