import { Topbar } from "@/components/layout/Topbar";

const SECTIONS = [
  {
    title: "Privacy controls",
    description: "Choose how much implementation detail Devlog can surface in summaries and drafts.",
  },
  {
    title: "Platforms & tone",
    description: "Control voice, formatting, and platform-specific framing for X, LinkedIn, and Reddit.",
  },
  {
    title: "Repository preferences",
    description: "Manage connected repos, active branches, and event sources for your timeline.",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar
        title="Settings"
        description="Configure privacy, tone, and repository behavior"
      />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
            >
              <h2 className="text-sm font-medium text-zinc-100">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {section.description}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
