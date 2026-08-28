import { Bell, Search } from "lucide-react";

interface TopbarProps {
  title: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-6 sticky top-0 z-30">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-zinc-100 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[11px] text-zinc-500 truncate mt-0.5">{description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="hidden md:flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 transition-colors">
          <Search className="h-3 w-3" />
          <span>Search...</span>
          <kbd className="ml-2 font-mono text-[10px] text-zinc-700 border border-zinc-700 rounded px-1">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 ring-2 ring-zinc-950" />
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-zinc-800" />

        {/* Avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-300 hover:bg-violet-500/30 transition-colors">
          BL
        </button>
      </div>
    </header>
  );
}
