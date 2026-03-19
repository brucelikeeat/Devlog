import { Bell, Search } from "lucide-react";

interface TopbarProps {
  title: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-violet-400">
            Devlog
          </p>
          <h1 className="mt-1 text-xl font-semibold text-zinc-100">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 sm:flex">
            <Search className="h-4 w-4" />
            Search
            <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500">
              cmd+k
            </span>
          </button>

          <button className="relative rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
