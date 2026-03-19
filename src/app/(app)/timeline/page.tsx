import { Topbar } from "@/components/layout/Topbar";
import { TimelineView } from "@/components/timeline";
import { TIMELINE_ENTRIES } from "@/features/timeline/data";

export const metadata = {
  title: "Timeline",
};

export default function TimelinePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dev Timeline"
        description="Your complete build journey, commit by commit"
      />
      <main className="flex-1 p-6 animate-fade-in">
        <TimelineView entries={TIMELINE_ENTRIES} />
      </main>
    </div>
  );
}
