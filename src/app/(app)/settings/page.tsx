import { Topbar } from "@/components/layout/Topbar";
import {
  Github,
  Bell,
  Lock,
  CreditCard,
  User,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Settings"
        description="Manage your account, integrations, and preferences"
      />

      <main className="flex-1 animate-fade-in p-6">
        <div className="max-w-2xl space-y-5">
          <SettingsSection
            icon={User}
            title="Profile"
            description="Your account information"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-lg font-semibold text-violet-300">
                BL
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-100">bruceliu</p>
                <p className="text-xs text-zinc-500">bruce@example.com</p>
              </div>
              <button className="flex-shrink-0 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200">
                Edit profile
              </button>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Github}
            title="GitHub Integration"
            description="Connected repositories and webhook status"
          >
            <div className="rounded-lg border border-dashed border-zinc-700 p-6 text-center">
              <Github className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
              <p className="mb-1 text-sm text-zinc-400">No repositories connected</p>
              <p className="mx-auto mb-4 max-w-xs text-xs leading-relaxed text-zinc-600">
                Connect a GitHub repo to start tracking activity and generating
                content from your commits.
              </p>
              <button className="inline-flex items-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700">
                <Github className="h-3.5 w-3.5" />
                Connect GitHub
              </button>
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Lock}
            title="Privacy Controls"
            description="Control how much detail appears in generated content"
          >
            <div className="space-y-2">
              {privacyLevels.map((level) => (
                <label
                  key={level.name}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-colors ${
                    level.selected
                      ? "border-violet-500/40 bg-violet-500/5"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border transition-colors ${
                      level.selected
                        ? "border-violet-500 bg-violet-500"
                        : "border-zinc-600"
                    }`}
                  >
                    {level.selected && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{level.name}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                      {level.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            icon={Bell}
            title="Notifications"
            description="When and how Devlog alerts you"
          >
            <div className="space-y-4">
              {notifications.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.description}</p>
                  </div>
                  <button
                    className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
                      item.enabled ? "bg-violet-500" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        item.enabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </SettingsSection>

          <SettingsSection
            icon={CreditCard}
            title="Plan"
            description="Your current subscription"
          >
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-sm font-medium text-zinc-100">Free</p>
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Current
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  1 repo · 10 posts/month · No scheduling
                </p>
              </div>
              <button className="flex items-center gap-1 text-xs text-violet-400 transition-colors hover:text-violet-300">
                Upgrade to Pro
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
              <p className="mb-1 text-sm font-medium text-violet-300">Devlog Pro</p>
              <ul className="mb-3 space-y-1 text-xs text-zinc-400">
                <li>Unlimited generation</li>
                <li>Scheduling + content calendar</li>
                <li>Tone presets + platform templates</li>
                <li>Multi-platform publishing</li>
              </ul>
              <button className="rounded-md bg-violet-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-400">
                Upgrade — coming soon
              </button>
            </div>
          </SettingsSection>
        </div>
      </main>
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4">
        <Icon className="h-4 w-4 flex-shrink-0 text-zinc-500" />
        <div>
          <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const privacyLevels = [
  {
    name: "High Privacy",
    description:
      "Commit messages and high-level summaries only. No code, file paths, or implementation details in generated content.",
    selected: true,
  },
  {
    name: "Medium Privacy",
    description:
      "Describes behavior and impact without exposing sensitive internals, algorithm details, or file paths.",
    selected: false,
  },
  {
    name: "Low Privacy",
    description:
      "Best for open-source. Allows specific feature mentions, links, and more technical detail in generated content.",
    selected: false,
  },
];

const notifications = [
  {
    label: "Post drafts ready",
    description: "When Devlog generates a new post from your GitHub activity",
    enabled: true,
  },
  {
    label: "Weekly digest",
    description: "A summary of your build activity every Monday",
    enabled: false,
  },
  {
    label: "Publishing confirmations",
    description: "When a post is successfully published to a platform",
    enabled: true,
  },
];
