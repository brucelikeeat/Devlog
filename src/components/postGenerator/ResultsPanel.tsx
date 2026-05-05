"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ── Types ──────────────────────────────────────────────────────────────────

type Platform = "x" | "linkedin" | "reddit";

type PostResult = {
  platform: Platform;
  content: string;
  characterCount: number;
};

type Props = {
  posts: PostResult[];
  onRegenerate: (platform: Platform) => void;
  regenerating: Platform[];
};

// ── Platform display config ────────────────────────────────────────────────

type PlatformCfg = {
  label: string;
  charLimit: number | null;
};

const PLATFORM_CFG: Record<Platform, PlatformCfg> = {
  x:        { label: "X (Twitter)", charLimit: 280 },
  linkedin: { label: "LinkedIn",    charLimit: null },
  reddit:   { label: "Reddit",      charLimit: null },
};

// ── Auto-resize helper ─────────────────────────────────────────────────────

function useAutoResize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return ref;
}

// ── Copy button ────────────────────────────────────────────────────────────

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available (e.g. non-HTTPS) — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy to clipboard"}
      className={cn(
        "flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-medium transition-colors",
        copied
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200",
      )}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  );
}

// ── Post card ──────────────────────────────────────────────────────────────

type CardProps = {
  post: PostResult;
  isRegenerating: boolean;
  onRegenerate: () => void;
};

function PostCard({ post, isRegenerating, onRegenerate }: CardProps) {
  const { platform, content } = post;
  const cfg = PLATFORM_CFG[platform];

  const [text, setText] = useState(content);
  const textareaRef = useAutoResize(text);
  const charCount = text.length;
  const overLimit =
    cfg.charLimit !== null && charCount > cfg.charLimit;

  // Sync incoming content (e.g. after a regeneration)
  useEffect(() => {
    setText(content);
  }, [content]);

  const getText = useCallback(() => text, [text]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      {/* Card header */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <span className="text-sm font-medium text-zinc-200">{cfg.label}</span>

        <div className="flex items-center gap-2">
          <CopyButton getText={getText} />

          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            title="Regenerate"
            className={cn(
              "flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-medium transition-colors",
              isRegenerating
                ? "cursor-not-allowed border-zinc-800 text-zinc-600"
                : "border-zinc-700 bg-zinc-800/60 text-zinc-400 hover:border-violet-500/50 hover:text-violet-300",
            )}
          >
            {isRegenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {isRegenerating ? "Regenerating…" : "Regenerate"}
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="px-4 pb-4 pt-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full resize-none overflow-hidden rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm leading-relaxed text-zinc-200 placeholder-zinc-700 outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
        />

        {/* Character counter */}
        <div className="mt-1.5 flex justify-end">
          <span
            className={cn(
              "font-mono text-[11px] tabular-nums",
              overLimit
                ? "text-red-400"
                : cfg.charLimit !== null && charCount > cfg.charLimit * 0.9
                  ? "text-amber-400"
                  : "text-zinc-600",
            )}
          >
            {cfg.charLimit !== null
              ? `${charCount} / ${cfg.charLimit}`
              : charCount}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── ResultsPanel ───────────────────────────────────────────────────────────

export function ResultsPanel({ posts, onRegenerate, regenerating }: Props) {
  const regeneratingSet = new Set(regenerating);

  if (posts.length === 0) return null;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.platform}
          post={post}
          isRegenerating={regeneratingSet.has(post.platform)}
          onRegenerate={() => onRegenerate(post.platform)}
        />
      ))}
    </div>
  );
}
